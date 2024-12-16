import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebAuthnComponent } from "./webauthn/webauthn.component";

@Component({
  selector: 'app-root',
  imports: [ WebAuthnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'webauthn-angular';
}
