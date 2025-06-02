import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { SidebarComponent } from "./shared/components/sidebar/sidebar.component";
import { HeaderComponent } from "./shared/components/header/header.component";
import { routes } from "./app.routes";
import { provideHttpClient } from '@angular/common/http';

export class App {}

bootstrapApplication(App, {
  providers: [provideRouter(routes),
    provideHttpClient()
  ],
}); 
