import { test, expect } from '@playwright/test'

test.describe('Complete Chip Configuration Workflow', () => {
  
  async function navigateToGridWithSampleData(page: any) {
    // Navigate to the application
    await page.goto('http://localhost:5174')
    
    // Wait for the wizard to load
    await page.waitForSelector('[data-testid="wizard-container"]', { timeout: 10000 })
    
    // We should be in Step 1 (Upload CSV File)
    await expect(page.locator('text=Step 1: Upload CSV File')).toBeVisible()
    
    // Since we need to get to the grid view with data, we'll need to find a way
    // to load sample data. Let's check if there's a way to skip the wizard.
    
    // Look for any mechanism to load sample data or bypass the wizard
    // First, let's try to see if there's already a grid view available
    // by checking if we can access step 3 directly
    
    // For now, let's simulate uploading a CSV by creating a simple CSV file
    // and going through the wizard flow properly
    
    // Create a simple CSV content for testing
    const csvContent = `Property Hierarchy,Access Status,Assessment Type,Property Type
Savills > Block A > Flat 1,Accessed,REG10 Door Inspection,Residential
Savills > Block A > Flat 2,No Access,REG10 Door Inspection,Residential  
Savills > Block B > Flat 3,Accessed,REG7 Visual Check,Commercial
Savills > Block B > Flat 4,Planned,REG7 Visual Check,Commercial`
    
    // Create a file for upload
    const file = new File([csvContent], 'test-data.csv', { type: 'text/csv' })
    
    // Click choose file and upload
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Wait for file to be processed and continue button to appear
    await page.waitForSelector('text=Continue', { timeout: 5000 })
    await page.click('text=Continue')
    
    // Now we should be in Step 2 (Configure Data Display)
    await page.waitForSelector('text=Step 2: Configure Data Display', { timeout: 5000 })
    
    // Select Property Hierarchy as the hierarchy column
    await page.click('input[value="Property Hierarchy"]')
    
    // Continue to grid view
    await page.click('text=Load Tree Data')
    
    // Wait for the grid to load
    await page.waitForSelector('.tree-data-grid', { timeout: 10000 })
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
  }

  test('should navigate through wizard and configure chips successfully', async ({ page }) => {
    await navigateToGridWithSampleData(page)
    
    // Take screenshot of the grid
    await page.screenshot({ path: 'test-results/wizard-grid-loaded.png', fullPage: true })
    
    // Verify we can see the Configure Chips button and it's enabled
    await expect(page.locator('text=Configure Chips')).toBeVisible()
    await expect(page.locator('text=Configure Chips')).toBeEnabled()
    
    // Click Configure Chips
    await page.click('text=Configure Chips')
    
    // Wait for the chip configuration modal
    await page.waitForSelector('text=Configure Status Chips', { timeout: 5000 })
    await page.screenshot({ path: 'test-results/chip-modal-opened.png', fullPage: true })
    
    // Verify modal is open
    await expect(page.locator('text=Configure Status Chips')).toBeVisible()
    
    // Select Access Status column for chips
    await page.click('input[value="Access Status"]')
    
    // Wait for chip configuration section to appear
    await page.waitForSelector('text=Configure Chip Colors', { timeout: 3000 })
    await page.screenshot({ path: 'test-results/chip-config-section.png', fullPage: true })
    
    // Verify unique values are detected
    await expect(page.locator('text=Found')).toBeVisible()
    
    // Configure colors for the first chip (click on a color option)
    const firstColorBtn = page.locator('.color-option-btn').first()
    await firstColorBtn.click()
    
    // Apply changes
    await page.click('text=Apply Changes')
    
    // Verify modal closes
    await expect(page.locator('text=Configure Status Chips')).not.toBeVisible({ timeout: 3000 })
    
    // Take final screenshot to verify chips are applied
    await page.screenshot({ path: 'test-results/chips-applied-final.png', fullPage: true })
    
    // Verify chips appear in the grid (look for styled spans)
    await page.waitForSelector('.ag-center-cols-container span[style*="border-radius"]', { timeout: 5000 })
    const chipElements = await page.locator('.ag-center-cols-container span[style*="border-radius"]').count()
    expect(chipElements).toBeGreaterThan(0)
    
    console.log(`Successfully applied chips - found ${chipElements} chip elements in grid`)
  })

  test('should verify radio button behavior in chip configuration', async ({ page }) => {
    await navigateToGridWithSampleData(page)
    
    // Open chip configuration modal
    await page.click('text=Configure Chips')
    await page.waitForSelector('text=Configure Status Chips')
    
    // Initially no radio should be selected (or "No chip column" should be selected)
    const initialCheckedRadios = await page.locator('input[type="radio"]:checked').count()
    expect(initialCheckedRadios).toBeLessThanOrEqual(1)
    
    // Select Access Status
    await page.click('input[value="Access Status"]')
    
    // Verify only one radio is checked
    let checkedRadios = await page.locator('input[type="radio"]:checked').count()
    expect(checkedRadios).toBe(1)
    
    // Verify Access Status is checked
    await expect(page.locator('input[value="Access Status"]')).toBeChecked()
    
    // Select different column (Assessment Type)
    await page.click('input[value="Assessment Type"]')
    
    // Verify still only one radio is checked
    checkedRadios = await page.locator('input[type="radio"]:checked').count()
    expect(checkedRadios).toBe(1)
    
    // Verify Assessment Type is now checked and Access Status is not
    await expect(page.locator('input[value="Assessment Type"]')).toBeChecked()
    await expect(page.locator('input[value="Access Status"]')).not.toBeChecked()
    
    // Select "No chip column"
    await page.click('input[value=""]')
    
    // Verify chip configuration section disappears
    await expect(page.locator('text=Configure Chip Colors')).not.toBeVisible()
    
    console.log('Radio button behavior verified successfully')
  })

  test('should allow resetting chip configuration', async ({ page }) => {
    await navigateToGridWithSampleData(page)
    
    // Open chip modal and configure a column
    await page.click('text=Configure Chips')
    await page.waitForSelector('text=Configure Status Chips')
    
    // Select a column
    await page.click('input[value="Access Status"]')
    await page.waitForSelector('text=Configure Chip Colors')
    
    // Reset configuration
    await page.click('text=Reset')
    
    // Verify no radio is selected
    const checkedRadios = await page.locator('input[type="radio"]:checked').count()
    expect(checkedRadios).toBe(0)
    
    // Verify chip configuration section is hidden
    await expect(page.locator('text=Configure Chip Colors')).not.toBeVisible()
    
    console.log('Reset functionality verified successfully')
  })
})