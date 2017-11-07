import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';
import 'hammerjs'; // support gesture for some animation

import { AppRoutingGuard } from './app-routing.guard'
import { Service } from './service';
import { AuthService } from './auth.service';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { APP_CONFIG, AppConfig } from './app.config';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule  
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    Service,
    AuthService,    
    { provide: APP_CONFIG, useValue: AppConfig },
    AppRoutingGuard
  ],
  bootstrap: [AppComponent], // set root component here

  // CUSTOM_ELEMENTS_SCHEMA: allow custom HTML tags like A-Frame's tags run in HTML
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
