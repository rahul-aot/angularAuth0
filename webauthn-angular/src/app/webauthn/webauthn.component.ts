import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WebAuthnService } from '../service/web-authn.service';

@Component({
  selector: 'app-webauthn',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container">
      <input 
        [(ngModel)]="email" 
        type="email" 
        placeholder="Email" 
        class="form-control"
      />
      
      <div class="button-group">
        <button (click)="signup()" class="btn btn-primary">Sign Up</button>
        <button (click)="login()" class="btn btn-success">Log In</button>
      </div>

      <div *ngIf="message" class="alert" 
           [ngClass]="{'alert-success': isSuccess, 'alert-danger': !isSuccess}">
        {{ message }}
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 1rem;
      text-align: center;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 1rem;
    }
    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn {
      padding: 0.5rem 1rem;
    }
    .alert {
      margin-top: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
    }
    .alert-success {
      background-color: #d4edda;
      color: #155724;
    }
    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
    }
  `]
})
export class WebAuthnComponent {
  email = '';
  message = '';
  isSuccess = false;

  constructor(private webAuthnService: WebAuthnService) {}

  async signup() {
    if (!this.email) {
      this.showMessage('Please enter an email', false);
      return;
    }

    const result = await this.webAuthnService.register(this.email);
    this.showMessage(
      result 
        ? `Successfully registered ${this.email}` 
        : 'Registration failed', 
      result
    );
  }

  async login() {
    if (!this.email) {
      this.showMessage('Please enter an email', false);
      return;
    }

    const result = await this.webAuthnService.authenticate(this.email);
    this.showMessage(
      result 
        ? `Successfully logged in ${this.email}` 
        : 'Login failed', 
      result
    );
  }

  private showMessage(text: string, success: boolean) {
    this.message = text;
    this.isSuccess = success;

    // Auto-clear message after 5 seconds
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}