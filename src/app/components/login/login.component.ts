import { Component, effect, inject } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../services/authService/auth.service";
import { User } from "../../interfaces/user";
import { Router, RouterLink } from "@angular/router";
import { LoginRequest } from "../../interfaces/login";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  isValidEmail: boolean = false;
  userExist: boolean = false;
  errorMessage!: string;
  isLogged: boolean = false;

  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required]),
  });

  private authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    effect(() => {
      //signal
      this.isLogged = this.authService.isLogged();
    });
  }

  checkEmailLogin() {
    this.authService.isLoggedIn();
    if (this.isLogged == false) {
      const loginEmail: string =
        this.loginForm.get("email")?.value?.toLowerCase() || "";
      this.authService.checkEmailExists(loginEmail).subscribe({
        next: (users: User[]) => {
          if (users.length > 0) {
            this.userExist = true;
            this.isValidEmail = true;
          } else {
            this.userExist = false;
            this.isValidEmail = true;
            this.router.navigate(["/register"]);
          }
        },
        error: (error: string) => {
          console.error("Error al verificar email:", error);
          this.errorMessage = "Error al verificar email";
          this.isValidEmail = false;
        },
      });
    } else {
      this.router.navigate(["/"]);
    }
  }

  userLogin() {
    const credentials: LoginRequest = {
      email: this.loginForm.get("email")?.value || "",
      password: this.loginForm.get("password")?.value || "",
    };
    this.authService.login(credentials).subscribe({
      next: (response) => {
        sessionStorage.setItem("authToken", response.accessToken);
        this.authService.isLoggedIn();
        this.router.navigate(["/"]);
      },
      error: (error) => {
        this.errorMessage = "Wrong password";
        console.error("Error en login", error);
      },
    });
  }
}
