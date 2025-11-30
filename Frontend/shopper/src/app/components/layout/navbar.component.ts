import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a routerLink="/" class="flex-shrink-0 flex items-center">
              <span class="text-2xl font-bold text-navy-600">Shopper</span>
            </a>
            <div class="hidden md:ml-6 md:flex md:space-x-8">
              <a routerLink="/" routerLinkActive="border-navy-500 text-navy-900" [routerLinkActiveOptions]="{exact: true}"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </a>
              <a routerLink="/products" routerLinkActive="border-navy-500 text-navy-900"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Products
              </a>
              <a routerLink="/categories" routerLinkActive="border-navy-500 text-navy-900"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Categories
              </a>
              @if (authService.isVendor()) {
                <a routerLink="/vendor" routerLinkActive="border-navy-500 text-navy-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Vendor Dashboard
                </a>
              }
              @if (authService.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="border-navy-500 text-navy-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Admin
                </a>
              }
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Mobile menu button -->
            <button (click)="toggleMobileMenu()" class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500">
              <svg class="h-6 w-6" [class.hidden]="showMobileMenu()" [class.block]="!showMobileMenu()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg class="h-6 w-6" [class.block]="showMobileMenu()" [class.hidden]="!showMobileMenu()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <a routerLink="/cart" class="p-2 text-gray-400 hover:text-gray-500 relative">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              @if (cartService.cartItemCount() > 0) {
                <span class="absolute -top-1 -right-1 bg-navy-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {{ cartService.cartItemCount() }}
                </span>
              }
            </a>

            @if (authService.isAuthenticated()) {
              <div class="relative">
                <button (click)="toggleDropdown($event)" type="button" class="flex items-center space-x-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 hover:bg-gray-100 p-1 pr-2">
                  <div class="h-8 w-8 rounded-full bg-navy-600 flex items-center justify-center text-white">
                    {{ getUserInitials() }}
                  </div>
                  <svg class="w-4 h-4 text-gray-600" [class.rotate-180]="showDropdown()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                @if (showDropdown()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50" (click)="$event.stopPropagation()">
                    @if (authService.isVendor()) {
                      <a routerLink="/vendor" (click)="closeDropdown()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Vendor Dashboard
                      </a>
                    } @else if (authService.isAdmin()) {
                      <a routerLink="/admin" (click)="closeDropdown()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Dashboard
                      </a>
                    } @else {
                      <a routerLink="/dashboard" (click)="closeDropdown()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </a>
                      <a routerLink="/orders" (click)="closeDropdown()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Orders
                      </a>
                      <a routerLink="/wishlist" (click)="closeDropdown()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Wishlist
                      </a>
                    }
                    <hr class="my-1">
                    <button (click)="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Sign out
                    </button>
                  </div>
                }
              </div>
            } @else {
              <div class="flex items-center space-x-2">
                <a routerLink="/login" class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Sign in
                </a>
                <a routerLink="/register" class="bg-navy-600 text-white hover:bg-navy-700 px-3 py-2 rounded-md text-sm font-medium">
                  Sign up
                </a>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (showMobileMenu()) {
        <div class="md:hidden">
          <div class="pt-2 pb-3 space-y-1">
            <a routerLink="/" (click)="toggleMobileMenu()" class="bg-navy-50 border-navy-500 text-navy-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Home
            </a>
            <a routerLink="/products" (click)="toggleMobileMenu()" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Products
            </a>
            <a routerLink="/categories" (click)="toggleMobileMenu()" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Categories
            </a>
            @if (authService.isAuthenticated()) {
              @if (authService.isVendor()) {
                <a routerLink="/vendor" (click)="toggleMobileMenu()" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  Vendor Dashboard
                </a>
              } @else if (authService.isAdmin()) {
                <a routerLink="/admin" (click)="toggleMobileMenu()" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  Admin Dashboard
                </a>
              } @else {
                <a routerLink="/dashboard" (click)="toggleMobileMenu()" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  Dashboard
                </a>
                <a routerLink="/orders" (click)="toggleMobileMenu()" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  My Orders
                </a>
                <a routerLink="/wishlist" (click)="toggleMobileMenu()" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  Wishlist
                </a>
              }
              <hr class="my-1">
              <button (click)="logout()" class="border-transparent text-red-500 hover:bg-gray-50 hover:border-gray-300 hover:text-red-700 block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                Sign out
              </button>
            } @else {
              <a routerLink="/login" (click)="toggleMobileMenu()" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                Sign in
              </a>
              <a routerLink="/register" (click)="toggleMobileMenu()" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                Sign up
              </a>
            }
          </div>
        </div>
      }
    </nav>
  `,
  styles: []
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  router = inject(Router);
  elementRef = inject(ElementRef);

  showDropdown = signal(false);
  showMobileMenu = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }

  toggleDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showDropdown.update(v => !v);
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  toggleMobileMenu() {
    this.showMobileMenu.update(v => !v);
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (user && user.firstName && user.lastName) {
      const firstInitial = user.firstName.charAt(0) || '';
      const lastInitial = user.lastName.charAt(0) || '';
      return `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
    }
    return 'U';
  }

  logout() {
    this.authService.logout();
    this.showDropdown.set(false);
  }
}