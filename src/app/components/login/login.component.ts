import { Component, effect, inject } from "@angular/core";
import { AuthService } from "../../services/authService/auth.service";
import { User } from "../../interfaces/user";
import { Router} from "@angular/router";
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
  isValidEmail: boolean = false;
  userExist: boolean = false;
  errorMessage!: string;
  isLogged: boolean = false;

  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required]),
  });

  private authService = inject(AuthService);
  private userService = inject(UserService);
  
  constructor(
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
            
      const loginEmail: string = this.loginForm.get("email")?.value?.toLowerCase() || "";
      console.log("loginEmail:", loginEmail);
      
      
      this.userService.checkEmailExists(loginEmail).subscribe({
        next: (exist) => {
          console.log("exist:", exist);
          
          if (exist == true) {          
            this.userExist = true;
            this.isValidEmail = true;
            console.log("Usuario existe");
            
          } else if (exist == false) {
            this.userExist = false;
            this.isValidEmail = true;
            this.router.navigate(["/"]);
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
      this.router.navigate(["/"]);
    }
  }

  userLogin() {
    const credentials: LoginRequest = {
      email: this.loginForm.get("email")?.value || "",
      password: this.loginForm.get("password")?.value || "",
    };
    console.log("credentials", credentials);
    
    this.authService.loginUser(credentials).subscribe({
      next: (response) => {
        sessionStorage.setItem("authToken", response.accessToken);
        console.log("response:", response.accessToken);
        
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
