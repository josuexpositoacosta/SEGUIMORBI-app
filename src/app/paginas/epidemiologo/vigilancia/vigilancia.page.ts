import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { AvisosService } from 'src/app/compartido/avisos.service';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { hoyIso, sumarDias } from 'src/app/compartido/fechas';
import { CurvaEpidemicaComponent } from 'src/app/compartido/graficos/curva-epidemica.component';
import { mensajeDeError } from 'src/app/core/http/errores';
import { AreaSalud } from 'src/app/core/models/area-salud';
import { Clasificacion, DesenlaceCaso } from 'src/app/core/models/caso';
import {
  AreaVigilancia, CriterioFecha, FiltroVigilancia, ResumenVigilancia, SemanaVigilancia,
} from 'src/app/core/models/vigilancia';
import { AreaSaludService } from 'src/app/core/services/area-salud.service';
import { DesenlaceService } from 'src/app/core/services/desenlace.service';
import { VigilanciaService } from 'src/app/core/services/vigilancia.service';

type Periodo = 4 | 12 | 26 | 52;
type Pestana = 'resumen' | 'curva' | 'clinica' | 'areas';

const SERIES: { clave: Clasificacion; nombre: string; color: string }[] = [
  { clave: 'SOSPECHOSO', nombre: 'Sospechoso', color: 'var(--serie-sospechoso)' },
  { clave: 'PROBABLE', nombre: 'Probable', color: 'var(--serie-probable)' },
  { clave: 'CONFIRMADO', nombre: 'Confirmado', color: 'var(--serie-confirmado)' },
  { clave: 'DESCARTADO', nombre: 'Descartado', color: 'var(--serie-descartado)' },
];

/** Panel de vigilancia epidemiológica (solo EPIDEMIOLOGO). */
@Component({
  selector: 'app-vigilancia',
  imports: [CommonModule, IonicModule, EstadoVacioComponent, CurvaEpidemicaComponent, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './vigilancia.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./vigilancia.page.css'],
})
export class VigilanciaPage implements OnInit {
  private readonly api = inject(VigilanciaService);
  private readonly areasApi = inject(AreaSaludService);
  private readonly desenlacesApi = inject(DesenlaceService);
  private readonly avisos = inject(AvisosService);

  readonly series = SERIES;
  /** Las tres clasificaciones activas, para las tarjetas del resumen. */
  readonly seriesPrincipales = [
    { clave: 'CONFIRMADO' as Clasificacion, plural: 'Confirmados', clase: 'confirmado' },
    { clave: 'PROBABLE' as Clasificacion, plural: 'Probables', clase: 'probable' },
    { clave: 'SOSPECHOSO' as Clasificacion, plural: 'Sospechosos', clase: 'sospechoso' },
  ];
  readonly periodos: { valor: Periodo; nombre: string }[] = [
    { valor: 4, nombre: '4 sem.' },
    { valor: 12, nombre: '12 sem.' },
    { valor: 26, nombre: '26 sem.' },
    { valor: 52, nombre: '1 año' },
  ];
  readonly pestanas: { id: Pestana; nombre: string; icono: string }[] = [
    { id: 'resumen', nombre: 'Resumen', icono: 'grid-outline' },
    { id: 'curva', nombre: 'Curva epidémica', icono: 'bar-chart-outline' },
    { id: 'clinica', nombre: 'Clínica', icono: 'medkit-outline' },
    { id: 'areas', nombre: 'Áreas', icono: 'map-outline' },
  ];
  readonly pestana = signal<Pestana>('resumen');
  readonly periodo = signal<Periodo>(12);
  readonly areaSaludId = signal<number | null>(null);
  readonly criterio = signal<CriterioFecha>('INICIO_SINTOMAS');

