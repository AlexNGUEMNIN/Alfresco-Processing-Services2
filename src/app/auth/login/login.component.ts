import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
// import { IUtilisateur } from '../../../models/iutilisateur';
// import { Role } from '../../../enums/role';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email!: string;
  password!: string;
  errorMessage: string | undefined;
  // authUser?: IUtilisateur | null;
  emailM!: string;
  passwordM!: string;

  constructor(private authService: AuthService, private router: Router) {}

  verification(): boolean {
    this.emailM = '';
    this.passwordM = '';

    if (!this.email || !this.email.includes('@')) {
      this.emailM = 'Adresse email invalide';
      return false;
    }

    if (!this.password || this.password.length < 5) {
      this.passwordM = 'Le mot de passe doit contenir au moins 5 caractères';
      return false;
    }

    return true;
  }
  

  

  private handleError(err: HttpErrorResponse) {
    if (err.status === 401) {
      this.errorMessage = "Vos informations semblent erronées";
    } else if (err.status === 403) {
      this.router.navigate(['/unauthorised']);
    } else if (err.status === 404) {
      this.router.navigate(['/pageNotFound']);
    } else if (err.status === 500) {
      this.errorMessage = "Erreur du serveur, veuillez réessayer plus tard";
    } else {
      this.errorMessage = "Une erreur est survenue, veuillez réessayer plus tard";
    }
  }
}
