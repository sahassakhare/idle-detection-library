import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { 
  selectIdleState, 
  selectIsIdle, 
  selectIsWarning, 
  selectTimeRemaining,
  initializeIdle, 
  startIdleDetection, 
  userActivity 
} from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app">
      <h1>Angular OAuth Integration - Simple Test</h1>
      
      <div class="status">
        <h2>NgRx Store State</h2>
        <p><strong>Is Idle:</strong> {{ isIdle$ | async }}</p>
        <p><strong>Is Warning:</strong> {{ isWarning$ | async }}</p>
        <p><strong>Time Remaining:</strong> {{ timeRemaining$ | async }}ms</p>
        
        <h3>Complete State:</h3>
        <pre>{{ (idleState$ | async) | json }}</pre>
      </div>
      
      <div class="actions">
        <button (click)="initialize()">Initialize Idle Detection</button>
        <button (click)="startDetection()">Start Detection</button>
        <button (click)="simulateActivity()">Simulate User Activity</button>
      </div>
      
      <div class="info">
        <h3>Testing Instructions:</h3>
        <ol>
          <li>Click "Initialize Idle Detection"</li>
          <li>Click "Start Detection"</li>
          <li>Watch the state change in real-time</li>
          <li>Click "Simulate User Activity" to reset timers</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .app {
      padding: 20px;
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .status {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .status p {
      margin: 10px 0;
      font-size: 16px;
    }
    
    .status pre {
      background: white;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      border: 1px solid #ddd;
    }
    
    .actions {
      display: flex;
      gap: 10px;
      margin: 20px 0;
      flex-wrap: wrap;
    }
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #007bff;
      color: white;
      font-size: 14px;
    }
    
    button:hover {
      background: #0056b3;
    }
    
    .info {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }
    
    .info h3 {
      margin-top: 0;
      color: #1976d2;
    }
    
    .info ol {
      margin: 10px 0;
    }
    
    .info li {
      margin: 5px 0;
    }
  `]
})
export class SimpleAppComponent implements OnInit {
  idleState$: Observable<any>;
  isIdle$: Observable<boolean>;
  isWarning$: Observable<boolean>;
  timeRemaining$: Observable<number>;

  constructor(private store: Store) {
    this.idleState$ = this.store.select(selectIdleState);
    this.isIdle$ = this.store.select(selectIsIdle);
    this.isWarning$ = this.store.select(selectIsWarning);
    this.timeRemaining$ = this.store.select(selectTimeRemaining);
  }

  ngOnInit(): void {
    console.log('SimpleAppComponent initialized');
    console.log('Store:', this.store);
  }

  initialize(): void {
    console.log('Initializing idle detection...');
    this.store.dispatch(initializeIdle({
      config: {
        idleTimeout: 30000,
        warningTimeout: 10000,
        autoRefreshToken: false,
        multiTabCoordination: false
      }
    }));
  }

  startDetection(): void {
    console.log('Starting idle detection...');
    this.store.dispatch(startIdleDetection());
  }

  simulateActivity(): void {
    console.log('Simulating user activity...');
    this.store.dispatch(userActivity({ timestamp: Date.now() }));
  }
}