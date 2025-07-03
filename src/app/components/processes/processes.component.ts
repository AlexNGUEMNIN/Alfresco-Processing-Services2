import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { DatePipe, CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { SelectionModel } from '@angular/cdk/collections';

import {
  ProcessData,
  ProcessResponse,
  ProcessService,
} from "../../core/services/process.service";
import { TaskService } from "../../core/services/task.service";
import { ToastService, ToastMessage } from "../../core/services/toast.service";
import { Task, TaskAssignment } from "../../core/models/task.model";

// Angular Material modules
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatMenuModule } from "@angular/material/menu";

// Shared components
import { TaskActionsComponent } from "../../shared/components/task-actions/task-actions.component";
import { TaskTransferModalComponent } from "../../shared/components/task-transfer-modal/task-transfer-modal.component";
import { ToastNotificationComponent } from "../../shared/components/toast-notification/toast-notification.component";
import { TasksService } from "../../core/services/tasks.service";

@Component({
  selector: "app-processes",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatMenuModule,
    TaskActionsComponent,
    TaskTransferModalComponent,
    ToastNotificationComponent,
  ],
  templateUrl: "./processes.component.html",
  styleUrls: ["./processes.component.scss"],
  providers: [DatePipe],
})
export class ProcessesComponent implements OnInit, OnDestroy {
  activeTabIndex = 0;
  loading = true;
  tabs = [
    { label: "Uniquement par son initiateur", key: "processusInitiateurSeulement", count: 0 },
    { label: "Qu'une seule tâche exécutée", key: "processusLongs", count: 0 },
    { label: "Avec erreur/exception technique", key: "processusSansTâches", count: 0 },
    { label: "Sans aucune tâche utilisateur", key: "nombreProcessusÉchoués", count: 0 },
  ];

  displayedColumns = [
    'select',
    "processInstanceId",
    "processDefinitionId",
    "processStartTime",
    "processInitiator",
    "actions",
  ];
  dataSource = new MatTableDataSource<ProcessData>([]);
  processData: ProcessResponse | null = null;
  selection = new SelectionModel<ProcessData>(true, []);

  bulkActions = [
    { name: 'Suspend Selected', action: 'suspend', icon: 'pause_circle' },
    { name: 'Resume Selected', action: 'resume', icon: 'play_circle' },
    { name: 'Terminate Selected', action: 'terminate', icon: 'stop_circle' },
    { name: 'Transfer Selected', action: 'transfer', icon: 'swap_horiz' }
  ];

  showTransferModal = false;
  selectedTaskForTransfer: Task[] = [];
  toasts: ToastMessage[] = [];

