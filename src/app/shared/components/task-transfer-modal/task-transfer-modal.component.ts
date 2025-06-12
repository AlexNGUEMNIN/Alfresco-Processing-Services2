import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Task, User, TaskAssignment } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-transfer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-transfer-modal.component.html',
  styleUrls: ['./task-transfer-modal.component.scss']
})
export class TaskTransferModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() taskData: Task | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() taskTransferred = new EventEmitter<TaskAssignment>();

  currentStep = 1;
  selectedAssigneeType: 'manager' | 'group' | 'user' | null = null;
  selectedUserId: string | null = null;
  
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  loadingUsers = false;
  transferring = false;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    if (this.isOpen) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.taskService.getUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = users;
      this.loadingUsers = false;
    });
  }

  selectAssigneeType(type: 'manager' | 'group' | 'user'): void {
    this.selectedAssigneeType = type;
  }

  selectUser(userId: string): void {
    this.selectedUserId = userId;
  }

  filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  goBack(): void {
    this.currentStep = 1;
    this.selectedUserId = null;
  }

  canProceed(): boolean {
    if (this.currentStep === 1) {
      return this.selectedAssigneeType !== null;
    }
    if (this.currentStep === 2) {
      return this.selectedUserId !== null;
    }
    return false;
  }

  onTransfer(): void {
    if (!this.canProceed() || !this.taskData) return;

    if (this.selectedAssigneeType === 'user' && this.currentStep === 1) {
      this.currentStep = 2;
      return;
    }

    this.transferring = true;

    const assignment: TaskAssignment = {
      taskId: this.taskData.id,
      assigneeType: this.selectedAssigneeType!,
      assigneeId: this.selectedUserId || undefined
    };

    this.taskService.transferTask(assignment).subscribe({
      next: (success) => {
        if (success) {
          this.taskTransferred.emit(assignment);
          this.onClose();
        }
        this.transferring = false;
      },
      error: () => {
        this.transferring = false;
      }
    });
  }

  onClose(): void {
    this.currentStep = 1;
    this.selectedAssigneeType = null;
    this.selectedUserId = null;
    this.searchTerm = '';
    this.transferring = false;
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}