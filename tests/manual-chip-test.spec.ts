import { test, expect } from '@playwright/test'

test.describe('Manual Chip Configuration Test', () => {
  test('complete chip configuration workflow', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5174')
    
    // Wait for the wizard to load
    await page.waitForSelector('[data-testid="wizard-container"]', { timeout: 10000 })
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'test-results/01-initial-load.png', fullPage: true })
    
    // Check if we're in step 1 and can see the upload interface
    const step1Text = page.locator('text=Step 1: Upload CSV File')
    if (await step1Text.isVisible()) {
      console.log('In Step 1 - Upload interface')
      
      // Try to find Load Sample Data button in the grid area
      const gridStep = page.locator('.grid-step')
      if (await gridStep.isVisible()) {
        console.log('Grid step is visible')
        await page.screenshot({ path: 'test-results/02-grid-visible.png', fullPage: true })
        
        // Look for Load Sample Data button
        await page.waitForSelector('text=Load Sample Data', { timeout: 5000 })
        await page.click('text=Load Sample Data')
        
        // Wait for data to load
        await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
        
        // Take screenshot after loading data
        await page.screenshot({ path: 'test-results/03-data-loaded.png', fullPage: true })
        
        // Now test chip configuration
        await page.click('text=Configure Chips')
        
        // Wait for modal
        await page.waitForSelector('text=Configure Status Chips')
        await page.screenshot({ path: 'test-results/04-chip-modal-open.png', fullPage: true })
        
        // Try to select a column - look for radio buttons
        const radioButtons = page.locator('input[type="radio"]')
        const radioCount = await radioButtons.count()
        console.log(`Found ${radioCount} radio buttons`)
        
        if (radioCount > 1) {
          // Click the second radio button (first might be "No chip column")
          await radioButtons.nth(1).click()
          await page.screenshot({ path: 'test-results/05-column-selected.png', fullPage: true })
          
          // Verify only one radio is checked
          const checkedRadios = await page.locator('input[type="radio"]:checked').count()
          expect(checkedRadios).toBe(1)
          console.log(`Verified only 1 radio button is checked`)
          
          // Wait for chip configuration to appear
          await page.waitForSelector('text=Configure Chip Colors', { timeout: 3000 })
          await page.screenshot({ path: 'test-results/06-chip-config-visible.png', fullPage: true })
          
          // Apply changes
          await page.click('text=Apply Changes')
          
          // Verify modal closes
          await expect(page.locator('text=Configure Status Chips')).not.toBeVisible({ timeout: 3000 })
          
          // Take final screenshot
          await page.screenshot({ path: 'test-results/07-chips-applied.png', fullPage: true })
          
          console.log('Chip configuration test completed successfully')
        }
      }
    }
  })
})