  private socketSubscription!: Subscription;
  private toastSubscription!: Subscription;
  private transferQueue: ProcessData[] = [];
  private isAutoTransfer = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
      private webSocketService: ProcessService,
      private taskService: TaskService,
      private tasksService: TasksService,
      private toastService: ToastService,
      private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.subscribeToToasts();
    setTimeout(() => this.connectToWebSocket(), 800);
  }

  ngOnDestroy(): void {
    this.socketSubscription?.unsubscribe();
    this.toastSubscription?.unsubscribe();
    this.webSocketService.close();
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  toggleAllRows() {
    this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: ProcessData): string {
    return row
        ? `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.processInstanceId}`
        : `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  }

  performBulkAction(action: string) {
    const selectedProcesses = this.selection.selected;
    if (!selectedProcesses.length) {
      this.toastService.warning('No Selection', 'Please select at least one process');
      return;
    }

    switch (action) {
      case 'suspend':
        selectedProcesses.forEach(p => this.onToggleProcessSuspension(p.processInstanceId, false));
        break;
      case 'resume':
        selectedProcesses.forEach(p => this.onToggleProcessSuspension(p.processInstanceId, true));
        break;
      case 'terminate':
        selectedProcesses.forEach(p => this.onTerminateProcess(p.processInstanceId));
        break;
      case 'transfer':
        this.selectedTaskForTransfer = selectedProcesses.map(this.mapProcessToTask);
        this.showTransferModal = true;
        break;
    }

    if (action !== 'transfer') {
      this.selection.clear();
    }
  }

  mapProcessToTask(process: ProcessData): Task {
    return {
      id: process.taskId ?? `TASK-${process.processInstanceId}`,
      processInstanceId: process.processInstanceId,
      processDefinitionId: process.processDefinitionId,
      name: `Tâche pour ${process.processDefinitionId}`,
      description: `Tâche liée au processus ${process.processInstanceId}`,
      assignee: process.processInitiator,
      created: new Date(process.processStartTime),
      priority: 50,
      status: "assigned",
      managerId: process.managerId || null,
      managerEmail: process.managerEmail || null,
      groupName: process.groupName || null,
      groupId: process.groupId || null,
    };
  }

  processNextTransfer(): void {
    if (!this.transferQueue.length) {
      this.showTransferModal = false;
      this.selectedTaskForTransfer = [];
      this.isAutoTransfer = false;
      this.selection.clear();
      this.refreshData();
      return;
    }

    const next = this.transferQueue.shift();
    if (next) {
      this.selectedTaskForTransfer = [this.mapProcessToTask(next)];
      this.showTransferModal = true;
    }
  }

  async transferProcessesSequentially(processes: ProcessData[]) {
    if (!processes.length) return;

    const nextProcess = processes.shift();
    if (!nextProcess) return;

    return new Promise<void>((resolve) => {
      const task = this.mapProcessToTask(nextProcess);
      this.selectedTaskForTransfer = [task];
      this.showTransferModal = true;

      const subscription = this.toastService.toasts$.subscribe((toasts) => {
        const transferSuccess = toasts.find(t =>
            t.title?.includes("Tâche transférée") &&
            t.message?.includes(task.id)
        );
        if (transferSuccess) {
          subscription.unsubscribe();
          this.showTransferModal = false;
          this.selectedTaskForTransfer = [];
          setTimeout(() => this.transferProcessesSequentially(processes), 500);
          resolve();
        }
      });
    });
  }

  getRowClass(row: ProcessData) {
    return { 'selected': this.selection.isSelected(row) };
  }

  subscribeToToasts(): void {
    this.toastSubscription = this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  connectToWebSocket(): void {
    this.socketSubscription = this.webSocketService.connect().subscribe({
      next: (response: ProcessResponse) => {
        this.processData = response;
        this.updateTabCounts();
        this.loadTabData(this.activeTabIndex);
        this.loading = false;
      },
      error: (err) => {
        console.error("WebSocket error:", err);
        this.loading = false;
        setTimeout(() => this.connectToWebSocket(), 5000);
      },
      complete: () => {
        console.warn("WebSocket connection closed. Reconnecting...");
        setTimeout(() => this.connectToWebSocket(), 5000);
      },
    });
  }

  refreshData(): void {
    this.loading = true;
    this.selection.clear();
    setTimeout(() => this.connectToWebSocket(), 800);
  }

  updateTabCounts(): void {
    if (!this.processData) return;
    this.tabs[0].count = this.processData.processusInitiateurSeulement?.nombre || 0;
    this.tabs[1].count = this.processData.processusLongs?.nombre || 0;
    this.tabs[2].count = this.processData.processusSansTâches?.nombre || 0;
    this.tabs[3].count = this.processData.ProcessusÉchoués?.nombre || 0;
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.activeTabIndex = event.index;
    this.selection.clear();
    this.loadTabData(event.index);
  }

  loadTabData(tabIndex: number): void {
    if (!this.processData) return;

    let processes: ProcessData[] = [];
    switch (tabIndex) {
      case 0:
        processes = this.processData.processusInitiateurSeulement?.processus || [];
        break;
      case 1:
        processes = this.processData.processusLongs?.processus || [];
        break;
      case 2:
        processes = this.processData.processusSansTâches?.processus || [];
        break;
      case 3:
        processes = this.processData.ProcessusÉchoués?.processus || [];
        break;
    }

    this.dataSource = new MatTableDataSource(processes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: ProcessData, filter: string) => {
      const f = filter.toLowerCase().trim();
      return (
          data.processInstanceId?.toLowerCase().includes(f) ||
          data.processDefinitionId?.toLowerCase().includes(f) ||
          data.processInitiator?.toLowerCase().includes(f)
      );
    };
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, "medium") || "";
  }

  onToggleProcessSuspension(processId: string, isSuspended: boolean): void {
    const action$ = isSuspended
        ? this.tasksService.ResumeProcess(processId)
        : this.tasksService.SuspendProcess(processId);

    action$.subscribe({
      next: (success) => {
        const actionText = isSuspended ? "repris" : "suspendu";
        if (success) {
          this.toastService.success(`Processus ${actionText}`, `Le processus ${processId} a été ${actionText}.`);
          this.refreshData();
        } else {
          this.toastService.error("Erreur", `Échec de la ${actionText} du processus ${processId}.`);
        }
      },
      error: () => {
        const actionText = isSuspended ? "reprendre" : "suspendre";
        this.toastService.error("Erreur", `Impossible de ${actionText} le processus ${processId}.`);
      },
    });
  }

  onTerminateProcess(processId: string): void {
    this.tasksService.TerminateProcess(processId).subscribe({
      next: (success) => {
        if (success) {
          this.toastService.success("Processus terminé", `Le processus ${processId} a été terminé avec succès.`);
          this.refreshData();
        } else {
          this.toastService.error("Erreur", `Échec de la terminaison du processus ${processId}.`);
        }
      },
      error: () => {
        this.toastService.error("Erreur", `Impossible de terminer le processus ${processId}.`);
      },
    });
  }

  onTransferTask(processData: ProcessData): void {
    this.selectedTaskForTransfer = [this.mapProcessToTask(processData)];
    this.showTransferModal = true;
  }

  onCloseTransferModal(): void {
    this.showTransferModal = false;
    this.selectedTaskForTransfer = [];

    if (this.isAutoTransfer) {
      this.isAutoTransfer = false;
      this.transferQueue = [];
      this.selection.clear();
    }
  }

  onTaskTransferred(assignment: TaskAssignment | TaskAssignment[]): void {
    const assignments = Array.isArray(assignment) ? assignment : [assignment];

    for (const a of assignments) {
      const assignee = a.assigneeId || a.assigneeType;
      this.toastService.success("Tâche transférée", `La tâche ${a.taskId} a été transférée à ${assignee}.`);
    }

    if (this.isAutoTransfer) {
      this.showTransferModal = false;
      this.selectedTaskForTransfer = [];
      setTimeout(() => this.processNextTransfer(), 500);
    } else {
      this.refreshData();
    }
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case "failed":
      case "error":
        return "badge-error";
      case "warning":
        return "badge-warning";
      case "success":
      case "completed":
        return "badge-success";
      default:
        return "badge-info";
    }
  }
}
