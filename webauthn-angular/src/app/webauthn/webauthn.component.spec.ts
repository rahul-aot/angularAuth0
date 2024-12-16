import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebauthnComponent } from './webauthn.component';

describe('WebauthnComponent', () => {
  let component: WebauthnComponent;
  let fixture: ComponentFixture<WebauthnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebauthnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebauthnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
