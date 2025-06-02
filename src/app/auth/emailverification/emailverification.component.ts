import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-emailverification',
  standalone: true,
  imports: [NgIf, NgClass, FormsModule],
  templateUrl: './emailverification.component.html',
  styleUrl: './emailverification.component.scss'
})
export class EmailverificationComponent {
  emailInvalid = false;
  email = '';
  message = '';
  isSuccess = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email || !this.email.includes('@')) {
      this.emailInvalid = true;
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'Un email de réinitialisation a été envoyé à votre adresse.';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: () => {
        this.isSuccess = false;
        this.message = 'Une erreur est survenue. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }
}