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
  

  login() {
    // if (this.verification()) {
      
    //   this.errorMessage = undefined;
    //   this.authService.login(this.email, this.password!).subscribe({
    //     next: (rep: any) => {
        
    //       console.log(rep);
    //       this.authService.setBearerToken(rep?.token.bearer);
    //       this.authService.setRefreshToken(rep?.token.refresh);
    //       this.authService.setCurrentAuthUser(rep?.utilisateur as IUtilisateur);
    //       localStorage.setItem("authUser", JSON.stringify(this.authService.getCurrentAuthUser()));
    //       this.authUser = this.authService.getCurrentAuthUser();
    //       if (this.authUser?.role?.libelle == Role.ADMINISTRATEUR || this.authUser?.role?.libelle == Role.MODERATEUR || this.authUser?.role?.libelle == Role.COLLECTEUR || this.authUser?.role?.libelle == Role.JOURNALISTE) {
    //         this.router.navigate(['/admin']);
    //       }
    //       if (this.authUser?.role?.libelle == Role.UTILISATEUR) {
    //         this.router.navigate(['/home']);
    //       }
    //     },
    //     error: (err: any) => {
    //       this.handleError(err);
    //       console.log(err);
    //       console.log(this.errorMessage);
    //     }
    //   });
    // }
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
