import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Services
import { TasksService } from '../../core/services/tasks.service';
import { ToastService } from '../../core/services/toast.service';

// Models
import { User } from '../../core/models/user.model';
import { Task, TaskAssignment } from '../../core/models/task.model';

// Components
import { EnhancedBulkActionsModalComponent } from '../../shared/components/enhanced-bulk-actions-modal/enhanced-bulk-actions-modal.component';
import { TaskTransferModalComponent } from '../../shared/components/task-transfer-modal/task-transfer-modal.component';

// Interfaces
interface UserApplication {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  icon?: string;
  processCount: number;
  taskCount: number;
}

interface ExtendedUser extends User {
  tasksCount: number;
  lastActivity?: Date;
  avatar?: string;
}

interface ExtendedTask extends Task {
  workflowName: string;
  applicationName: string;
  processName: string;
  assigneeName?: string;
  type: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface BulkActionResult {
  action: string;
  selectedItems: any[];
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-task-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EnhancedBulkActionsModalComponent,
    TaskTransferModalComponent
  ],
  templateUrl: './task-users.component.html',
  styleUrls: ['./task-users.component.scss']
})
export class TaskUsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private userSearchSubject = new Subject<string>();
  private taskSearchSubject = new Subject<string>();
  private appSearchSubject = new Subject<string>();
  private appTaskSearchSubject = new Subject<string>();

  // ===== DATA PROPERTIES =====
  users: ExtendedUser[] = [];
  filteredUsers: ExtendedUser[] = [];
  selectedUser: ExtendedUser | null = null;

  userTasks: ExtendedTask[] = [];
  filteredUserTasks: ExtendedTask[] = [];
  selectedUserTasks: ExtendedTask[] = [];
  selectedUserTasksIds = new Set<string>();

  userApplications: UserApplication[] = [];
  filteredUserApplications: UserApplication[] = [];
  selectedApplication: UserApplication | null = null;

  appTasks: ExtendedTask[] = [];
  filteredAppTasks: ExtendedTask[] = [];
  selectedAppTasks: ExtendedTask[] = [];
  selectedAppTasksIds = new Set<string>();

  availableProcesses: { id: string; name: string }[] = [];
  availableAssignees: { id: string; name: string }[] = [];

  // ===== SEARCH & FILTER PROPERTIES =====
  userSearchTerm = '';
  userSearchHistory: string[] = [];
  showUserSearchHistory = false;
  userStatusFilter = '';
  userTasksFilter = '';
  userSortBy = 'name-asc';

  taskSearchTerm = '';
  taskStatusFilter = '';
  taskPriorityFilter = '';
  taskSortBy = 'created-desc';

  appSearchTerm = '';
  appStatusFilter = '';
  appTasksFilter = '';

  appTaskSearchTerm = '';
  appTaskProcessFilter = '';
  appTaskAssigneeFilter = '';
  appTaskStatusFilter = '';

  // ===== UI STATE PROPERTIES =====
  loadingUsers = false;
  loadingUserTasks = false;
  loadingUserApplications = false;
  loadingAppTasks = false;

  activeColumn = 'users';
  showBulkActionsModal = false;
  bulkActionContext = '';
  showTransferModal = false;
  taskToTransfer: ExtendedTask | ExtendedTask[] | null = null;
  showTaskDetailsModal = false;
  selectedTaskDetails: ExtendedTask | null = null;

  toasts: Toast[] = [];

  // ===== COMPUTED PROPERTIES =====
  get totalUsers(): number {
    return this.users.length;
  }

  get totalTasks(): number {
    return this.users.reduce((sum, user) => sum + user.tasksCount, 0);
  }

  get totalApplications(): number {
    return this.userApplications.length;
  }

  constructor(
    private tasksService: TasksService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.setupSearchDebouncing();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadUserSearchHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== SETUP METHODS =====
  private setupSearchDebouncing(): void {
    this.userSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performUserSearch(term);
    });

    this.taskSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performTaskSearch(term);
    });

    this.appSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performAppSearch(term);
    });

    this.appTaskSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performAppTaskSearch(term);
    });
  }

  // ===== DATA LOADING METHODS =====
  private loadUsers(): void {
    this.loadingUsers = true;
    
    // Simulate API call with mock data
    setTimeout(() => {
      this.users = this.generateMockUsers();
      this.filteredUsers = [...this.users];
      this.loadingUsers = false;
      this.cdr.detectChanges();
    }, 800);
  }

  private loadUserTasks(userId: string): void {
    this.loadingUserTasks = true;
    
    setTimeout(() => {
      this.userTasks = this.generateMockUserTasks(userId);
      this.filteredUserTasks = [...this.userTasks];
      this.selectedUserTasks = [];
      this.selectedUserTasksIds.clear();
      this.loadingUserTasks = false;
      this.cdr.detectChanges();
    }, 600);
  }

  private loadUserApplications(userId: string): void {
    this.loadingUserApplications = true;
    
    setTimeout(() => {
      this.userApplications = this.generateMockUserApplications(userId);
      this.filteredUserApplications = [...this.userApplications];
      this.loadingUserApplications = false;
      this.cdr.detectChanges();
    }, 500);
  }

  private loadAppTasks(appId: string): void {
    this.loadingAppTasks = true;
    
    setTimeout(() => {
      this.appTasks = this.generateMockAppTasks(appId);
      this.filteredAppTasks = [...this.appTasks];
      this.selectedAppTasks = [];
      this.selectedAppTasksIds.clear();
      this.availableProcesses = this.extractAvailableProcesses();
      this.availableAssignees = this.extractAvailableAssignees();
      this.loadingAppTasks = false;
      this.cdr.detectChanges();
    }, 600);
  }

  // ===== MOCK DATA GENERATORS =====
  private generateMockUsers(): ExtendedUser[] {
    const mockUsers: ExtendedUser[] = [
      {
        id: '1',
        username: 'jdupont',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@afriland.com',
        role: 'operator',
        isActive: true,
        tasksCount: 8,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        username: 'mmartin',
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@afriland.com',
        role: 'supervisor',
        isActive: true,
        tasksCount: 12,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: '3',
        username: 'pdurand',
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre.durand@afriland.com',
        role: 'supervisor',
        isActive: false,
        tasksCount: 3,
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        username: 'slegrand',
        firstName: 'Sophie',
        lastName: 'Legrand',
        email: 'sophie.legrand@afriland.com',
        role: 'admin',
        isActive: true,
        tasksCount: 15,
        lastActivity: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        id: '5',
        username: 'arobert',
        firstName: 'Antoine',
        lastName: 'Robert',
        email: 'antoine.robert@afriland.com',
        role: 'operator',
        isActive: true,
        tasksCount: 6,
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];

    return mockUsers;
  }

  private generateMockUserTasks(userId: string): ExtendedTask[] {
    const taskTypes = ['approval', 'review', 'validation', 'processing', 'analysis'];
    const statuses: Array<'in-progress' | 'suspended' | 'pending' | 'completed'> = ['in-progress', 'suspended', 'pending', 'completed'];
    const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    const workflows = ['Loan Approval', 'Account Opening', 'Document Review', 'Risk Assessment'];
    const applications = ['Banking App', 'Loan System', 'CRM', 'Risk Management'];

    const tasks: ExtendedTask[] = [];
    const taskCount = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < taskCount; i++) {
      const task: ExtendedTask = {
        id: `task-${userId}-${i + 1}`,
        processInstanceId: `proc-${userId}-${i + 1}`,
        processDefinitionId: `def-${i + 1}`,
        name: `Tâche ${i + 1} - ${taskTypes[Math.floor(Math.random() * taskTypes.length)]}`,
        description: `Description de la tâche ${i + 1}`,
        assignee: userId,
        created: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        dueDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        priority: Math.floor(Math.random() * 100),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        workflowName: workflows[Math.floor(Math.random() * workflows.length)],
        applicationName: applications[Math.floor(Math.random() * applications.length)],
        processName: `Process ${i + 1}`,
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)]
      };

      tasks.push(task);
    }

    return tasks;
  }

  private generateMockUserApplications(userId: string): UserApplication[] {
    const appTypes = ['workflow', 'form', 'approval', 'processing'];
    const statuses: Array<'active' | 'inactive' | 'maintenance'> = ['active', 'inactive', 'maintenance'];
    
    const applications: UserApplication[] = [
      {
        id: 'app-1',
        name: 'Banking Operations',
        type: 'workflow',
        status: 'active',
        processCount: 15,
        taskCount: 8
      },
      {
        id: 'app-2',
        name: 'Loan Management',
        type: 'approval',
        status: 'active',
        processCount: 12,
        taskCount: 5
      },
      {
        id: 'app-3',
        name: 'Customer Onboarding',
        type: 'form',
        status: 'maintenance',
        processCount: 8,
        taskCount: 3
      },
      {
        id: 'app-4',
        name: 'Risk Assessment',
        type: 'processing',
        status: 'active',
        processCount: 20,
        taskCount: 12
      }
    ];

    return applications;
  }

  private generateMockAppTasks(appId: string): ExtendedTask[] {
    const taskTypes = ['approval', 'review', 'validation', 'processing', 'analysis'];
    const statuses: Array<'in-progress' | 'suspended' | 'pending' | 'completed'> = ['in-progress', 'suspended', 'pending', 'completed'];
    const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    const processes = ['Process A', 'Process B', 'Process C', 'Process D'];
    const assignees = ['Jean Dupont', 'Marie Martin', 'Pierre Durand', 'Sophie Legrand'];

    const tasks: ExtendedTask[] = [];
    const taskCount = Math.floor(Math.random() * 15) + 10;

    for (let i = 0; i < taskCount; i++) {
      const task: ExtendedTask = {
        id: `app-task-${appId}-${i + 1}`,
        processInstanceId: `proc-${appId}-${i + 1}`,
        processDefinitionId: `def-${i + 1}`,
        name: `Tâche App ${i + 1} - ${taskTypes[Math.floor(Math.random() * taskTypes.length)]}`,
        description: `Description de la tâche d'application ${i + 1}`,
        assignee: `user-${Math.floor(Math.random() * 4) + 1}`,
        created: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        dueDate: Math.random() > 0.3 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
        priority: Math.floor(Math.random() * 100),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        workflowName: `Workflow ${Math.floor(Math.random() * 3) + 1}`,
        applicationName: `Application ${appId}`,
        processName: processes[Math.floor(Math.random() * processes.length)],
        assigneeName: assignees[Math.floor(Math.random() * assignees.length)],
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)]
      };

      tasks.push(task);
    }

    return tasks;
  }

  private extractAvailableProcesses(): { id: string; name: string }[] {
    const processes = new Set<string>();
    this.appTasks.forEach(task => processes.add(task.processName));
    return Array.from(processes).map((name, index) => ({ id: `proc-${index}`, name }));
  }

  private extractAvailableAssignees(): { id: string; name: string }[] {
    const assignees = new Set<string>();
    this.appTasks.forEach(task => {
      if (task.assigneeName) assignees.add(task.assigneeName);
    });
    return Array.from(assignees).map((name, index) => ({ id: `user-${index}`, name }));
  }

  // ===== SEARCH METHODS =====
  onUserSearch(): void {
    this.userSearchSubject.next(this.userSearchTerm);
    this.showUserSearchHistory = this.userSearchTerm.length === 0 && this.userSearchHistory.length > 0;
  }

  private performUserSearch(term: string): void {
    if (term.trim()) {
      this.addToSearchHistory(term);
      this.filteredUsers = this.users.filter(user =>
        user.firstName.toLowerCase().includes(term.toLowerCase()) ||
        user.lastName.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase()) ||
        user.role.toLowerCase().includes(term.toLowerCase())
      );
    } else {
      this.filteredUsers = [...this.users];
    }
    this.applyUserFilters();
  }

  onTaskSearch(): void {
    this.taskSearchSubject.next(this.taskSearchTerm);
  }

  private performTaskSearch(term: string): void {
    if (term.trim()) {
      this.filteredUserTasks = this.userTasks.filter(task =>
        task.name.toLowerCase().includes(term.toLowerCase()) ||
        task.workflowName.toLowerCase().includes(term.toLowerCase()) ||
        task.applicationName.toLowerCase().includes(term.toLowerCase())
      );
    } else {
      this.filteredUserTasks = [...this.userTasks];
    }
    this.applyTaskFilters();
  }

  onAppSearch(): void {
    this.appSearchSubject.next(this.appSearchTerm);
  }

  private performAppSearch(term: string): void {
    if (term.trim()) {
      this.filteredUserApplications = this.userApplications.filter(app =>
        app.name.toLowerCase().includes(term.toLowerCase())
      );
    } else {
      this.filteredUserApplications = [...this.userApplications];
    }
    this.applyAppFilters();
  }

  onAppTaskSearch(): void {
    this.appTaskSearchSubject.next(this.appTaskSearchTerm);
  }

  private performAppTaskSearch(term: string): void {
    if (term.trim()) {
      this.filteredAppTasks = this.appTasks.filter(task =>
        task.name.toLowerCase().includes(term.toLowerCase()) ||
        task.processName.toLowerCase().includes(term.toLowerCase()) ||
        (task.assigneeName && task.assigneeName.toLowerCase().includes(term.toLowerCase()))
      );
    } else {
      this.filteredAppTasks = [...this.appTasks];
    }
    this.applyAppTaskFilters();
  }

  clearUserSearch(): void {
    this.userSearchTerm = '';
    this.showUserSearchHistory = false;
    this.performUserSearch('');
  }

  selectSearchHistory(term: string): void {
    this.userSearchTerm = term;
    this.showUserSearchHistory = false;
    this.performUserSearch(term);
  }

  private addToSearchHistory(term: string): void {
    if (!this.userSearchHistory.includes(term)) {
      this.userSearchHistory.unshift(term);
      if (this.userSearchHistory.length > 5) {
        this.userSearchHistory.pop();
      }
      this.saveUserSearchHistory();
    }
  }

  private loadUserSearchHistory(): void {
    const saved = localStorage.getItem('user-search-history');
    if (saved) {
      this.userSearchHistory = JSON.parse(saved);
    }
  }

  private saveUserSearchHistory(): void {
    localStorage.setItem('user-search-history', JSON.stringify(this.userSearchHistory));
  }

  // ===== FILTER METHODS =====
  applyUserFilters(): void {
    let filtered = [...this.filteredUsers];

    if (this.userStatusFilter) {
      filtered = filtered.filter(user => 
        this.userStatusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    if (this.userTasksFilter) {
      filtered = filtered.filter(user => {
        const count = user.tasksCount;
        switch (this.userTasksFilter) {
          case '0': return count === 0;
          case '1-5': return count >= 1 && count <= 5;
          case '6-10': return count >= 6 && count <= 10;
          case '10+': return count > 10;
          default: return true;
        }
      });
    }

    this.filteredUsers = filtered;
    this.sortUsers();
  }

  applyTaskFilters(): void {
    let filtered = [...this.filteredUserTasks];

    if (this.taskStatusFilter) {
      filtered = filtered.filter(task => task.status === this.taskStatusFilter);
    }

    if (this.taskPriorityFilter) {
      filtered = filtered.filter(task => this.getPriorityFromNumber(task.priority) === this.taskPriorityFilter);
    }

    this.filteredUserTasks = filtered;
    this.sortTasks();
  }

  applyAppFilters(): void {
    let filtered = [...this.filteredUserApplications];

    if (this.appStatusFilter) {
      filtered = filtered.filter(app => app.status === this.appStatusFilter);
    }

    if (this.appTasksFilter) {
      filtered = filtered.filter(app => {
        const count = app.taskCount;
        switch (this.appTasksFilter) {
          case '0': return count === 0;
          case '1-5': return count >= 1 && count <= 5;
          case '6-10': return count >= 6 && count <= 10;
          case '10+': return count > 10;
          default: return true;
        }
      });
    }

    this.filteredUserApplications = filtered;
  }

  applyAppTaskFilters(): void {
    let filtered = [...this.filteredAppTasks];

    if (this.appTaskProcessFilter) {
      const processName = this.availableProcesses.find(p => p.id === this.appTaskProcessFilter)?.name;
      if (processName) {
        filtered = filtered.filter(task => task.processName === processName);
      }
    }

    if (this.appTaskAssigneeFilter) {
      const assigneeName = this.availableAssignees.find(a => a.id === this.appTaskAssigneeFilter)?.name;
      if (assigneeName) {
        filtered = filtered.filter(task => task.assigneeName === assigneeName);
      }
    }

    if (this.appTaskStatusFilter) {
      if (this.appTaskStatusFilter === 'overdue') {
        filtered = filtered.filter(task => task.dueDate && this.isOverdue(task.dueDate));
      } else {
        filtered = filtered.filter(task => task.status === this.appTaskStatusFilter);
      }
    }

    this.filteredAppTasks = filtered;
  }

  // ===== SORT METHODS =====
  sortUsers(): void {
    this.filteredUsers.sort((a, b) => {
      switch (this.userSortBy) {
        case 'name-asc':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'name-desc':
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case 'tasks-desc':
          return b.tasksCount - a.tasksCount;
        case 'tasks-asc':
          return a.tasksCount - b.tasksCount;
        case 'activity-desc':
          return (b.lastActivity?.getTime() || 0) - (a.lastActivity?.getTime() || 0);
        default:
          return 0;
      }
    });
  }

  sortTasks(): void {
    this.filteredUserTasks.sort((a, b) => {
      switch (this.taskSortBy) {
        case 'created-desc':
          return b.created.getTime() - a.created.getTime();
        case 'created-asc':
          return a.created.getTime() - b.created.getTime();
        case 'priority-desc':
          return b.priority - a.priority;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  // ===== SELECTION METHODS =====
  selectUser(user: ExtendedUser): void {
    this.selectedUser = user;
    this.selectedApplication = null;
    this.loadUserTasks(user.id);
    this.loadUserApplications(user.id);
  }

  selectApplication(app: UserApplication): void {
    this.selectedApplication = app;
    this.loadAppTasks(app.id);
  }

  selectTask(task: ExtendedTask): void {
    // Handle task selection for details view
    this.selectedTaskDetails = task;
  }

  // ===== BULK SELECTION METHODS =====
  toggleUserTaskSelection(taskId: string): void {
    if (this.selectedUserTasksIds.has(taskId)) {
      this.selectedUserTasksIds.delete(taskId);
    } else {
      this.selectedUserTasksIds.add(taskId);
    }
    this.updateSelectedUserTasks();
  }

  toggleAllUserTasks(): void {
    if (this.isAllUserTasksSelected()) {
      this.selectedUserTasksIds.clear();
    } else {
      this.filteredUserTasks.forEach(task => this.selectedUserTasksIds.add(task.id));
    }
    this.updateSelectedUserTasks();
  }

  isAllUserTasksSelected(): boolean {
    return this.filteredUserTasks.length > 0 && 
           this.filteredUserTasks.every(task => this.selectedUserTasksIds.has(task.id));
  }

  isSomeUserTasksSelected(): boolean {
    return this.selectedUserTasksIds.size > 0 && !this.isAllUserTasksSelected();
  }

  private updateSelectedUserTasks(): void {
    this.selectedUserTasks = this.filteredUserTasks.filter(task => 
      this.selectedUserTasksIds.has(task.id)
    );
  }

  toggleAppTaskSelection(taskId: string): void {
    if (this.selectedAppTasksIds.has(taskId)) {
      this.selectedAppTasksIds.delete(taskId);
    } else {
      this.selectedAppTasksIds.add(taskId);
    }
    this.updateSelectedAppTasks();
  }

  toggleAllAppTasks(): void {
    if (this.isAllAppTasksSelected()) {
      this.selectedAppTasksIds.clear();
    } else {
      this.filteredAppTasks.forEach(task => this.selectedAppTasksIds.add(task.id));
    }
    this.updateSelectedAppTasks();
  }

  isAllAppTasksSelected(): boolean {
    return this.filteredAppTasks.length > 0 && 
           this.filteredAppTasks.every(task => this.selectedAppTasksIds.has(task.id));
  }

  isSomeAppTasksSelected(): boolean {
    return this.selectedAppTasksIds.size > 0 && !this.isAllAppTasksSelected();
  }

  private updateSelectedAppTasks(): void {
    this.selectedAppTasks = this.filteredAppTasks.filter(task => 
      this.selectedAppTasksIds.has(task.id)
    );
  }

  // ===== BULK ACTIONS METHODS =====
  openBulkActionsModal(context: string): void {
    this.bulkActionContext = context;
    this.showBulkActionsModal = true;
  }

  closeBulkActionsModal(): void {
    this.showBulkActionsModal = false;
    this.bulkActionContext = '';
  }

  getSelectedItems(): any[] {
    switch (this.bulkActionContext) {
      case 'user-tasks':
        return this.selectedUserTasks;
      case 'app-tasks':
        return this.selectedAppTasks;
      default:
        return [];
    }
  }

  getAvailableActions(): string[] {
    return ['resume', 'suspend', 'stop', 'transfer', 'change-priority', 'set-due-date'];
  }

  onBulkActionExecuted(result: BulkActionResult): void {
    if (result.success) {
      this.showToast('success', result.message);
      
      // Clear selections after successful bulk action
      if (this.bulkActionContext === 'user-tasks') {
        this.selectedUserTasksIds.clear();
        this.updateSelectedUserTasks();
      } else if (this.bulkActionContext === 'app-tasks') {
        this.selectedAppTasksIds.clear();
        this.updateSelectedAppTasks();
      }
      
      // Refresh data
      this.refreshCurrentData();
    } else {
      this.showToast('error', result.message);
    }
    
    this.closeBulkActionsModal();
  }

  // ===== INDIVIDUAL TASK ACTIONS =====
  toggleTaskStatus(task: ExtendedTask): void {
    const newStatus = task.status === 'suspended' ? 'in-progress' : 'suspended';
    task.status = newStatus;
    
    const action = newStatus === 'suspended' ? 'suspendue' : 'reprise';
    this.showToast('success', `Tâche ${action} avec succès`);
  }

  stopTask(task: ExtendedTask): void {
    if (confirm('Êtes-vous sûr de vouloir arrêter cette tâche ?')) {
      task.status = 'completed';
      this.showToast('success', 'Tâche arrêtée avec succès');
    }
  }

  transferTask(task: ExtendedTask): void {
    this.taskToTransfer = task;
    this.showTransferModal = true;
  }

  viewTaskDetails(task: ExtendedTask): void {
    this.selectedTaskDetails = task;
    this.showTaskDetailsModal = true;
  }

  viewTaskHistory(task: ExtendedTask): void {
    this.showToast('info', 'Fonctionnalité d\'historique en cours de développement');
  }

  // ===== TRANSFER MODAL METHODS =====
  closeTransferModal(): void {
    this.showTransferModal = false;
    this.taskToTransfer = null;
  }

  onTaskTransferred(assignment: TaskAssignment | TaskAssignment[]): void {
    const assignments = Array.isArray(assignment) ? assignment : [assignment];
    
    assignments.forEach(a => {
      const assignee = a.assigneeId || a.assigneeType;
      this.showToast('success', `Tâche ${a.taskId} transférée à ${assignee}`);
    });
    
    this.closeTransferModal();
    this.refreshCurrentData();
  }

  // ===== TASK DETAILS MODAL METHODS =====
  closeTaskDetailsModal(): void {
    this.showTaskDetailsModal = false;
    this.selectedTaskDetails = null;
  }

  // ===== MOBILE NAVIGATION =====
  setActiveColumn(column: string): void {
    this.activeColumn = column;
    
    // Update CSS classes for mobile view
    const columnsContainer = document.querySelector('.monitoring-columns');
    if (columnsContainer) {
      columnsContainer.className = `monitoring-columns show-${column}`;
    }
  }

  // ===== UTILITY METHODS =====
  trackByUserId(index: number, user: ExtendedUser): string {
    return user.id;
  }

  trackByTaskId(index: number, task: ExtendedTask): string {
    return task.id;
  }

  trackByAppId(index: number, app: UserApplication): string {
    return app.id;
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  isOverdue(dueDate: Date): boolean {
    return dueDate < new Date();
  }

  getTaskIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'approval': 'check_circle',
      'review': 'rate_review',
      'validation': 'verified',
      'processing': 'settings',
      'analysis': 'analytics'
    };
    return icons[type] || 'assignment';
  }

  getAppIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'workflow': 'account_tree',
      'form': 'description',
      'approval': 'approval',
      'processing': 'settings_applications'
    };
    return icons[type] || 'apps';
  }

  getPriorityLabel(priority: number): string {
    if (priority >= 75) return 'Haute';
    if (priority >= 50) return 'Moyenne';
    return 'Basse';
  }

  private getPriorityFromNumber(priority: number): string {
    if (priority >= 75) return 'high';
    if (priority >= 50) return 'medium';
    return 'low';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'in-progress': 'En cours',
      'suspended': 'Suspendu',
      'pending': 'En attente',
      'completed': 'Terminé',
      'overdue': 'En retard'
    };
    return labels[status] || status;
  }

  getAppStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Active',
      'inactive': 'Inactive',
      'maintenance': 'Maintenance'
    };
    return labels[status] || status;
  }

  getToastIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'success': 'check_circle',
      'error': 'error',
      'warning': 'warning',
      'info': 'info'
    };
    return icons[type] || 'info';
  }

  // ===== TOAST METHODS =====
  showToast(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    const toast: Toast = {
      id: Date.now().toString(),
      type,
      message
    };
    
    this.toasts.push(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(toast.id);
    }, 5000);
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }

  // ===== REFRESH METHODS =====
  private refreshCurrentData(): void {
    if (this.selectedUser) {
      this.loadUserTasks(this.selectedUser.id);
    }
    if (this.selectedApplication) {
      this.loadAppTasks(this.selectedApplication.id);
    }
  }
}