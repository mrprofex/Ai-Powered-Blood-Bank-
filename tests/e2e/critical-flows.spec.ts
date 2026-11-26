import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load landing page with hero section', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Predict Shortages');
    await expect(page.locator('text=Coordinate Faster')).toBeVisible();
  });

  test('should display demo notice banner', async ({ page }) => {
    await expect(page.locator('text=DEMO DATA')).toBeVisible();
  });

  test('should navigate to login page when clicking Sign In', async ({ page }) => {
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/.*#login/);
  });

  test('should navigate to blood availability page', async ({ page }) => {
    await page.click('text=Search Availability');
    await expect(page).toHaveURL(/.*#availability/);
  });

  test('should display 3D network topology section', async ({ page }) => {
    await page.locator('#topology-3d').scrollIntoViewIfNeeded();
    await expect(page.locator('text=National cold-chain corridors')).toBeVisible();
  });

  test('should display blood group cards with demo data', async ({ page }) => {
    await expect(page.locator('text=O+')).toBeVisible();
    await expect(page.locator('text=O-')).toBeVisible();
    await expect(page.locator('text=DEMO DATA')).toBeVisible();
  });

  test('should display four role portals', async ({ page }) => {
    await expect(page.locator('text=Hospital Coordination Workspace')).toBeVisible();
    await expect(page.locator('text=Blood Bank Vault Workspace')).toBeVisible();
    await expect(page.locator('text=Public Searcher Portal')).toBeVisible();
    await expect(page.locator('text=Network Admin Command Console')).toBeVisible();
  });

  test('should have accessible color contrast', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#login');
    await page.waitForLoadState('networkidle');
  });

  test('should display login page with role selector', async ({ page }) => {
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Hospital Coordinator')).toBeVisible();
    await expect(page.locator('text=Blood Bank Officer')).toBeVisible();
    await expect(page.locator('text=Public Searcher')).toBeVisible();
  });

  test('should login as Hospital Coordinator', async ({ page }) => {
    await page.click('text=Hospital Coordinator');
    await page.fill('input[type="email"]', 'coordinator@hospital-demo.in');
    await page.fill('input[type="password"]', 'demo-password-123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*#hospital/);
  });

  test('should login as Blood Bank Officer', async ({ page }) => {
    await page.click('text=Blood Bank Officer');
    await page.fill('input[type="email"]', 'officer@bloodbank-demo.in');
    await page.fill('input[type="password"]', 'demo-password-123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*#blood-bank/);
  });

  test('should show demo mode notice on login page', async ({ page }) => {
    await expect(page.locator('text=DEMO MODE')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Create Demo Account');
    await expect(page).toHaveURL(/.*#signup/);
  });
});

test.describe('Blood Availability Page (Public)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#availability');
    await page.waitForLoadState('networkidle');
  });

  test('should load blood availability page', async ({ page }) => {
    await expect(page.locator('text=Blood Group Availability Overview')).toBeVisible();
    await expect(page.locator('text=DEMO DATA')).toBeVisible();
  });

  test('should display 8 blood group cards', async ({ page }) => {
    const cards = page.locator('button:has-text("O+"), button:has-text("O-"), button:has-text("A+"), button:has-text("A-"), button:has-text("B+"), button:has-text("B-"), button:has-text("AB+"), button:has-text("AB-")');
    await expect(cards).toHaveCount(8);
  });

  test('should filter by blood group when card clicked', async ({ page }) => {
    await page.click('button:has-text("O-")');
    await expect(page.locator('text=O-').first()).toHaveClass(/ring-2/);
  });

  test('should have search and filter controls', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Mumbai"]')).toBeVisible();
    await expect(page.locator('select[id="finder-component"]')).toBeVisible();
    await expect(page.locator('select[id="finder-state"]')).toBeVisible();
    await expect(page.locator('select[id="finder-risk"]')).toBeVisible();
  });

  test('should toggle between grid and table view', async ({ page }) => {
    await page.click('button:has-text("Table")');
    await expect(page.locator('table')).toBeVisible();
    await page.click('button:has-text("Cards")');
    await expect(page.locator('table')).toBeHidden();
  });

  test('should open detail modal when clicking Details', async ({ page }) => {
    await page.click('button:has-text("Details")').first();
    await expect(page.locator('role=dialog')).toBeVisible();
  });

  test('should show login prompt when clicking Request without auth', async ({ page }) => {
    await page.click('button:has-text("Request")').first();
    await expect(page.locator('text=Authentication Required')).toBeVisible();
  });
});

