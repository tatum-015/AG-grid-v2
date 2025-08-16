import { test, expect } from '@playwright/test'

test.describe('Chip Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5174')
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="wizard-container"]', { timeout: 10000 })
    
    // Navigate through the wizard to get to the grid view
    // First, load sample data by clicking "Load Sample Data" if available
    const loadSampleBtn = page.locator('text=Load Sample Data')
    if (await loadSampleBtn.isVisible()) {
      await loadSampleBtn.click()
      // Wait for grid to appear
      await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    } else {
      // If not in grid view, we might be in wizard mode
      // Check if we're in step 1 (upload) and skip to step 3 (grid)
      const wizardStep = page.locator('.wizard-step')
      if (await wizardStep.isVisible()) {
        // Try to find any way to get to the grid - perhaps we need to upload sample data differently
        console.log('In wizard mode, attempting to navigate to grid...')
      }
    }
  })

  test('should load sample data and open chip configuration modal', async ({ page }) => {
    // Load sample data first
    await page.click('text=Load Sample Data')
    
    // Wait for grid to load with data
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    
    // Click the Configure Chips button
    await page.click('text=Configure Chips')
    
    // Verify the modal opens
    await expect(page.locator('text=Configure Status Chips')).toBeVisible()
  })

  test('should allow selecting a column for chips', async ({ page }) => {
    // Load sample data
    await page.click('text=Load Sample Data')
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    
    // Open chip configuration modal
    await page.click('text=Configure Chips')
    
    // Wait for modal to be visible
    await page.waitForSelector('text=Configure Status Chips')
    
    // Select a column for chips (e.g., PropertyType)
    await page.click('input[value="PropertyType"]')
    
    // Verify the chip configuration section appears
    await expect(page.locator('text=Configure Chip Colors')).toBeVisible()
    
    // Verify unique values are detected
    await expect(page.locator('text=Found')).toBeVisible()
  })

  test('should only select one radio button at a time', async ({ page }) => {
    // Load sample data
    await page.click('text=Load Sample Data')
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    
    // Open chip configuration modal
    await page.click('text=Configure Chips')
    await page.waitForSelector('text=Configure Status Chips')
    
    // Select first column
    await page.click('input[value="PropertyType"]')
    
    // Verify only one radio button is checked
    const checkedRadios = await page.locator('input[type="radio"]:checked').count()
    expect(checkedRadios).toBe(1)
    
    // Select different column
    await page.click('input[value="Estate"]')
    
    // Verify still only one radio button is checked
    const checkedRadiosAfter = await page.locator('input[type="radio"]:checked').count()
    expect(checkedRadiosAfter).toBe(1)
    
    // Verify the correct one is selected
    await expect(page.locator('input[value="Estate"]')).toBeChecked()
    await expect(page.locator('input[value="PropertyType"]')).not.toBeChecked()
  })

  test('should configure chip colors and apply changes', async ({ page }) => {
    // Load sample data
    await page.click('text=Load Sample Data')
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    
    // Open chip configuration modal
    await page.click('text=Configure Chips')
    await page.waitForSelector('text=Configure Status Chips')
    
    // Select PropertyType column
    await page.click('input[value="PropertyType"]')
    
    // Wait for chip configuration to appear
    await page.waitForSelector('text=Configure Chip Colors')
    
    // Click on a color option for the first chip
    await page.locator('.color-option-btn').first().click()
    
    // Apply changes
    await page.click('text=Apply Changes')
    
    // Verify modal closes
    await expect(page.locator('text=Configure Status Chips')).not.toBeVisible()
    
    // Verify chips appear in the grid (look for styled spans)
    await page.waitForSelector('.ag-center-cols-container span[style*="border-radius: 20px"]', { timeout: 5000 })
    
    // Count chip elements in the grid
    const chipElements = await page.locator('.ag-center-cols-container span[style*="border-radius: 20px"]').count()
    expect(chipElements).toBeGreaterThan(0)
  })

  test('should reset chip configuration', async ({ page }) => {
    // Load sample data
    await page.click('text=Load Sample Data')
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    
    // Open chip configuration modal
    await page.click('text=Configure Chips')
    await page.waitForSelector('text=Configure Status Chips')
    
    // Select a column
    await page.click('input[value="PropertyType"]')
    
    // Reset configuration
    await page.click('text=Reset')
    
    // Verify no radio button is selected
    const checkedRadios = await page.locator('input[type="radio"]:checked').count()
    expect(checkedRadios).toBe(0)
    
    // Verify chip configuration section is hidden
    await expect(page.locator('text=Configure Chip Colors')).not.toBeVisible()
  })

  test('should disable Configure Chips button when no data is loaded', async ({ page }) => {
    // Verify Configure Chips button is disabled initially
    await expect(page.locator('text=Configure Chips')).toBeDisabled()
    
    // Load sample data
    await page.click('text=Load Sample Data')
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    
    // Verify Configure Chips button is now enabled
    await expect(page.locator('text=Configure Chips')).toBeEnabled()
  })
})