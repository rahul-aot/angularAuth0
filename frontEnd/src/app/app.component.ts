import { Component } from '@angular/core';
import { WebAuthnService } from './services/webauthn.service';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h1>WebAuthn Example</h1>
      <button (click)="register()">Register Fingerprint</button>
      <button (click)="login()">Login with Fingerprint</button>
    </div>
  `
})
export class AppComponent {
  constructor(private webAuthnService: WebAuthnService) {}

  register() {
    this.webAuthnService.register('testUser') // Pass username or user ID
      .then(() => console.log('Registration successful!'))
      .catch(err => console.error('Registration error:', err));
  }

  login() {
    this.webAuthnService.login('testUser') // Pass username or user ID
      .then(() => alert('Login successful!'))
      .catch(err => alert('Login error: ' + err));
  }
}
