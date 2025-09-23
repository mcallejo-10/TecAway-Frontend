import { Component, effect, inject } from "@angular/core";
import { AuthService } from "../../services/authService/auth.service";
import { Router } from "@angular/router";
import { LoginRequest } from "../../interfaces/login";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UserService } from "../../services/userService/user.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  isValidEmail = false;
  userExist = false;
  errorMessage!: string;
  isLogged = false;

  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required]),
  });

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      //signal
      this.isLogged = this.authService.isLogged();
    });
  }

  checkEmailLogin() {
    this.authService.isLoggedIn();
    if (this.isLogged === false) {

      const email = this.loginForm.get('email')?.value?.toLowerCase() || '';

      this.userService.checkEmailExists({ email }).subscribe({
        next: (exist) => {


          if (exist === true) {
            this.userExist = true;
            this.isValidEmail = true;
            console.log("Usuario existe");

          } else if (exist === false) {
            this.userExist = false;
            this.isValidEmail = true;
            this.router.navigate(["/registro"]);
            console.log("Usuario no existe");

          }
        },
        error: (error: string) => {
          console.error("Error al verificar email:", error);
          this.errorMessage = "Error al verificar email";
          this.isValidEmail = false;
        },
      });
    } else {
      this.router.navigate(["/login"]);
    }
  }

  userLogin() {
    const credentials: LoginRequest = {
      email: this.loginForm.get("email")?.value?.toLowerCase() || "",
      password: this.loginForm.get("password")?.value || "",
    };

    this.authService.loginUser(credentials).subscribe({
      next: () => {
        this.router.navigate(["/tu-cuenta"]);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || "Error en login";
        console.error("Error en login:", error);
      },
    });
  }
}
