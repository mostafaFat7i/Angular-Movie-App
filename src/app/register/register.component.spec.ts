// src/app/register/register.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

class MockAuthService {
  register(username: string, email: string, password: string) {
    // Mock successful registration response
    return of({}); // Empty object for successful response
  }

  // Uncomment the following method to simulate registration failure
  // register(username: string, email: string, password: string) {
  //   return throwError(new Error('Registration failed'));
  // }
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: MockAuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unrecognized components for testing
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call register method and navigate on successful registration', () => {
    component.username = 'testuser';
    component.email = 'test@example.com';
    component.password = 'password';
    component.register();
    expect(authService.register).toHaveBeenCalledWith('testuser', 'test@example.com', 'password');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show error message on failed registration', () => {
    spyOn(authService, 'register').and.returnValue(throwError(new Error('Registration failed')));
    component.register();
    expect(component.errorMessage).toBe('Registration failed. Please try again.');
  });
});
