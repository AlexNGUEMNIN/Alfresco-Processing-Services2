import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class AuthService {
  login(token: string) {
    localStorage.setItem("auth_token", token);
  }
  logout() {
    localStorage.removeItem("auth_token");
    this.router.navigate(["/login"]);
  }
  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  }
  constructor(private router: Router) {}
}
