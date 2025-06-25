import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {AuthService} from "../../../core/services/auth.service";

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
      label: 'Process Dynamics',
      icon: 'dynamic_feed',
      route: '/process-dynamics'
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
    },
    {
      label: 'Task Management',
      icon: 'task',
      route: '/task'
    }

 
  ];

  constructor(private authService: AuthService) {}

  onLogout() {
    this.authService.logout();
  }
}