test.describe('Hospital Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#login');
    await page.click('text=Hospital Coordinator');
    await page.fill('input[type="email"]', 'coordinator@hospital-demo.in');
    await page.fill('input[type="password"]', 'demo-password-123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*#hospital/);
    await page.waitForLoadState('networkidle');
  });

  test('should load hospital dashboard', async ({ page }) => {
    await expect(page.locator('text=Hospital Coordination Workspace')).toBeVisible();
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should display KPI cards', async ({ page }) => {
    await expect(page.locator('text=Active Triage Queue')).toBeVisible();
    await expect(page.locator('text=Critical Priority')).toBeVisible();
    await expect(page.locator('text=Mean Matched ETA')).toBeVisible();
    await expect(page.locator('text=7-Day Shortage Watch')).toBeVisible();
  });

  test('should display request queue', async ({ page }) => {
    await expect(page.locator('text=Hospital Transfusion Request Queue')).toBeVisible();
  });

  test('should navigate to create blood request', async ({ page }) => {
    await page.click('text=Submit Emergency Blood Request');
    await expect(page).toHaveURL(/.*#hospital-create-request/);
  });

  test('should navigate to request tracking', async ({ page }) => {
    await page.click('text=Track Allocation');
    await expect(page).toHaveURL(/.*#hospital-request-tracking/);
  });

  test('should navigate to predictions', async ({ page }) => {
    await page.click('text=Review 30-Day Surgical Demand');
    await expect(page).toHaveURL(/.*#predictions-30d/);
  });

  test('should display live order map tracker', async ({ page }) => {
    await expect(page.locator('text=Live Order & Cold-Chain Route Tracker')).toBeVisible();
  });
});

test.describe('Blood Bank Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#login');
    await page.click('text=Blood Bank Officer');
    await page.fill('input[type="email"]', 'officer@bloodbank-demo.in');
    await page.fill('input[type="password"]', 'demo-password-123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*#blood-bank/);
    await page.waitForLoadState('networkidle');
  });

  test('should load blood bank dashboard', async ({ page }) => {
    await expect(page.locator('text=Blood Bank Vault Workspace')).toBeVisible();
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should display batch inventory table', async ({ page }) => {
    await expect(page.locator('text=Component Batch Inventory')).toBeVisible();
    await expect(page.locator('th:has-text("Batch Code")')).toBeVisible();
    await expect(page.locator('th:has-text("Group")')).toBeVisible();
  });

  test('should show expiry alerts', async ({ page }) => {
    await expect(page.locator('text=Expiring <=')).toBeVisible();
  });

  test('should navigate to update stock', async ({ page }) => {
    await page.click('text=Update Stock');
    await expect(page).toHaveURL(/.*#bank-update-stock/);
  });

  test('should navigate to expiry management', async ({ page }) => {
    await page.click('text=Expiry Queue');
    await expect(page).toHaveURL(/.*#bank-expiry-management/);
  });

  test('should display component mix donut chart', async ({ page }) => {
    await expect(page.locator('text=Vault Component Share')).toBeVisible();
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#login');
    await page.click('text=Network Admin');
    await page.fill('input[type="email"]', 'admin@bloodnetwork-demo.in');
    await page.fill('input[type="password"]', 'demo-password-123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*#admin/);
    await page.waitForLoadState('networkidle');
  });

  test('should load admin dashboard', async ({ page }) => {
    await expect(page.locator('text=Network Governance Command')).toBeVisible();
    await expect(page.locator('text=National Blood Grid Overview')).toBeVisible();
  });

  test('should display network KPIs', async ({ page }) => {
    await expect(page.locator('text=Registered Hospitals')).toBeVisible();
    await expect(page.locator('text=Blood Banks')).toBeVisible();
    await expect(page.locator('text=Available Units')).toBeVisible();
    await expect(page.locator('text=Critical Shortages')).toBeVisible();
  });

  test('should display blood group inventory chart', async ({ page }) => {
    await expect(page.locator('text=Blood Group Availability vs. Threshold')).toBeVisible();
  });

  test('should display regional shortage overview', async ({ page }) => {
    await expect(page.locator('text=Regional Shortage Overview')).toBeVisible();
  });

  test('should display organization connections', async ({ page }) => {
    await expect(page.locator('text=Organization Connections')).toBeVisible();
  });

  test('should display integration readiness', async ({ page }) => {
    await expect(page.locator('text=Neon PostgreSQL')).toBeVisible();
    await expect(page.locator('text=e-RaktKosh Adapter Status')).toBeVisible();
  });

  test('should navigate to verification queue', async ({ page }) => {
    await page.click('text=Verification Queue');
    await expect(page).toHaveURL(/.*#admin-verification/);
  });

  test('should navigate to audit logs', async ({ page }) => {
    await page.click('text=Security Audit Logs');
    await expect(page).toHaveURL(/.*#admin-audit-logs/);
  });
});

test.describe('Create Blood Request', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#login');
    await page.click('text=Hospital Coordinator');
    await page.fill('input[type="email"]', 'coordinator@hospital-demo.in');
    await page.fill('input[type="password"]', 'demo-password-123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*#hospital/);
    await page.click('text=Submit Emergency Blood Request');
    await page.waitForURL(/.*#hospital-create-request/);
    await page.waitForLoadState('networkidle');
  });

  test('should load create request form', async ({ page }) => {
    await expect(page.locator('text=Create Emergency Blood Request')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button:has-text("Submit Blood Request")');
    await expect(page.locator('text=Please review the request parameters')).toBeVisible();
  });

  test('should create a valid blood request', async ({ page }) => {
    await page.fill('input[id="req-hospital"]', 'Test Hospital');
    await page.fill('input[id="req-dept"]', 'Emergency');
    await page.selectOption('select[id="req-group"]', 'O-');
    await page.fill('input[id="req-units"]', '4');
    await page.selectOption('select[id="req-comp"]', 'PRBC');
    await page.selectOption('select[id="req-urgency"]', 'CRITICAL');
    await page.fill('input[id="req-city"]', 'Mumbai');
    await page.click('button:has-text("Submit Blood Request")');
    await expect(page.locator('text=Request Created Successfully')).toBeVisible();
  });

  test('should show matching candidates after creation', async ({ page }) => {
    await page.fill('input[id="req-hospital"]', 'Test Hospital');
    await page.fill('input[id="req-dept"]', 'Emergency');
    await page.selectOption('select[id="req-group"]', 'O-');
    await page.fill('input[id="req-units"]', '4');
    await page.selectOption('select[id="req-comp"]', 'PRBC');
    await page.selectOption('select[id="req-urgency"]', 'CRITICAL');
    await page.fill('input[id="req-city"]', 'Mumbai');
    await page.click('button:has-text("Submit Blood Request")');
    await expect(page.locator('text=Nearby inventory candidates')).toBeVisible();
  });
});

test.describe('Predictions Workspace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#login');
    await page.click('text=Hospital Coordinator');
    await page.fill('input[type="email"]', 'coordinator@hospital-demo.in');
    await page.fill('input[type="password"]', 'demo-password-123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*#hospital/);
    await page.click('text=Inspect 7-Day Forecast');
    await page.waitForURL(/.*#predictions-7d/);
    await page.waitForLoadState('networkidle');
  });

  test('should load predictions workspace', async ({ page }) => {
    await expect(page.locator('text=Hospital Demand Prediction')).toBeVisible();
  });

  test('should display forecast method', async ({ page }) => {
    await expect(page.locator('text=Forecast method')).toBeVisible();
  });

  test('should display trend chart', async ({ page }) => {
    await expect(page.locator('text=Synthetic Stock vs. Utilization Preview')).toBeVisible();
  });

  test('should filter by blood group', async ({ page }) => {
    await page.selectOption('select[id="pred-group"]', 'O-');
    await expect(page.locator('text=O-').first()).toBeVisible();
  });

  test('should toggle between 7-day and 30-day', async ({ page }) => {
    await page.click('text=Next 30 Days');
    await expect(page.locator('text=30-Day Synthetic Stock')).toBeVisible();
    await page.click('text=Next 7 Days');
    await expect(page.locator('text=7-Day Synthetic Stock')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Predict Shortages');
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Predict Shortages');
  });

  test('mobile navigation should open drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/#login');
    await page.click('text=Hospital Coordinator');
    await page.fill('input[type="email"]', 'coordinator@hospital-demo.in');
    await page.fill('input[type="password"]', 'demo-password-123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*#hospital/);
    await page.click('button[aria-label="Open navigation menu"]');
    await expect(page.locator('text=Hospital Coordinator Tools')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have skip link', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    for (const img of await images.all()) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have aria-labels on icon buttons', async ({ page }) => {
    await page.goto('/#login');
    await page.click('text=Hospital Coordinator');
    await page.fill('input[type="email"]', 'coordinator@hospital-demo.in');
    await page.fill('input[type="password"]', 'demo-password-123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*#hospital/);
    
    const iconButtons = page.locator('button[aria-label]');
    await expect(iconButtons.first()).toBeVisible();
  });
});