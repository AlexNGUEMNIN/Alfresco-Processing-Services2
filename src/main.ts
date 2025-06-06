import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { SidebarComponent } from './app/shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './app/shared/components/header/header.component';
import { routes } from './app/app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      
      <div class="main-content">
        <app-header></app-header>
        
        <div class="page-container">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background-color: var(--color-gray-100);
    }
    
    .main-content {
      flex: 1;
      margin-left: 250px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      background-color: var(--color-gray-100);
    }
    
    .page-container {
      padding: 80px var(--spacing-6) var(--spacing-6);
      flex: 1;
      overflow-y: auto;
    }
    
    @media (max-width: 768px) {
      .main-content {
        margin-left: 60px;
      }
    }
  `]
})
export class App {
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
});