import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Process Management',
      icon: 'settings_suggest',
      route: '/processes'
    },
    {
      label: 'Process Analysis',
      icon: 'analytics',
      route: '/analysis'
    },
    {
      label: 'Database Supervision',
      icon: 'storage',
      route: '/database'
    },
    {
      label: 'Administration',
      icon: 'admin_panel_settings',
      route: '/admin'
    }

 
  ];

  constructor() {}
}