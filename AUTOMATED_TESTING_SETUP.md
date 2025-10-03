# 🤖 Automated Testing Setup for Momentum

## Overview
This guide helps you set up automated tests to catch bugs before they reach production. Automated tests save time by running repeatedly without manual effort.

---

## 🎯 Testing Strategy

### What We'll Automate:
1. **Unit Tests** - Test individual functions (utils, validations)
2. **Component Tests** - Test React components in isolation
3. **E2E Tests** - Test complete user flows (sign up → create goal → upgrade)
4. **Performance Tests** - Test load times and concurrent users
5. **Accessibility Tests** - Test WCAG compliance automatically

### What Should Stay Manual:
- First-time user testing (need real human feedback)
- Design/aesthetic review
- Cross-device visual testing (screenshots help but human eyes are better)
- Complex user experience flows

---

## 📦 Recommended Tools

### For React Component & Unit Testing
**Vitest + React Testing Library**
- Fast, modern test runner
- Works seamlessly with Vite
- React Testing Library encourages testing from user perspective

### For E2E Testing
**Playwright**
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing
- Screenshot and video recording on failure
- Network mocking
- Better than Cypress for multi-tab/window testing

### For Performance Testing
**Lighthouse CI**
- Automated Lighthouse audits in CI/CD
- Catches performance regressions

### For Accessibility Testing
**axe-core** (via jest-axe or Playwright)
- Automated WCAG compliance checks

---

## 🚀 Setup Instructions

### Step 1: Install Testing Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom
npm install -D @playwright/test
npm install -D @axe-core/playwright
```

### Step 2: Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `src/test/setup.ts`:

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### Step 3: Configure Playwright

Run Playwright setup:

```bash
npx playwright install
```

This creates `playwright.config.ts`. Update it:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173', // Vite dev server
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 4: Add Test Scripts to package.json

Add these scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 📝 Example Tests

### Example 1: Unit Test (Utility Function)

Create `src/lib/__tests__/streakUtils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../streakUtils';

describe('calculateStreak', () => {
  it('should return 0 for empty activity logs', () => {
    const result = calculateStreak([]);
    expect(result).toBe(0);
  });

  it('should calculate streak correctly for consecutive days', () => {
    const activities = [
      { logged_at: '2024-03-10T10:00:00Z' },
      { logged_at: '2024-03-11T10:00:00Z' },
      { logged_at: '2024-03-12T10:00:00Z' },
    ];
    const result = calculateStreak(activities);
    expect(result).toBe(3);
  });

  it('should reset streak when day is skipped', () => {
    const activities = [
      { logged_at: '2024-03-10T10:00:00Z' },
      { logged_at: '2024-03-11T10:00:00Z' },
      { logged_at: '2024-03-13T10:00:00Z' }, // Skipped 3/12
    ];
    const result = calculateStreak(activities);
    expect(result).toBe(1); // Only counts from most recent
  });
});
```

Run: `npm run test`

---

### Example 2: Component Test (Button)

Create `src/components/ui/__tests__/button.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
  });

  it('applies variant styles correctly', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-destructive');
  });
});
```

---

### Example 3: Component Test with Form Validation

Create `src/components/__tests__/AddGoalDialog.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddGoalDialog } from '../AddGoalDialog';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
  },
}));

