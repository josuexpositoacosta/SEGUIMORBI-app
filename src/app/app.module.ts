import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { IDIOMA } from './core/i18n/idioma';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { authInterceptor } from './core/auth/auth.interceptor';
import { TraducirPipe } from './core/i18n/traducir.pipe';
import { SelectorIdiomaComponent } from './compartido/selector-idioma.component';

// Fechas, meses y números en el idioma elegido (pipes date, number…). El inglés viene incluido en Angular.
registerLocaleData(localeEs);
document.documentElement.lang = IDIOMA;

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    TraducirPipe,
    SelectorIdiomaComponent,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: IDIOMA === 'en' ? 'en-US' : 'es' },
    // Un único HttpClient para toda la app, con el interceptor de autenticación.
    provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
