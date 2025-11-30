import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-navy-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <a routerLink="/login" class="font-medium text-navy-600 hover:text-navy-500">
            sign in to existing account
          </a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            @if (errorMessage()) {
              <div class="rounded-md bg-red-50 p-4">
                <div class="text-sm text-red-800">{{ errorMessage() }}</div>
              </div>
            }

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                  [class.border-red-300]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                />
                @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                  <p class="mt-1 text-sm text-red-600">First name is required</p>
                }
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                  [class.border-red-300]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                />
                @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Last name is required</p>
                }
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                [class.border-red-300]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              />
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <p class="mt-1 text-sm text-red-600">Please enter a valid email address</p>
              }
            </div>

            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700">
                Phone number (optional)
              </label>
              <input
                id="phoneNumber"
                type="tel"
                formControlName="phoneNumber"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
              />
            </div>

            <div>
              <label for="role" class="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="role"
                formControlName="role"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                [class.border-red-300]="registerForm.get('role')?.invalid && registerForm.get('role')?.touched"
              >
                <option value="Customer">Customer - Buy products</option>
                <option value="Vendor">Vendor - Sell products</option>
              </select>
              @if (registerForm.get('role')?.invalid && registerForm.get('role')?.touched) {
                <p class="mt-1 text-sm text-red-600">Please select an account type</p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                [class.border-red-300]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              />
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <p class="mt-1 text-sm text-red-600">Password must be at least 6 characters</p>
              }
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                [class.border-red-300]="passwordMismatch() && registerForm.get('confirmPassword')?.touched"
              />
              @if (passwordMismatch() && registerForm.get('confirmPassword')?.touched) {
                <p class="mt-1 text-sm text-red-600">Passwords do not match</p>
              }
            </div>

            <div class="flex items-center">
              <input
                id="terms"
                type="checkbox"
                formControlName="terms"
                class="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
              />
              <label for="terms" class="ml-2 block text-sm text-gray-900">
                I agree to the
                <a href="#" class="text-navy-600 hover:text-navy-500">Terms and Conditions</a>
              </label>
            </div>
            @if (registerForm.get('terms')?.invalid && registerForm.get('terms')?.touched) {
              <p class="text-sm text-red-600">You must agree to the terms</p>
            }

            <div>
              <button
                type="submit"
                [disabled]="registerForm.invalid || loading() || passwordMismatch()"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (loading()) {
                  <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                } @else {
                  Create account
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    role: ['Customer', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    terms: [false, [Validators.requiredTrue]]
  });

  passwordMismatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password !== confirmPassword && confirmPassword !== '';
  }

  onSubmit() {
    if (this.registerForm.valid && !this.passwordMismatch()) {
      this.loading.set(true);
      this.errorMessage.set('');

      const { confirmPassword, terms, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
        }
      });
    }
  }
}