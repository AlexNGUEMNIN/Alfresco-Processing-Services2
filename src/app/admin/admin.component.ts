import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../core/services/user.service';
import { User, AuditLog } from '../core/models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  activeTab = 'users';
  users: User[] = [];
  auditLogs: AuditLog[] = [];
  loading = true;
  
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.loading = false;
    });
    
    this.userService.getAuditLogs().subscribe(logs => {
      this.auditLogs = logs;
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}