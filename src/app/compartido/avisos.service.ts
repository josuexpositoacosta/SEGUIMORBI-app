import { Injectable, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { mensajeDeError } from '../core/http/errores';
import { t } from 'src/app/core/i18n/idioma';

export interface OpcionesConfirmacion {
  titulo: string;
  mensaje: string;
  confirmar: string;
  /** Acción destructiva: el botón se muestra en rojo. */
  peligro?: boolean;
}

/** Mensajes breves (toasts) y confirmaciones con el mismo estilo en toda la app. */
@Injectable({ providedIn: 'root' })
export class AvisosService {
  private readonly toast = inject(ToastController);
  private readonly alert = inject(AlertController);

  async exito(mensaje: string): Promise<void> {
    const t = await this.toast.create({
      message: mensaje, duration: 2500, color: 'success', icon: 'checkmark-circle-outline', position: 'bottom',
    });
    await t.present();
  }

  /** Algo que requiere atención sin ser un error (por ejemplo, alertas clínicas nuevas). */
  async advertencia(mensaje: string): Promise<void> {
    const t = await this.toast.create({
      message: mensaje, duration: 5000, color: 'warning', icon: 'warning-outline', position: 'bottom',
      buttons: [{ icon: 'close', role: 'cancel' }],
    });
    await t.present();
  }

  async error(error: unknown): Promise<void> {
    const t = await this.toast.create({
      message: mensajeDeError(error), duration: 4000, color: 'danger', icon: 'alert-circle-outline', position: 'bottom',
      buttons: [{ icon: 'close', role: 'cancel' }],
    });
    await t.present();
  }

  async confirmar(o: OpcionesConfirmacion): Promise<boolean> {
    const a = await this.alert.create({
      header: o.titulo,
      message: o.mensaje,
      buttons: [
        { text: t('Cancelar'), role: 'cancel' },
        { text: o.confirmar, role: 'confirm', cssClass: o.peligro ? 'alert-boton-peligro' : '' },
      ],
    });
    await a.present();
    const { role } = await a.onDidDismiss();
    return role === 'confirm';
  }
}
