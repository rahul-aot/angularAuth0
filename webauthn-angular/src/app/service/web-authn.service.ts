import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { 
  startRegistration, 
  startAuthentication 
} from '@simplewebauthn/browser';
import { Observable, from, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebAuthnService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  initRegistration(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/init-register`, {
      params: { email },
      withCredentials: true
    });
  }

  verifyRegistration(registrationResponse: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-register`, registrationResponse, {
      withCredentials: true
    });
  }

  initAuthentication(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/init-auth`, {
      params: { email },
      withCredentials: true
    });
  }

  verifyAuthentication(authenticationResponse: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-auth`, authenticationResponse, {
      withCredentials: true
    });
  }

  async register(email: string): Promise<boolean> {
    try {
      // Get registration options
      const options = await this.initRegistration(email).toPromise();
      
      // Start registration
      const registrationResponse = await startRegistration(options);
      
      // Verify registration
      const result = await this.verifyRegistration(registrationResponse).toPromise();
      
      return result.verified;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  async authenticate(email: string): Promise<boolean> {
    try {
      // Get authentication options
      const options = await this.initAuthentication(email).toPromise();
      
      // Start authentication
      const authenticationResponse = await startAuthentication(options);
      
      // Verify authentication
      const result = await this.verifyAuthentication(authenticationResponse).toPromise();
      
      return result.verified;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }
}