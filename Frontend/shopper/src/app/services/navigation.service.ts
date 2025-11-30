import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    this.setupNavigationInterceptor();
  }

  private setupNavigationInterceptor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/' || event.url === '') {
        if (this.authService.isAuthenticated() && this.authService.isVendor()) {
          setTimeout(() => {
            this.router.navigateByUrl('/vendor', { replaceUrl: true });
          }, 100);
        } else if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
          setTimeout(() => {
            this.router.navigateByUrl('/admin', { replaceUrl: true });
          }, 100);
        }
      }

      if (event.url === '/dashboard' && this.authService.isAuthenticated() && this.authService.isVendor()) {
        setTimeout(() => {
          this.router.navigateByUrl('/vendor', { replaceUrl: true });
        }, 100);
      }
    });
  }

  forceNavigate(path: string) {
    this.router.navigateByUrl(path, { replaceUrl: true }).then(success => {
      if (!success) {
        window.location.href = path;
      }
    });
  }
}