describe('AddGoalDialog', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(<AddGoalDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/goal name/i)).toBeInTheDocument();
  });

  it('shows validation error for empty goal name', async () => {
    const user = userEvent.setup();
    render(<AddGoalDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />);
    
    const submitButton = screen.getByRole('button', { name: /create goal/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/goal name is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for goal name too long', async () => {
    const user = userEvent.setup();
    render(<AddGoalDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/goal name/i);
    await user.type(input, 'A'.repeat(101)); // Max is 100 chars
    
    const submitButton = screen.getByRole('button', { name: /create goal/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/must be less than 100 characters/i)).toBeInTheDocument();
    });
  });

  it('successfully creates goal with valid input', async () => {
    const user = userEvent.setup();
    render(<AddGoalDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />);
    
    const input = screen.getByLabelText(/goal name/i);
    await user.type(input, 'Morning Run');
    
    const submitButton = screen.getByRole('button', { name: /create goal/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

### Example 4: E2E Test (Complete User Journey)

Create `e2e/user-journey.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete First-Time User Journey', () => {
  test('user can sign up, create goal, and upgrade to premium', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Momentum/);
    
    // 2. Click "Start Free" CTA
    await page.getByRole('button', { name: /start free/i }).click();
    
    // 3. Sign up with new account
    await expect(page).toHaveURL(/\/auth/);
    const email = `test-${Date.now()}@example.com`;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill('TestPass123!');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // 4. Should redirect to welcome or dashboard
    await expect(page).toHaveURL(/\/(welcome|dashboard)/);
    
    // 5. Navigate to dashboard (if on welcome, click Get Started)
    if (page.url().includes('welcome')) {
      await page.getByRole('button', { name: /get started/i }).click();
    }
    await expect(page).toHaveURL(/\/dashboard/);
    
    // 6. Create first goal
    await page.getByRole('button', { name: /add goal/i }).click();
    await page.getByLabel(/goal name/i).fill('Morning Run');
    await page.getByRole('button', { name: /create/i }).click();
    
    // 7. Verify goal appears
    await expect(page.getByText('Morning Run')).toBeVisible();
    
    // 8. Log first activity
    await page.getByRole('button', { name: /log activity/i }).first().click();
    await expect(page.getByText(/1 day/i)).toBeVisible(); // Streak counter
    
    // 9. Create second and third goals
    await page.getByRole('button', { name: /add goal/i }).click();
    await page.getByLabel(/goal name/i).fill('Strength Training');
    await page.getByRole('button', { name: /create/i }).click();
    
    await page.getByRole('button', { name: /add goal/i }).click();
    await page.getByLabel(/goal name/i).fill('Yoga');
    await page.getByRole('button', { name: /create/i }).click();
    
    // 10. Try to create 4th goal - should hit paywall
    await page.getByRole('button', { name: /add goal/i }).click();
    await expect(page.getByText(/upgrade to premium/i)).toBeVisible();
    
    // 11. Click upgrade
    await page.getByRole('button', { name: /upgrade to premium/i }).click();
    await expect(page).toHaveURL(/\/pricing/);
    
    // 12. Click upgrade on pricing page
    await page.getByRole('button', { name: /upgrade/i }).first().click();
    
    // 13. Should redirect to Stripe Checkout (or modal)
    // Note: In test mode, you might mock Stripe or use Stripe test mode
    // For demo purposes, we'll just verify redirect happened
    await expect(page).toHaveURL(/stripe|checkout/);
  });
});
```

Run: `npm run test:e2e`

---

### Example 5: E2E Test (Mobile Responsive)

Create `e2e/mobile-responsive.spec.ts`:

```typescript
import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Responsive Tests', () => {
  test.use({
    ...devices['iPhone 12'],
  });

  test('mobile homepage is fully responsive', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport is mobile
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeLessThan(400);
    
    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    
    // Verify CTA button is visible and tappable
    const ctaButton = page.getByRole('button', { name: /start free/i });
    await expect(ctaButton).toBeVisible();
    
    // Check button is large enough for touch (min 44px)
    const buttonBox = await ctaButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('mobile dashboard is usable', async ({ page }) => {
    // Note: You'd need to handle login here
    // For demo, assuming user is logged in via test fixtures
    await page.goto('/dashboard');
    
    // Verify add goal button is tappable
    const addButton = page.getByRole('button', { name: /add goal/i });
    await expect(addButton).toBeVisible();
    
    const buttonBox = await addButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    
    // Verify goal cards stack vertically on mobile
    const goalCards = page.locator('[data-testid="goal-card"]');
    const count = await goalCards.count();
    
    if (count > 1) {
      const firstCardBox = await goalCards.nth(0).boundingBox();
      const secondCardBox = await goalCards.nth(1).boundingBox();
      
      // Second card should be below first (not side-by-side)
      expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y! + firstCardBox?.height!);
    }
  });
});
```

---

### Example 6: Accessibility Test

Create `e2e/accessibility.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard should have no accessibility violations', async ({ page }) => {
    // Note: Need to handle authentication
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Verify we can reach the CTA button
    let attempts = 0;
    let foundCTA = false;
    
    while (attempts < 20 && !foundCTA) {
      const focusedText = await page.evaluate(() => document.activeElement?.textContent);
      if (focusedText?.includes('Start Free')) {
        foundCTA = true;
      } else {
        await page.keyboard.press('Tab');
        attempts++;
      }
    }
    
    expect(foundCTA).toBe(true);
  });
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 📊 Test Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

This generates a coverage report in `coverage/` directory.

**Target Coverage:**
- **Statements:** >80%
- **Branches:** >75%
- **Functions:** >80%
- **Lines:** >80%

---

## 🚀 Running Tests

### Unit & Component Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode (visual debugger)
npm run test:e2e:ui

# Run E2E tests in debug mode (step through)
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/user-journey.spec.ts

# Run specific browser
npx playwright test --project=chromium
```

---

## 📋 Testing Checklist

Before each release:

### Pre-Release Testing
- [ ] All unit tests pass (`npm run test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] No accessibility violations (`npm run test:e2e -- accessibility.spec.ts`)
- [ ] Test coverage >80%
- [ ] Manual QA on real devices (iOS, Android)
- [ ] Performance tests pass (Lighthouse >90)

### Continuous Monitoring
- [ ] CI/CD pipeline runs tests on every PR
- [ ] Failed tests block merges
- [ ] Coverage reports reviewed
- [ ] Playwright HTML report reviewed for failures

---

## 🐛 Debugging Failed Tests

### Debugging Vitest Tests
1. Use `--ui` flag to see visual test runner
2. Add `console.log` statements in your tests
3. Use `screen.debug()` to see component HTML
4. Check `src/test/setup.ts` for global test configuration

### Debugging Playwright Tests
1. Use `--ui` flag to see visual test runner with timeline
2. Use `--debug` to step through tests
3. Check screenshots on failure (stored in `test-results/`)
4. Use `await page.pause()` to stop execution and inspect

---

## 💡 Best Practices

### Writing Good Tests
1. **Test behavior, not implementation**
   - ❌ Bad: Test that a function is called
   - ✅ Good: Test that the expected outcome occurs
2. **Use descriptive test names**
   - ❌ Bad: `it('works')`
   - ✅ Good: `it('shows error message when goal name is empty')`
3. **Arrange-Act-Assert pattern**
   - Arrange: Set up test data
   - Act: Perform action
   - Assert: Verify outcome
4. **Keep tests independent**
   - Each test should run in isolation
   - Don't rely on test execution order
5. **Mock external dependencies**
   - Mock Supabase calls
   - Mock Stripe API
   - Mock external APIs

### Test Organization
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
e2e/
├── user-journey.spec.ts
├── mobile-responsive.spec.ts
└── accessibility.spec.ts
```

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Next Steps:**
1. Set up testing dependencies
2. Write your first unit test
3. Set up Playwright for E2E tests
4. Add tests to CI/CD pipeline
5. Gradually increase coverage to >80%
