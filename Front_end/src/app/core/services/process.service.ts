// src/app/core/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../../environments/environment';

export interface ProcessData {
  processInstanceId: string;
  processDefinitionId: string;
  processStartTime: string;
  processInitiator: string;
}

export interface ProcessResponse {
  processusInitiateurSeulement: {
    processus: ProcessData[];
    nombre: number;
  };
  processusLongs: {
    processus: ProcessData[];
    nombre: number;
  };
  nombreProcessusÉchoués: number;
  processusSansTâches: {
    processus: ProcessData[];
    nombre: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private socket$: WebSocketSubject<ProcessResponse>;

  constructor() {
    this.socket$ = webSocket(`ws://localhost:8082/ws/processes`);
  }

  connect() {
    return this.socket$.asObservable();
  }

  close() {
    this.socket$.complete();
  }
}