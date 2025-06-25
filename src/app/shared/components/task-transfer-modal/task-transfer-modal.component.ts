import {
  Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { TasksService } from '../../../core/services/tasks.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task, User, TaskAssignment } from '../../../core/models/task.model';
import { WebSocketService } from "../../../core/services/websocket.service";
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-task-transfer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-transfer-modal.component.html',
  styleUrls: ['./task-transfer-modal.component.scss']
})
export class TaskTransferModalComponent implements OnInit, OnChanges, OnDestroy {
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
  transferError = false;
  errorMessage = '';

  private wsSubscription?: Subscription;
  private currentUserId: string;

  constructor(
      private taskService: TasksService,
      private authService: AuthService,
      private http: HttpClient,
      private websocketService: WebSocketService
  ) {
    this.currentUserId = this.authService.getDecodedToken()?.sub || '';
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) {
      this.loadUsers();
      this.resetTransferState();
    }
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private resetTransferState(): void {
    this.transferring = false;
    this.transferError = false;
    this.errorMessage = '';
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.taskService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
      }
    });
  }

  selectAssigneeType(type: 'manager' | 'group' | 'user'): void {
    this.selectedAssigneeType = type;
  }

  selectUser(userId: string): void {
    this.selectedUserId = userId;
  }

  filterUsers(): void {
    const term = this.searchTerm?.toLowerCase().trim();
    this.filteredUsers = !term
        ? this.users
        : this.users.filter(user =>
            (user.firstName?.toLowerCase().includes(term) || '') ||
            (user.lastName?.toLowerCase().includes(term) || '') ||
            (user.email?.toLowerCase().includes(term) || '') ||
            (user.role?.toLowerCase().includes(term) || '')
        );
  }

  goBack(): void {
    this.currentStep = 1;
    this.selectedUserId = null;
  }

  canProceed(): boolean {
    return this.currentStep === 1
        ? this.selectedAssigneeType !== null
        : this.currentStep === 2
            ? this.selectedUserId !== null
            : false;
  }

  async onTransfer(): Promise<void> {
    if (!this.canProceed() || !this.taskData) {
      console.warn('⚠️ Transfert impossible: condition ou tâche manquante.');
      return;
    }

    if (this.selectedAssigneeType === 'user' && this.currentStep === 1) {
      console.log('🧭 Passage à l\'étape suivante de l\'assignation utilisateur.');
      this.currentStep = 2;
      return;
    }

    this.transferring = true;
    this.transferError = false;

    try {
      const assignment: TaskAssignment = {
        taskId: this.taskData.id,
        assigneeType: this.selectedAssigneeType!,
        assigneeId: this.selectedUserId || undefined
      };

      const assigneeEmail = this.users.find(u => u.id === assignment.assigneeId)?.email || '';
      if (!this.currentUserId || !assigneeEmail) {
        throw new Error('🔍 Informations utilisateur manquantes.');
      }

      console.log('📧 Email de l\'assigné:', assigneeEmail);

      const basicAuthHeader = this.authService.getBasicAuthHeader();
      if (!basicAuthHeader) throw new Error('🔐 Informations d\'authentification introuvables.');

      // Fetch user ID by email
      const fetchedUserId = await this.http
          .get<string>(`http://localhost:8082/api/users/db-id-by-email?email=${encodeURIComponent(assigneeEmail)}`, { responseType: 'text' as 'json' })
          .toPromise();

      if (!fetchedUserId || fetchedUserId.trim() === '') {
        throw new Error(`🛑 ID introuvable pour l'email: ${assigneeEmail}`);
      }

      const targetUserId = assignment.assigneeId;
      const trimmedUserId = fetchedUserId.trim();

      console.log('🔗 ID récupéré pour transfert:', trimmedUserId);
      console.log('📡 PUT vers APS avec:', {
        assignee: trimmedUserId,
        email: assigneeEmail
      });

      await this.http.put(
          `http://localhost:8080/activiti-app/api/enterprise/tasks/${assignment.taskId}/action/assign`,
          {
            assignee: trimmedUserId,
            email: assigneeEmail
          },
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': basicAuthHeader
            })
          }
      ).toPromise();

      console.log('✅ Tâche assignée à l\'utilisateur avec succès.');

      const payload = {
        taskId: assignment.taskId,
        message: `Vous avez une nouvelle tâche à examiner.`,
        senderId: this.currentUserId,
        targetUserId: targetUserId
      };

      console.log('📨 Notification en cours d\'envoi:', payload);
      await this.sendHttpNotification(payload);
      await this.sendEmailNotification(
          assigneeEmail,
          'Nouvelle tâche assignée',
          `Bonjour,\n\nUne tâche vous a été assignée dans le système.\nMerci de la traiter dès que possible.`
      );

      console.log('📤 Transfert finalisé avec:', assignment);
      this.taskTransferred.emit(assignment);
      this.onClose();

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Échec du transfert.';
      this.handleTransferError(msg);
      console.error('❌ Erreur durant le transfert:', error);
    } finally {
      this.transferring = false;
      console.log('🔚 Fin du traitement de transfert.');
    }
  }


  async onManagerTransfer(): Promise<void> {
    if (!this.taskData) {
      console.warn('⚠️ Données de tâche non disponibles.');
      return;
    }

    this.transferring = true;
    this.transferError = false;

    try {
      const managerEmail = (this.taskData as any).managerEmail;
      const managerId = (this.taskData as any).managerId;

      if (!managerEmail || managerEmail.trim() === '') {
        throw new Error('Aucun email de manager disponible pour ce processus.');
      }

      console.log('📧 Recherche de l\'ID du manager pour:', managerEmail);

      const response = await this.http
          .get(`http://localhost:8082/api/users/id-by-email?email=${encodeURIComponent(managerEmail)}`, {
            responseType: 'text'
          })
          .toPromise();

      const targetUserId = response?.trim();

      if (!this.currentUserId || !targetUserId || targetUserId === '') {
        throw new Error(`Le manager (${managerEmail}) n'a pas pu être trouvé dans le système.`);
      }

      console.log('🆔 ID du manager trouvé:', targetUserId);

      const assignment: TaskAssignment = {
        taskId: this.taskData.id,
        assigneeType: 'manager',
        assigneeId: targetUserId
      };

      const basicAuthHeader = this.authService.getBasicAuthHeader();
      if (!basicAuthHeader) throw new Error('Identifiants non disponibles.');

      console.log('🚀 Assignation de la tâche au manager avec APS REST API…');

      await this.http.put(
          `http://localhost:8080/activiti-app/api/enterprise/tasks/${assignment.taskId}/action/assign`,
          { assignee: managerId, email: managerEmail },
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': basicAuthHeader
            })
          }
      ).toPromise();

      console.log('✅ Tâche assignée avec succès au manager.');

      const payload = {
        taskId: assignment.taskId,
        message: `Vous avez une nouvelle tâche à examiner.`,
        senderId: this.currentUserId,
        targetUserId: targetUserId
      };

      console.log('📨 Envoi de la notification au manager:', payload);
      await this.sendHttpNotification(payload);
      await this.sendEmailNotification(
          managerEmail,
          'Tâche transférée au Manager',
          `Bonjour,\n\nUne tâche vous a été transférée pour validation dans le système.\nVeuillez la consulter rapidement.`
      );

      console.log('📤 Transfert terminé:', assignment);
      this.taskTransferred.emit(assignment);
      this.onClose();

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Échec du transfert vers le manager.';
      this.handleTransferError(msg);
      console.error('❌ Erreur transfert manager :', error);
    } finally {
      this.transferring = false;
      console.log('🔚 Fin du processus de transfert de tâche au manager.');
    }
  }

  async onTransferGroup(): Promise<void> {
    if (!this.taskData || !(this.taskData as any).groupId) {
      console.warn('⚠️ Tâche ou groupe non défini:', this.taskData);
      this.handleTransferError('Aucun groupe associé à cette tâche.');
      return;
    }

    this.transferring = true;
    this.transferError = false;

    try {
      const groupId = (this.taskData as any).groupId;
      const groupName = (this.taskData as any).groupName;

      console.log('📦 Groupe sélectionné:', { groupId, groupName });

      const basicAuthHeader = this.authService.getBasicAuthHeader();
      if (!basicAuthHeader) throw new Error('Identifiants de connexion introuvables.');

      // Assign task to group in APS
      await this.http.post(
          `http://localhost:8080/activiti-app/api/enterprise/tasks/${this.taskData.id}/groups/${groupId}`,
          null,
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': basicAuthHeader
            })
          }
      ).toPromise();

      console.log('✅ Tâche assignée au groupe dans APS');

      // 1. Fetch user IDs for notifications
      const userIds = await this.http
          .get<string[]>(`http://localhost:8082/api/users/members-by-group-name?groupName=${encodeURIComponent(groupName)}`)
          .toPromise() ?? [];

      // 2. Fetch user emails for sending email
      const userEmails = await this.http
          .get<string[]>(`http://localhost:8082/api/users/emails-by-group?groupName=${encodeURIComponent(groupName)}`)
          .toPromise() ?? [];

      console.log(`📨 Envoi de ${userIds.length} notifications & ${userEmails.length} emails.`);

      // 3. Notify each user & send email
      await Promise.all(userIds.map(async (userId, index) => {
        const email = userEmails[index];
        const payload = {
          taskId: this.taskData!.id,
          message: `Vous avez une nouvelle tâche à examiner (Groupe: ${groupName}).`,
          senderId: this.currentUserId,
          targetUserId: userId
        };

        await this.sendHttpNotification(payload);

        if (email) {
          const emailPayload = {
            to: email,
            subject: `Nouvelle Tâche Assignée - Groupe ${groupName}`,
            body: `Bonjour,\n\nUne nouvelle tâche vous a été assignée dans le groupe "${groupName}".\n\nVeuillez vous connecter à la plateforme pour plus de détails.\n\nMerci.`
          };

          await this.http.post(`http://localhost:8082/api/notifications/send-email`, emailPayload).toPromise();
          console.log(`📧 Email envoyé à: ${email}`);
        }
      }));

      const assignment: TaskAssignment = {
        taskId: this.taskData.id,
        assigneeType: 'group',
        assigneeId: groupId
      };

      console.log('📤 Transfert terminé:', assignment);
      this.taskTransferred.emit(assignment);
      this.onClose();

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec du transfert au groupe.';
      this.handleTransferError(message);
      console.error('❌ Erreur transfert groupe :', error);
    } finally {
      this.transferring = false;
      console.log('🔚 Fin du processus de transfert de tâche.');
    }
  }


  private async sendHttpNotification(payload: any): Promise<void> {
    try {
      await this.http.post(`${environment.apiUrl}/notifications/notify-user`, payload).toPromise();
    } catch (error) {
      console.warn('HTTP notification failed:', error);
      throw error;
    }
  }
  private async sendEmailNotification(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.http.post(
          `http://localhost:8082/api/notifications/send-email`,
          { to, subject, body },
          {
            responseType: 'text' as 'json' // 👈 FIX: tells Angular to treat plain text as valid
          }
      ).toPromise();
      console.log(`📧 Email envoyé à ${to}`);
    } catch (error) {
      console.warn('❌ Échec de l\'envoi de l\'email:', error);
    }
  }



  private async saveTransferToDatabase(
      taskId: string,
      targetId: string,
      assigneeType: string
  ): Promise<void> {
    if (!this.taskData) return;

    const payload = {
      userId: this.currentUserId,
      targetId: targetId,
      processInstanceId: this.taskData.processInstanceId,
      processDefinitionId: this.taskData.processDefinitionId,
      processStartTime: (this.taskData as any).created?.toISOString(),
      processInitiator: this.taskData.assignee,
      managerId: assigneeType === 'manager' ? targetId : null,
      managerEmail: (this.taskData as any).managerEmail || null,
      taskId: taskId,
      groupId: (this.taskData as any).groupId || null,
      groupName: (this.taskData as any).groupName || null
    };

    try {
      await this.http.post('http://localhost:8082/api/transfer', payload).toPromise();
    } catch (error) {
      console.error('❌ Failed to record transfer:', error);
    }
  }

  private handleTransferError(message: string): void {
    this.transferError = true;
    this.errorMessage = message;
    setTimeout(() => {
      this.transferError = false;
      this.errorMessage = '';
    }, 5000);
  }

  onClose(): void {
    this.currentStep = 1;
    this.selectedAssigneeType = null;
    this.selectedUserId = null;
    this.searchTerm = '';
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
