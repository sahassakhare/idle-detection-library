#!/usr/bin/env node

/**
 * Critical Edge Case Test Runner for Idle Detection Library
 * 
 * This script tests the most critical edge cases identified in the analysis:
 * 1. Interrupt source during warning state
 * 2. Multi-tab state synchronization
 * 3. Rapid activity handling
 * 
 * Run this with: node critical-test-runner.js
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  appUrl: 'http://localhost:4200',
  idleTimeout: 5000,    // 5 seconds for faster testing
  warningTimeout: 3000, // 3 seconds warning
  testTimeout: 30000    // 30 seconds max per test
};

class CriticalEdgeCaseTester {
  constructor() {
    this.browser = null;
    this.testResults = [];
  }

  async initialize() {
    console.log('🚀 Initializing Critical Edge Case Tester...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for visual confirmation
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1200, height: 800 }
    });

    console.log('✅ Browser launched successfully');
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Running Test: ${testName}`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: result.success ? 'PASS' : 'FAIL',
        duration: duration,
        details: result.details,
        logs: result.logs || []
      });

      console.log(`${result.success ? '✅' : '❌'} ${testName}: ${result.status}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'ERROR',
        duration: duration,
        error: error.message,
        logs: []
      });

      console.log(`❌ ${testName}: ERROR - ${error.message}`);
    }
  }

  async testInterruptDuringWarning() {
    const pages = [];
    
    try {
      // Open 2 tabs
      for (let i = 0; i < 2; i++) {
        const page = await this.browser.newPage();
        await page.goto(TEST_CONFIG.appUrl);
        
        // Enable console logging
        page.on('console', msg => {
          if (msg.text().includes('[IdleWarningDialog]') || msg.text().includes('[Multi-Tab]')) {
            console.log(`   Tab ${i + 1}: ${msg.text()}`);
          }
        });

        pages.push(page);
      }

      const [tab1, tab2] = pages;

      // Set shorter timeouts for testing via console
      await tab1.evaluate(() => {
        // Find the idle detection component and modify its timeouts
        const component = document.querySelector('idle-warning-dialog');
        if (component) {
          component.idleTimeout = 5000;    // 5 seconds
          component.warningTimeout = 3000; // 3 seconds  
          component.enableDebugLogs = true;
        }
      });

      console.log('   Waiting for idle timeout in Tab 1...');
      
      // Wait for idle detection to trigger (should happen in ~5 seconds)
      await tab1.waitForTimeout(6000);

      // Check if warning dialog appeared
      const warningVisible = await tab1.evaluate(() => {
        const dialog = document.querySelector('.idle-warning-overlay');
        return dialog && window.getComputedStyle(dialog).display !== 'none';
      });

      if (!warningVisible) {
        return {
          success: false,
          status: 'Warning dialog did not appear after idle timeout',
          details: 'Check if idle detection is working properly'
        };
      }

      console.log('   Warning dialog appeared in Tab 1');
      console.log('   Simulating activity in Tab 2...');

      // Simulate activity in Tab 2 (click somewhere)
      await tab2.click('body');
      await tab2.mouse.move(100, 100);

      // Wait a moment for the broadcast to be processed
      await tab1.waitForTimeout(500);

      // Check if warning dialog closed in Tab 1
      const warningStillVisible = await tab1.evaluate(() => {
        const dialog = document.querySelector('.idle-warning-overlay');
        return dialog && window.getComputedStyle(dialog).display !== 'none';
      });

      // Clean up
      for (const page of pages) {
        await page.close();
      }

      if (warningStillVisible) {
        return {
          success: false,
          status: 'CRITICAL FAILURE - Warning dialog did not close after activity in other tab',
          details: 'This is a security issue - users might get logged out despite being active'
        };
      }

      return {
        success: true,
        status: 'Warning properly closed when activity detected in other tab',
        details: 'Multi-tab interrupt handling working correctly'
      };

    } catch (error) {
      // Clean up on error
      for (const page of pages) {
        try { await page.close(); } catch (e) {}
      }
      throw error;
    }
  }

  async testMultiTabStateSync() {
    const pages = [];
    
    try {
      // Open 3 tabs for comprehensive testing
      for (let i = 0; i < 3; i++) {
        const page = await this.browser.newPage();
        await page.goto(TEST_CONFIG.appUrl);
        
        // Setup console monitoring
        page.on('console', msg => {
          if (msg.text().includes('broadcast') || msg.text().includes('sync')) {
            console.log(`   Tab ${i + 1}: ${msg.text()}`);
          }
        });

        // Configure for testing
        await page.evaluate(() => {
          const component = document.querySelector('idle-warning-dialog');
          if (component) {
            component.idleTimeout = 4000;
            component.warningTimeout = 2000;
            component.enableDebugLogs = true;
          }
        });

        pages.push(page);
      }

      console.log('   Waiting for idle timeout...');
      await pages[0].waitForTimeout(5000);

      // Check if warning appeared in ALL tabs
      const warningStates = await Promise.all(
        pages.map(page => 
          page.evaluate(() => {
            const dialog = document.querySelector('.idle-warning-overlay');
            return dialog && window.getComputedStyle(dialog).display !== 'none';
          })
        )
      );

      const allTabsShowWarning = warningStates.every(state => state === true);
      console.log(`   Warning states: ${warningStates.map((s, i) => `Tab${i+1}:${s}`).join(', ')}`);

      if (!allTabsShowWarning) {
        return {
          success: false,
          status: 'Warning dialog not synchronized across all tabs',
          details: `Warning states: ${warningStates.join(', ')}`
        };
      }

      console.log('   Clicking Extend Session in Tab 2...');
      
      // Click "Extend Session" in Tab 2
      const extendButton = await pages[1].$('.btn-primary');
      if (extendButton) {
        await extendButton.click();
      } else {
        return {
          success: false,
          status: 'Could not find Extend Session button',
          details: 'UI elements not accessible'
        };
      }

      // Wait for synchronization
      await pages[0].waitForTimeout(1000);

      // Check if warning closed in ALL tabs
      const finalWarningStates = await Promise.all(
        pages.map(page => 
          page.evaluate(() => {
            const dialog = document.querySelector('.idle-warning-overlay');
            return dialog && window.getComputedStyle(dialog).display !== 'none';
          })
        )
      );

      const allTabsClosed = finalWarningStates.every(state => state === false);
      console.log(`   Final states: ${finalWarningStates.map((s, i) => `Tab${i+1}:${s}`).join(', ')}`);

      // Clean up
      for (const page of pages) {
        await page.close();
      }

      if (!allTabsClosed) {
        return {
          success: false,
          status: 'CRITICAL FAILURE - Extend Session did not close warnings in all tabs',
          details: `Final states: ${finalWarningStates.join(', ')}`
        };
      }

      return {
        success: true,
        status: 'Multi-tab state synchronization working correctly',
        details: 'Warning appeared and closed synchronously across all tabs'
      };

    } catch (error) {
      // Clean up on error
      for (const page of pages) {
        try { await page.close(); } catch (e) {}
      }
      throw error;
    }
  }

  async testRapidActivityHandling() {
    let page;
    
    try {
      page = await this.browser.newPage();
      await page.goto(TEST_CONFIG.appUrl);

      // Setup console monitoring
      const activityLogs = [];
      page.on('console', msg => {
        if (msg.text().includes('Activity') || msg.text().includes('activity')) {
          activityLogs.push(msg.text());
          console.log(`   Activity: ${msg.text()}`);
        }
      });

      // Configure component
      await page.evaluate(() => {
        const component = document.querySelector('idle-warning-dialog');
        if (component) {
          component.idleTimeout = 3000;
          component.warningTimeout = 4000; // Longer warning to allow rapid activity testing
          component.enableDebugLogs = true;
          component.throttleDelay = 100; // Lower throttle for testing
        }
      });

      console.log('   Waiting for warning dialog...');
      await page.waitForTimeout(4000);

      // Verify warning is showing
      const warningVisible = await page.evaluate(() => {
        const dialog = document.querySelector('.idle-warning-overlay');
        return dialog && window.getComputedStyle(dialog).display !== 'none';
      });

      if (!warningVisible) {
        return {
          success: false,
          status: 'Warning dialog not visible for rapid activity test',
          details: 'Cannot test rapid activity without warning dialog'
        };
      }

      console.log('   Performing rapid activity...');

      // Perform rapid activity within 1 second
      for (let i = 0; i < 5; i++) {
        await page.click('body');
        await page.mouse.move(100 + i * 10, 100 + i * 10);
        await page.keyboard.press('Space');
        await page.waitForTimeout(50); // 50ms between actions
      }

      // Wait for processing
      await page.waitForTimeout(1000);

      // Check if dialog closed
      const warningClosed = await page.evaluate(() => {
        const dialog = document.querySelector('.idle-warning-overlay');
        return !dialog || window.getComputedStyle(dialog).display === 'none';
      });

      await page.close();

      if (!warningClosed) {
        return {
          success: false,
          status: 'Warning dialog did not close after rapid activity',
          details: `Activity logs: ${activityLogs.length} events detected`
        };
      }

      return {
        success: true,
        status: 'Rapid activity properly handled and closed dialog',
        details: `Successfully processed ${activityLogs.length} activity events`
      };

    } catch (error) {
      if (page) {
        try { await page.close(); } catch (e) {}
      }
      throw error;
    }
  }

  async runAllCriticalTests() {
    console.log('🔍 Starting Critical Edge Case Analysis...\n');

    await this.runTest('Interrupt Source During Warning', () => this.testInterruptDuringWarning());
    await this.runTest('Multi-Tab State Synchronization', () => this.testMultiTabStateSync());
    await this.runTest('Rapid Activity Handling', () => this.testRapidActivityHandling());
  }

  generateReport() {
    console.log('\n📊 CRITICAL TEST RESULTS SUMMARY');
    console.log('='.repeat(50));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const erroredTests = this.testResults.filter(r => r.status === 'ERROR').length;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Errors: ${erroredTests} 💥`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    console.log('\nDETAILED RESULTS:');
    console.log('-'.repeat(50));

    this.testResults.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : 
                        result.status === 'FAIL' ? '❌' : '💥';
      
      console.log(`${statusIcon} ${result.name}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Duration: ${result.duration}ms`);
      
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      console.log('');
    });

    // Critical failure analysis
    const criticalFailures = this.testResults.filter(r => 
      r.status === 'FAIL' && r.details && r.details.includes('CRITICAL FAILURE')
    );

    if (criticalFailures.length > 0) {
      console.log('🚨 CRITICAL FAILURES DETECTED:');
      console.log('='.repeat(50));
      criticalFailures.forEach(failure => {
        console.log(`❌ ${failure.name}`);
        console.log(`   ${failure.details}`);
        console.log('');
      });
      
      console.log('⚠️  RECOMMENDATION: Do not use this library in production until critical failures are resolved.');
    } else if (failedTests === 0 && erroredTests === 0) {
      console.log('🎉 All critical tests passed! Library appears stable for production use.');
    } else {
      console.log('⚠️  Some tests failed. Review failures and assess risk before production use.');
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Main execution
async function runCriticalTests() {
  const tester = new CriticalEdgeCaseTester();
  
  try {
    await tester.initialize();
    await tester.runAllCriticalTests();
    tester.generateReport();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Test execution interrupted');
  process.exit(0);
});

// Check if application is running
console.log('🔍 Checking if Angular application is running...');
console.log(`Expected URL: ${TEST_CONFIG.appUrl}`);
console.log('Make sure to run: cd example/angular-sample && npm start');
console.log('Then run this script in another terminal\n');

if (require.main === module) {
  runCriticalTests();
}

module.exports = CriticalEdgeCaseTester;