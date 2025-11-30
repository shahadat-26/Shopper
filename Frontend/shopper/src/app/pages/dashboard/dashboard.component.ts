import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-navy-900">Dashboard</h1>
        <p class="mt-4 text-gray-600">User dashboard - Coming soon!</p>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {}