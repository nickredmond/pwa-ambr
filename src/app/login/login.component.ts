import { Component, OnInit, Input } from '@angular/core';
import { UserService } from "../../shared/user.service";

import { User } from '../../models/user.model';
import { LoginStatus } from '../../models/loginStatus.enum';
import { RegistrationStatus } from '../../models/registrationStatus.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private REGISTRATION_ERROR_MESSAGE = "There was a problem registering your account. Please try again later.";
  private LOGIN_ERROR_MESSAGE = "There was a problem logging in. Please try again later.";

  // public isInvalidEmail = false;
  // public isPasswordBlank = false;
  // public isPasswordsNotMatching = false;
  // public isUserTaken = false;
  // public isPasswordIncorrect = false;
  // public isUserNotFound = false;
  public authenticationError = null;
  public invalidPasswordMessage = "";
  public invalidEmailMessage = "";

  public isLoggingIn = true;
  public currentUser: User = <User>{ emailAddress: "", password: "" };
  public passwordConfirmation: string = "";

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() { }

  public toggleForm(): void {
    this.isLoggingIn = !this.isLoggingIn;
  }

  public getLoginButtonText(): string {
    return this.isLoggingIn ? "Log In" : "Sign Up";
  }
  public getToggleFormText(): string {
    return this.isLoggingIn ? "Don't have an account? " : "Back to Login";
  }

  public forgotPassword() {
    // TODO: forgot password

    // prompt({
    //   title: "Forgot Password",
    //   message: "Enter the email address you used to register for Ambr to reset your password.",
    //   defaultText: "",
    //   okButtonText: "OK",
    //   cancelButtonText: "Cancel"
    // }).then((data) => {
    //   if (data.result) {
    //     // TODO: send pasword reset email
    //     alert({
    //       title: "Reset Password",
    //       message: "Please check your email for instructions to reset your password. The link will expire in 30 minutes."
    //     })
    //   }
    // });
  }

  public submit(): void {
    // todo: add loading spinner
    if (this.isLoggingIn) {
      this.tryLogIn();
    }
    else {
      this.tryRegister();
    }
  }

  private tryLogIn(): void {
    this.resetErrorMessages();

    if (!this.isEmailAddressValid(this.currentUser.emailAddress)) {
      this.invalidEmailMessage = "Please provide a valid email address.";
      this.invalidateField("email");
    } else if (!this.currentUser.password) {
      this.invalidPasswordMessage = "Password is required.";
      this.invalidateField("password");
    } else {
      this.userService.logIn(this.currentUser).subscribe(
        (response) => {
          const loginStatus = this.userService.processLoginResult(response);
          this.processLoginResponse(loginStatus);
        },
        (error) => {
          this.authenticationError = this.LOGIN_ERROR_MESSAGE;
        }
      );
    }
  }

  private processLoginResponse(status: LoginStatus): void {
    if (status === LoginStatus.UserLoggedIn) {
      this.router.navigate(["auctions"]);
    } else if (status === LoginStatus.UserNotFound) {
      this.invalidEmailMessage = "No user found with that email address.";
      this.invalidateField("email");
    } else if (status === LoginStatus.IncorrectPassword) {
      this.invalidPasswordMessage = "Incorrect password. Please try again."
      this.invalidateField("password");
    } else {
      this.authenticationError = this.LOGIN_ERROR_MESSAGE;
    }
  }
  
  private tryRegister(): void {
    this.resetErrorMessages();

    if (!this.isEmailAddressValid(this.currentUser.emailAddress)) {
      this.invalidEmailMessage = "Please provide a valid email address.";
      this.invalidateField("email");
    } else if (!this.currentUser.password) {
      this.invalidPasswordMessage = "Password is required.";
      this.invalidateField("password");
    } else if (this.currentUser.password !== this.passwordConfirmation) {
      this.invalidateField("passwordConfirmation");
    } else {
      this.userService.register(this.currentUser).subscribe(
        (response) => {
          const registrationStatus = this.userService.processRegistrationResult(response);
          this.processRegistrationResponse(registrationStatus);
        },
        (error) => {
          this.authenticationError = this.REGISTRATION_ERROR_MESSAGE;
        }
      );
    }
  }

  private processRegistrationResponse(status: RegistrationStatus): void {
    if (status === RegistrationStatus.UserCreatedSuccessfully) {
      this.router.navigate(["auctions"]);
    } else if (status === RegistrationStatus.UserAlreadyExists) {
      this.invalidEmailMessage = "User already exists with that email address.";
    } else {
      this.authenticationError = this.REGISTRATION_ERROR_MESSAGE;
    }
  }

  private invalidateField(fieldId: string): void {
    document.getElementById(fieldId).classList.add("is-invalid");
  }

  private resetErrorMessages(): void {
    document.getElementById("email").classList.remove("is-invalid");
    document.getElementById("password").classList.remove("is-invalid");

    const passwordConfirmInput = document.getElementById("password-confirmation");
    if (passwordConfirmInput) {
      passwordConfirmInput.classList.remove("is-invalid");
    }
    
    this.authenticationError = null;
  }

  private isEmailAddressValid(emailAddress: string): boolean {
    const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return emailRegex.test(emailAddress);
  }
}
