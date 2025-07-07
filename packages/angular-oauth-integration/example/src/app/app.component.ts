import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center">
            <h1>
              <a routerLink="/" class="logo">{{ title }}</a>
            </h1>
            
            <nav class="nav">
              <a routerLink="/dashboard" class="nav-link">Dashboard</a>
              <a routerLink="/profile" class="nav-link">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      <main class="app-main">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>

      <footer class="app-footer">
        <div class="container">
          <div class="session-info">
            <div class="d-flex justify-content-between align-items-center">
              <span>Angular OAuth Integration Example</span>
              <span>Test Mode - Libraries Disabled</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: #2c3e50;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .d-flex {
      display: flex;
    }

    .justify-content-between {
      justify-content: space-between;
    }

    .align-items-center {
      align-items: center;
    }

    .logo {
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .logo:hover {
      color: #ecf0f1;
    }

    .nav {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      color: #ecf0f1;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .app-main {
      flex: 1;
      padding: 2rem 0;
    }

    .app-footer {
      background: #ecf0f1;
      padding: 1rem 0;
      border-top: 1px solid #bdc3c7;
    }

    .session-info {
      font-size: 0.875rem;
      color: #7f8c8d;
    }

    @media (max-width: 768px) {
      .app-header .d-flex {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .nav {
        justify-content: center;
      }

      .session-info .d-flex {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class AppComponent {
  title = 'Idle Detection Demo - Test Mode';
}