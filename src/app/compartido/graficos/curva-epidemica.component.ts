import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild, computed, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Clasificacion } from 'src/app/core/models/caso';
import { SemanaVigilancia } from 'src/app/core/models/vigilancia';

interface Serie {
  clave: Clasificacion;
  nombre: string;
  color: string;
}

/** Orden fijo de las series (nunca se reordena ni se recicla el color). */
const SERIES: Serie[] = [
  { clave: 'SOSPECHOSO', nombre: 'Sospechoso', color: 'var(--serie-sospechoso)' },
  { clave: 'PROBABLE', nombre: 'Probable', color: 'var(--serie-probable)' },
  { clave: 'CONFIRMADO', nombre: 'Confirmado', color: 'var(--serie-confirmado)' },
  { clave: 'DESCARTADO', nombre: 'Descartado', color: 'var(--serie-descartado)' },
];

const ALTO = 260;
const M = { arriba: 12, derecha: 8, abajo: 28, izquierda: 36 };
const HUECO = 2;
const RADIO = 4;

interface Segmento {
  serie: Serie;
  valor: number;
  y: number;
  alto: number;
  superior: boolean;
}

interface Columna {
  semana: SemanaVigilancia;
  x: number;
  ancho: number;
  centro: number;
  segmentos: Segmento[];
  etiqueta: string | null;
}

/** Curva epidémica: barras apiladas por clasificación y semana epidemiológica. */
@Component({
  selector: 'app-curva-epidemica',
  imports: [CommonModule, IonicModule, DatePipe],
  templateUrl: './curva-epidemica.component.html',
  styleUrls: ['./curva-epidemica.component.css'],
})
export class CurvaEpidemicaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lienzo', { static: true }) lienzo!: ElementRef<HTMLDivElement>;

  private readonly datos = signal<SemanaVigilancia[]>([]);
  @Input({ required: true }) set semanas(valor: SemanaVigilancia[]) {
    this.datos.set(valor ?? []);
  }

  readonly series = SERIES;
  readonly alto = ALTO;
  readonly m = M;
  readonly ancho = signal(640);
  readonly activa = signal<number | null>(null);
  readonly verTabla = signal(false);
  private observador?: ResizeObserver;

  readonly totales = computed(() =>
    SERIES.map(s => ({ ...s, total: this.datos().reduce((acc, w) => acc + (w.porClasificacion[s.clave] ?? 0), 0) })));

  readonly totalPeriodo = computed(() => this.datos().reduce((acc, w) => acc + w.total, 0));

  /** Máximo del eje redondeado a un valor "bonito" y sus marcas. */
  readonly eje = computed(() => {
    const max = Math.max(1, ...this.datos().map(w => w.total));
    const paso = pasoBonito(max / 4);
    const tope = Math.ceil(max / paso) * paso;
    const marcas: number[] = [];
    for (let v = 0; v <= tope; v += paso) {
      marcas.push(v);
    }
    return { tope, marcas };
  });

  readonly columnas = computed<Columna[]>(() => {
    const semanas = this.datos();
    const n = semanas.length || 1;
    const anchoUtil = this.ancho() - M.izquierda - M.derecha;
    const altoUtil = ALTO - M.arriba - M.abajo;
    const paso = anchoUtil / n;
    const anchoBarra = Math.max(4, Math.min(28, paso * 0.62));
    const cadaCuantas = Math.max(1, Math.ceil(n / Math.max(1, anchoUtil / 46)));
    const tope = this.eje().tope;
    const escala = (v: number) => (v / tope) * altoUtil;

    return semanas.map((semana, i) => {
      const centro = M.izquierda + paso * i + paso / 2;
      let base = ALTO - M.abajo;
      const conValor = SERIES.filter(s => (semana.porClasificacion[s.clave] ?? 0) > 0);
      const segmentos = conValor.map((serie, j) => {
        const valor = semana.porClasificacion[serie.clave] ?? 0;
        const altoTotal = escala(valor);
        const superior = j === conValor.length - 1;
        // Hueco de 2 px entre segmentos (salvo el de arriba), sin dejar barras invisibles.
        const alto = superior ? altoTotal : Math.max(1, altoTotal - HUECO);
        base -= altoTotal;
        return { serie, valor, y: base + (altoTotal - alto), alto, superior };
      });
      return {
        semana, x: centro - anchoBarra / 2, ancho: anchoBarra, centro, segmentos,
        etiqueta: i % cadaCuantas === 0 ? `SE${String(semana.semana).padStart(2, '0')}` : null,
      };
    });
  });

  readonly yDe = (v: number) => ALTO - M.abajo - (v / this.eje().tope) * (ALTO - M.arriba - M.abajo);

  readonly columnaActiva = computed(() => {
    const i = this.activa();
    return i === null ? null : this.columnas()[i] ?? null;
  });

  ngAfterViewInit(): void {
    this.observador = new ResizeObserver(entradas => {
      const w = Math.floor(entradas[0].contentRect.width);
      if (w > 0) {
        this.ancho.set(w);
      }
    });
    this.observador.observe(this.lienzo.nativeElement);
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
  }

  /** Barra con las esquinas superiores redondeadas (extremo de datos), base recta sobre el eje. */
  trazo(s: Segmento, c: Columna): string {
    const r = s.superior ? Math.min(RADIO, s.alto, c.ancho / 2) : 0;
    const { x, ancho } = c;
    const y = s.y;
    const abajo = y + s.alto;
    return `M${x},${abajo} V${y + r} Q${x},${y} ${x + r},${y} H${x + ancho - r} Q${x + ancho},${y} ${x + ancho},${y + r} V${abajo} Z`;
  }

  posicionAviso(c: Columna): number {
    // Mantiene el aviso dentro del gráfico.
    return Math.min(Math.max(c.centro, 90), this.ancho() - 90);
  }
}

function pasoBonito(bruto: number): number {
  const potencia = Math.pow(10, Math.floor(Math.log10(Math.max(bruto, 1))));
  const n = bruto / potencia;
  const factor = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return Math.max(1, factor * potencia);
}
