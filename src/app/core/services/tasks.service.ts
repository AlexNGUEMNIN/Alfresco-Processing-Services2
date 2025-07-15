import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, catchError, throwError, of} from 'rxjs';
import { User } from '../models/user.model';
import {TaskAssignment} from "../models/task.model";
import {map} from "rxjs/operators";
import {AuthService} from "./auth.service";  // Fixed import path (changed from task.model)

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly apiUrl = `http://localhost:8082/api/users`;  // Use environment variable

  constructor(private http: HttpClient,private authService: AuthService) { }

  getUsers(): Observable<User[]> {
    const token = this.authService.accessToken;
    if (!token) return throwError(() => new Error('No access token found'));

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<User[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      // You can add more specific error messages based on status code
      if (error.status === 404) {
        errorMessage = 'Resource not found';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden';
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  SuspendProcess(processId: string): Observable<boolean> {
    const authHeader = this.authService.getBasicAuthHeader();

    if (!authHeader) {
      console.error('❌ Identifiants manquants dans le localStorage.');
      // Retourne un observable avec false ou tu peux throw une erreur
      return of(false);
    }

    const url = `http://192.168.43.231:8080/activiti-app/api/enterprise/process-instances/${processId}/suspend`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authHeader
    });

    return this.http.put(url, null, { headers, observe: 'response' }).pipe(
        map(response => response.status === 200),
        catchError(error => {
          console.error('❌ Erreur lors de la suspension du processus:', error);
          return of(false);
        })
    );
  }
  ResumeProcess(processId: string): Observable<boolean> {
    const authHeader = this.authService.getBasicAuthHeader();

    if (!authHeader) {
      console.error('❌ Identifiants manquants dans le localStorage.');
      return of(false);
    }

    const url = `http://192.168.43.231:8080/activiti-app/api/enterprise/process-instances/${processId}/activate`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authHeader
    });

    return this.http.put(url, null, { headers, observe: 'response' }).pipe(
        map(response => response.status === 200),
        catchError(error => {
          console.error('❌ Erreur lors de la reprise du processus:', error);
          return of(false);
        })
    );
  }

  TerminateProcess(processId: string): Observable<boolean> {
    const authHeader = this.authService.getBasicAuthHeader();

    if (!authHeader) {
      console.error('❌ Identifiants manquants dans le localStorage.');
      return of(false);
    }

    const url = `http://192.168.43.231:8080/activiti-app/api/enterprise/process-instances/${processId}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authHeader
    });

    return this.http.delete(url, {
      headers,
      observe: 'response'
    }).pipe(
        map(response => response.status === 200),
        catchError(error => {
          console.error('❌ Erreur lors de la terminaison du processus :', error);
          return of(false);
        })
    );
  }

}