  readonly areasCatalogo = signal<AreaSalud[]>([]);
  readonly desenlaces = signal<Map<string, DesenlaceCaso>>(new Map());
  readonly resumen = signal<ResumenVigilancia | null>(null);
  readonly semanas = signal<SemanaVigilancia[]>([]);
  readonly porArea = signal<AreaVigilancia[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly descargando = signal(false);

  readonly areasOrdenadas = computed(() => [...this.porArea()].sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, 'es')));
  readonly maxArea = computed(() => Math.max(1, ...this.porArea().map(a => a.total)));
  readonly desenlacesResumen = computed(() => Object.entries(this.resumen()?.porDesenlace ?? {})
    .map(([codigo, total]) => ({ nombre: this.desenlaces().get(codigo)?.nombre ?? codigo, total }))
    .sort((a, b) => b.total - a.total));

  readonly indicadoresClinicos = computed(() => {
    const r = this.resumen();
    if (!r) {
      return [];
    }
    return [
      { nombre: 'Confirmados', valor: `${new Intl.NumberFormat('es', { maximumFractionDigits: 1 }).format(r.porcentajeConfirmados)} %`, nota: 'del total de casos', icono: 'checkmark-circle-outline' },
      { nombre: 'Hospitalizados', valor: r.hospitalizados, nota: 'con ingreso', icono: 'bed-outline' },
      { nombre: 'Formas neuroinvasivas', valor: r.neuroinvasivos, nota: 'casos con afectación neurológica', icono: 'pulse-outline' },
      { nombre: 'Gestantes', valor: r.gestantes, nota: 'embarazadas en el periodo', icono: 'woman-outline' },
      { nombre: 'Recaídas', valor: r.recaidas, nota: 'casos con recaída', icono: 'refresh-outline' },
      { nombre: 'Con laboratorio', valor: r.conLaboratorio, nota: 'con prueba de Oropouche', icono: 'flask-outline' },
    ];
  });

  private filtro(): FiltroVigilancia {
    const hasta = hoyIso();
    return { desde: sumarDias(hasta, -7 * this.periodo() + 1), hasta, areaSaludId: this.areaSaludId(), criterio: this.criterio() };
  }

  ngOnInit(): void {
    this.areasApi.listar().subscribe({ next: a => this.areasCatalogo.set(a), error: () => null });
    this.desenlacesApi.listar().subscribe({ next: d => this.desenlaces.set(new Map(d.map(x => [x.codigo, x]))), error: () => null });
    this.cargar();
  }

  cargar(evento?: CustomEvent): void {
    this.error.set('');
    const f = this.filtro();
    forkJoin({ resumen: this.api.resumen(f), semanas: this.api.semanas(f), areas: this.api.areas(f) }).subscribe({
      next: r => {
        this.resumen.set(r.resumen);
        this.semanas.set(r.semanas);
        this.porArea.set(r.areas);
        this.cargando.set(false);
        (evento?.target as HTMLIonRefresherElement | undefined)?.complete();
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
        (evento?.target as HTMLIonRefresherElement | undefined)?.complete();
      },
    });
  }

  cambiarPeriodo(v: string | number): void {
    this.periodo.set(Number(v) as Periodo);
    this.cargar();
  }

  cambiarArea(v: number | null): void {
    this.areaSaludId.set(v);
    this.cargar();
  }

  cambiarCriterio(v: CriterioFecha): void {
    this.criterio.set(v);
    this.cargar();
  }

  porcentaje(valor: number, total: number): number {
    return total ? (valor / total) * 100 : 0;
  }

  /** Descarga la línea de casos en CSV (sin datos personales). */
  descargarCsv(): void {
    this.descargando.set(true);
    this.api.csv(this.filtro()).subscribe({
      next: respuesta => {
        this.descargando.set(false);
        const disposicion = respuesta.headers.get('Content-Disposition') ?? '';
        const nombre = /filename="?([^";]+)"?/.exec(disposicion)?.[1] ?? `seguimorbi-casos-${hoyIso()}.csv`;
        const url = URL.createObjectURL(respuesta.body!);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombre;
        enlace.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.avisos.exito(`Descargado ${nombre}`);
      },
      error: e => {
        this.descargando.set(false);
        this.avisos.error(e);
      },
    });
  }
}
