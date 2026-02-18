import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginData: LoginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call
    setTimeout(() => {
      // Use auth service for authentication
      if (this.authService.login(this.loginData.email, this.loginData.password, this.loginData.rememberMe)) {
        console.log('Login successful!', this.loginData);
        // Navigate to dashboard after successful login
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Invalid email or password. Try admin@example.com / password';
      }
      this.isLoading = false;
    }, 1500);
  }

  // Social login methods (mock implementations)
  loginWithGoogle() {
    console.log('Google login clicked');
    alert('Google login not implemented yet');
  }

  loginWithGitHub() {
    console.log('GitHub login clicked');
    alert('GitHub login not implemented yet');
  }
}
