import { Injectable } from '@angular/core';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

@Injectable({
  providedIn: 'root'
})
export class WebAuthnService {
  constructor() {}

  async register(username: string) {
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        body: JSON.stringify({ username }),
        headers: { 'Content-Type': 'application/json' }
      });
      const options = await response.json();
      console.log(options);
      const credential = await startRegistration(options);

      // Send credential to the server for verification
      await fetch('http://localhost:3000/verify-registration', {
        method: 'POST',
        body: JSON.stringify(credential),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  async login(username: string) {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        body: JSON.stringify({ username }),
        headers: { 'Content-Type': 'application/json' }
      });
      const options = await response.json();
      const assertion = await startAuthentication(options);

      // Send assertion to the server for verification
      await fetch('http://localhost:3000/verify-login', {
        method: 'POST',
        body: JSON.stringify(assertion),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }
}
