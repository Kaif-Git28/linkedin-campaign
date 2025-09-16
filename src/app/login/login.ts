import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  
  formData = {
    name: '',
    email: '',
    acceptPolicy: false
  };

  constructor(
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      // Additional custom validation can be added here
      if (this.validateForm()) {
        console.log('Form submitted successfully:', this.formData);
        this.router.navigate(['/home']);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      console.log('Form is invalid');
    }
  }

  private validateForm(): boolean {
    // Custom validation logic
    if (!this.formData.name.trim()) {
      alert('Please enter your name');
      return false;
    }

    if (this.formData.name.trim().length < 2) {
      alert('Name must be at least 2 characters long');
      return false;
    }

    if (!this.formData.email.trim()) {
      alert('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email.trim())) {
      alert('Please enter a valid email address');
      return false;
    }

    return true;
  }
}