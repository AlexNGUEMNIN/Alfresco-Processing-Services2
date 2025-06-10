export interface SystemStats {
  activeProcesses: number;
  pendingProcesses: number;
  completedProcesses: number;
  stoppedProcesses: number;
  abandonedProcesses: number;
  totalProcesses: number;
  systemUptime: string;
  lastUpdate: Date;
}

export interface ProcessStatusCount {
  status: string;
  count: number;
  percentage: number;
  color: string;
}