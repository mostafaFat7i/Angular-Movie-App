// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AuthService } from '../services/auth.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent implements OnInit {
//   loginForm: FormGroup;
//   errorMessage: string | null = null;

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router
//   ) {
//     // Initialize the form here
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required]]
//     });
//   }

//   ngOnInit(): void {
//     // No additional initialization needed
//   }

//   onSubmit(): void {
//     console.log('Submit called'); // Debugging line
//     const { email, password } = this.loginForm.value;

//     if (this.loginForm.valid) {
//       this.authService.login(email, password).subscribe(
//         response => {
//           console.log('Login successful:', response); // Debugging line
          
//           const userRole = this.authService.getUserRole();
//           console.log('User Role:', userRole); // Debugging line

//           if (userRole) {
//             if (userRole.toUpperCase() === 'ADMIN') {
//               this.router.navigate(['/admin/dashboard']);
//             } else if (userRole.toUpperCase() === 'USER') {
//               this.router.navigate(['/user/dashboard']);
//             } else {
//               console.error('Unknown role:', userRole);
//               this.errorMessage = 'Unknown user role.';
//             }
//           } else {
//             console.error('User role not found.');
//             this.errorMessage = 'User role not found.';
//           }
//         },
//         error => {
//           console.error('Login error:', error); // Debugging line
//           this.errorMessage = 'Invalid email or password.';
//         }
//       );
//     } else {
//       console.log('Form invalid:', this.loginForm.errors); // Debugging line
//       console.log('Email control errors:', this.loginForm.get('email')?.errors); // Debugging line
//       console.log('Password control errors:', this.loginForm.get('password')?.errors); // Debugging line
//       this.errorMessage = 'Please fill in all required fields correctly.';
//     }
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize the form here
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // No additional initialization needed
  }

  // onSubmit(): void {
  //   console.log('Submit called'); // Debugging line
  //   const { email, password } = this.loginForm.value;
  //   if (this.loginForm.valid) {
  //     this.authService.login(email, password).subscribe(
  //       response => {
  //         console.log('Login successful:', response); // Debugging line
          
  //         const userRole = this.authService.getUserRole();
  //         console.log('User Role:', userRole); // Debugging line

  //         if (userRole) {
  //           if (userRole.toUpperCase() === 'ADMIN') {
  //             this.router.navigate(['/admin/dashboard']);
  //           } else if (userRole.toUpperCase() === 'USER') {
  //             this.router.navigate(['/user/dashboard']);
  //           } else {
  //             console.error('Unknown role:', userRole);
  //             this.errorMessage = 'Unknown user role.';
  //           }
  //         } else {
  //           console.error('User role not found.');
  //           this.errorMessage = 'User role not found.';
  //         }
  //       },
  //       error => {
  //         console.error('Login error:', error); // Debugging line
  //         this.errorMessage = 'Invalid email or password.';
  //       }
  //     );
  //   } else {
  //     console.log('Form invalid:', this.loginForm.errors); // Debugging line
  //     console.log('Email control errors:', this.loginForm.get('email')?.errors); // Debugging line
  //     console.log('Password control errors:', this.loginForm.get('password')?.errors); // Debugging line
  //     this.errorMessage = 'Please fill in all required fields correctly.';
  //   }
  // }
  onSubmit(): void {
    console.log('Submit called'); // Debugging line
    const { email, password } = this.loginForm.value;

    // Check if the email is 'admin' for admin login
    if (email === 'admin') {
      // Bypass password validation for admin
      this.authService.login(email, password ).subscribe(
        response => {
          console.log('Admin login successful:', response); // Debugging line
          
          // Store the token and role as needed
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', 'ADMIN');

          // Redirect to admin dashboard
          this.router.navigate(['/admin/dashboard']);
        },
        error => {
          console.error('Login error for admin:', error); // Debugging line
          this.errorMessage = 'Admin login failed.';
        }
      );
    } else {
      // For regular users, validate email and password
      if (this.loginForm.valid) {
        this.authService.login(email, password ).subscribe(
          response => {
            console.log('User login successful:', response); // Debugging line

            const userRole = response.role; // Assuming role is returned in response
            console.log('User Role:', userRole); // Debugging line

            if (userRole) {
              if (userRole.toUpperCase() === 'ADMIN') {
                this.router.navigate(['/admin/dashboard']);
              } else if (userRole.toUpperCase() === 'USER') {
                this.router.navigate(['/user/dashboard']);
              } else {
                console.error('Unknown role:', userRole);
                this.errorMessage = 'Unknown user role.';
              }
            } else {
              console.error('User role not found.');
              this.errorMessage = 'User role not found.';
            }
          },
          error => {
            console.error('Login error for user:', error); // Debugging line
            this.errorMessage = 'Invalid email or password.';
          }
        );
      } else {
        console.log('Form invalid:', this.loginForm.errors); // Debugging line
        this.errorMessage = 'Please fill in all required fields correctly.';
      }
    }
  }
}

