import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Process, ProcessFilter } from "../core/models/process.model";
import { ProcessService } from "../core/services/process.service";
import { MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
}

/** Constants used to fill up our data base. */
const COLORS: string[] = [
  "maroon",
  "red",
  "orange",
  "yellow",
  "olive",
  "green",
  "purple",
  "fuchsia",
  "lime",
  "teal",
  "aqua",
  "blue",
  "navy",
  "black",
  "gray",
];
const NAMES: string[] = [
  "Maia",
  "Asher",
  "Olivia",
  "Atticus",
  "Amelia",
  "Jack",
  "Charlotte",
  "Theodore",
  "Isla",
  "Oliver",
  "Isabella",
  "Jasper",
  "Cora",
  "Levi",
  "Violet",
  "Arthur",
  "Mia",
  "Thomas",
  "Elizabeth",
];

/**
 * @title Data table with sorting, pagination, and filtering.
 */

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
  ],
  templateUrl: "./processes.component.html",
  styleUrls: ["./processes.component.scss"],
})
export class ProcessesComponent implements OnInit {
  processes: Process[] = [];
  filteredProcesses: Process[] = [];
  selectedProcess: Process | null = null;
  loading = true;

  filter: ProcessFilter = {};

  showProcessDetails = false;
  displayedColumns: string[] = ["id", "name", "progress", "color"];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private processService: ProcessService) {
    const users = Array.from({ length: 100 }, (_, k) => createNewUser(k + 1));
    this.dataSource = new MatTableDataSource(users);
  }

  ngOnInit(): void {
    this.loadProcesses();
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  loadProcesses(): void {
    this.loading = true;

    this.processService.getProcesses().subscribe((processes) => {
      this.processes = processes;
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters(): void {
    this.filteredProcesses = [...this.processes];

    if (this.filter.status) {
      this.filteredProcesses = this.filteredProcesses.filter(
        (p) => p.status === this.filter.status
      );
    }

    if (this.filter.searchTerm) {
      const searchTerm = this.filter.searchTerm.toLowerCase();
      this.filteredProcesses = this.filteredProcesses.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.id.toLowerCase().includes(searchTerm)
      );
    }
  }

  clearFilters(): void {
    this.filter = {};
    this.applyFilters();
  }

  closeProcessDetails(): void {
    this.selectedProcess = null;
  }

  restartProcess(id: string): void {
    this.processService.restartProcess(id).subscribe((success) => {
      if (success) {
        // Refresh the process list
        this.loadProcesses();
      }
    });
  }

  terminateProcess(id: string): void {
    this.processService.terminateProcess(id).subscribe((success) => {
      if (success) {
        // Refresh the process list
        this.loadProcesses();
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "active":
        return "badge-success";
      case "abandoned":
        return "badge-error";
      case "terminated":
        return "badge-info";
      default:
        return "";
    }
  }

  selectProcess(process: any) {
    this.selectedProcess = process;
    this.showProcessDetails = true;
  }

  onCloseProcessDetails() {
    this.showProcessDetails = false;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

/** Builds and returns a new User. */
function createNewUser(id: number): UserData {
  const name =
    NAMES[Math.round(Math.random() * (NAMES.length - 1))] +
    " " +
    NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) +
    ".";

  return {
    id: id.toString(),
    name: name,
    progress: Math.round(Math.random() * 100).toString(),
    color: COLORS[Math.round(Math.random() * (COLORS.length - 1))],
  };
}
