import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { DatePipe, CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";

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
    {
      label: "Uniquement par son initiateur",
      key: "processusInitiateurSeulement",
      count: 0,
    },
    { label: "Qu'une seule tâche exécutée", key: "processusLongs", count: 0 },
    {
      label: "Avec erreur/exception technique",
      key: "processusSansTâches",
      count: 0,
    },
    {
      label: "Sans aucune tâche utilisateur",
      key: "nombreProcessusÉchoués",
      count: 0,
    },
  ];

  displayedColumns = [
    "processInstanceId",
    "processDefinitionId",
    "processStartTime",
    "processInitiator",
    "actions",
  ];
  dataSource = new MatTableDataSource<ProcessData>([]);
  processData: ProcessResponse | null = null;

  showTransferModal = false;
  selectedTaskForTransfer: Task | null = null;
  toasts: ToastMessage[] = [];

  private socketSubscription!: Subscription;
  private toastSubscription!: Subscription;

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
    setTimeout(() => this.connectToWebSocket(), 800);
  }

  updateTabCounts(): void {
    if (!this.processData) return;
    this.tabs[0].count =
      this.processData.processusInitiateurSeulement?.nombre || 0;
    this.tabs[1].count = this.processData.processusLongs?.nombre || 0;
    this.tabs[2].count = this.processData.processusSansTâches?.nombre || 0;
    this.tabs[3].count = this.processData.ProcessusÉchoués?.nombre || 0;
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.activeTabIndex = event.index;
    this.loadTabData(event.index);
  }

  loadTabData(tabIndex: number): void {
    if (!this.processData) return;

    let processes: ProcessData[] = [];

    switch (tabIndex) {
      case 0:
        processes =
          this.processData.processusInitiateurSeulement?.processus || [];
        break;
      case 1:
        processes = this.processData.processusLongs?.processus || [];
        break;
      case 2:
        processes = this.processData.processusSansTâches?.processus || [];
        break;
      case 3:
        processes = this.processData.ProcessusÉchoués?.processus || []; // ✅ Add this
        break;
      default:
        processes = [];
    }

    this.dataSource = new MatTableDataSource(processes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (
      data: ProcessData,
      filter: string
    ): boolean => {
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
      ? this.tasksService.ResumeProcess(processId) // If suspended, resume
      : this.tasksService.SuspendProcess(processId); // Else suspend

    action$.subscribe({
      next: (success) => {
        if (success) {
          const actionText = isSuspended ? "repris" : "suspendu";
          this.toastService.success(
            `Processus ${actionText}`,
            `Le processus ${processId} a été ${actionText}.`
          );
          this.refreshData();
        } else {
          const actionText = isSuspended ? "reprise" : "suspension";
          this.toastService.error(
            "Erreur",
            `Échec de la ${actionText} du processus ${processId}.`
          );
        }
      },
      error: () => {
        const actionText = isSuspended ? "reprendre" : "suspendre";
        this.toastService.error(
          "Erreur",
          `Impossible de ${actionText} le processus ${processId}.`
        );
      },
    });
  }

  onTerminateProcess(processId: string): void {
    //Appeler le service pour arrêter le processus (implémentation à adapter selon votre backend)
  }

  onTransferTask(processData: ProcessData): void {
    this.selectedTaskForTransfer = {
      id: processData.taskId ?? `TASK-${processData.processInstanceId}`,
      processInstanceId: processData.processInstanceId,
      processDefinitionId: processData.processDefinitionId,
      name: `Tâche pour ${processData.processDefinitionId}`,
      description: `Tâche liée au processus ${processData.processInstanceId}`,
      assignee: processData.processInitiator,
      created: new Date(processData.processStartTime),
      priority: 50,
      status: "assigned",
      // ✅ Include custom fields
      managerId: processData.managerId || null,
      managerEmail: processData.managerEmail || null,
      groupName: processData.groupName || null,
      groupId: processData.groupId || null,
    } as Task & {
      managerEmail?: string;
      groupName?: string;
      groupId?: string;
    };

    this.showTransferModal = true;
  }

  onCloseTransferModal(): void {
    this.showTransferModal = false;
    this.selectedTaskForTransfer = null;
  }

  onTaskTransferred(assignment: TaskAssignment): void {
    const assignee = assignment.assigneeId || assignment.assigneeType;
    this.toastService.success(
      "Tâche transférée",
      `La tâche ${assignment.taskId} a été transférée à ${assignee}.`
    );
    this.refreshData();
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
