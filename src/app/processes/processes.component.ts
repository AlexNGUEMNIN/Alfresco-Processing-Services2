import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { DatePipe } from "@angular/common";
import {
  ProcessData,
  ProcessResponse,
  ProcessService,
} from "../core/services/process.service";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormsModule } from "@angular/forms";


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
    DatePipe,
  ],
  templateUrl: "./processes.component.html",
  styleUrls: ["./processes.component.scss"],
  providers: [DatePipe],
})
export class ProcessesComponent implements OnInit, OnDestroy {
  activeTabIndex = 0;
  loading = true;
  tabs = [
    { label: "Initiateur uniquement", key: "processusInitiateurSeulement", count: 0 },
{ label: "Processus longs", key: "processusLongs", count: 0 },
{ label: "Sans tâches", key: "processusSansTâches", count: 0 },
{ label: "Échecs", key: "nombreProcessusÉchoués", count: 0 },
  ];

  displayedColumns: string[] = [
    "processInstanceId",
    "processDefinitionId",
    "processStartTime",
    "processInitiator",
  ];
  dataSource: MatTableDataSource<ProcessData> =
    new MatTableDataSource<ProcessData>([]);
  processData: ProcessResponse | null = null;
  private socketSubscription!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private webSocketService: ProcessService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
      this.connectToWebSocket();
    }, 800); // Simule un délai de chargement pour la preview des skeletons
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) this.socketSubscription.unsubscribe();
    this.webSocketService.close();
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

        // Optional: try to reconnect after a delay
        setTimeout(() => this.connectToWebSocket(), 5000);
      },
      complete: () => {
        console.warn("WebSocket completed unexpectedly");

        // Prevent termination — reconnect
        setTimeout(() => this.connectToWebSocket(), 5000);
      },
    });
  }

  refreshData(): void {
    this.loading = true;
    setTimeout(() => {
      this.connectToWebSocket();
    }, 800);
  }

  updateTabCounts(): void {
    if (!this.processData) return;
    this.tabs[0].count =
      this.processData.processusInitiateurSeulement?.nombre || 0;
    this.tabs[1].count = this.processData.processusLongs?.nombre || 0;
    this.tabs[2].count = this.processData.processusSansTâches?.nombre || 0;
    this.tabs[3].count = this.processData.nombreProcessusÉchoués || 0;
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
        processes = []; // You can customize failed process display here
        break;
    }

    this.dataSource = new MatTableDataSource(processes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (
      data: ProcessData,
      filter: string
    ): boolean => {
      const lowercase = filter.trim().toLowerCase();
      return (
        data.processInstanceId?.toLowerCase().includes(lowercase) ||
        data.processDefinitionId?.toLowerCase().includes(lowercase) ||
        data.processInitiator?.toLowerCase().includes(lowercase)
      );
    };
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, "medium") || "";
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
