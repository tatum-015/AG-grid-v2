import { test, expect } from '@playwright/test'

test.describe('Working Chip Configuration Test', () => {
  
  test('should configure chips through complete workflow', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5174')
    await page.waitForSelector('[data-testid="wizard-container"]', { timeout: 10000 })
    
    // Step 1: Upload CSV
    console.log('Step 1: Uploading CSV...')
    
    const csvContent = `Access Status,Assessment Type,Property Type,Property Name
Accessed,REG10 Door Inspection,Residential,Flat 1
No Access,REG10 Door Inspection,Residential,Flat 2  
Accessed,REG7 Visual Check,Commercial,Office 3
Planned,REG7 Visual Check,Commercial,Office 4
Scheduled,REG10 Door Inspection,Residential,Flat 5`
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Continue to Step 2
    await page.waitForSelector('text=Continue', { timeout: 5000 })
    await page.click('text=Continue')
    
    // Step 2: Configure hierarchy
    console.log('Step 2: Configuring hierarchy...')
    await page.waitForSelector('text=Step 2: Configure Data Display', { timeout: 5000 })
    
    // Take screenshot to see available options
    await page.screenshot({ path: 'test-results/step2-available-columns.png', fullPage: true })
    
    // Select Property Type as hierarchy (it should be available)
    await page.click('text= Property Type (text)')
    
    // Load tree data
    await page.waitForSelector('text=Load Tree Data')
    await page.click('text=Load Tree Data')
    
    // Step 3: Verify grid loads
    console.log('Step 3: Waiting for grid to load...')
    await page.waitForSelector('.tree-data-grid', { timeout: 10000 })
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    
    // Take screenshot of loaded grid
    await page.screenshot({ path: 'test-results/grid-loaded-with-data.png', fullPage: true })
    
    // Step 4: Configure chips
    console.log('Step 4: Configuring chips...')
    
    // Verify Configure Chips button is enabled
    await expect(page.locator('text=Configure Chips')).toBeEnabled()
    
    // Click Configure Chips
    await page.click('text=Configure Chips')
    
    // Wait for modal
    await page.waitForSelector('text=Configure Status Chips', { timeout: 5000 })
    await page.screenshot({ path: 'test-results/chip-modal-opened.png', fullPage: true })
    
    // Step 5: Test radio button behavior
    console.log('Step 5: Testing radio button behavior...')
    
    // Initially should have no column selected or "No chip column" selected
    const initialChecked = await page.locator('input[type="radio"]:checked').count()
    console.log(`Initial checked radios: ${initialChecked}`)
    
    // Select Access Status for chips
    await page.click('input[value="Access Status"]')
    
    // Verify only one radio is checked
    const checkedAfterSelection = await page.locator('input[type="radio"]:checked').count()
    expect(checkedAfterSelection).toBe(1)
    console.log('✓ Only one radio button selected')
    
    // Verify chip configuration appears
    await page.waitForSelector('text=Configure Chip Colors', { timeout: 3000 })
    await page.screenshot({ path: 'test-results/chip-config-visible.png', fullPage: true })
    
    // Test selecting different column
    await page.click('input[value="Assessment Type"]')
    
    // Verify still only one checked
    const checkedAfterSwitch = await page.locator('input[type="radio"]:checked').count()
    expect(checkedAfterSwitch).toBe(1)
    
    // Verify Assessment Type is now selected
    await expect(page.locator('input[value="Assessment Type"]')).toBeChecked()
    await expect(page.locator('input[value="Access Status"]')).not.toBeChecked()
    console.log('✓ Radio button switching works correctly')
    
    // Go back to Access Status (better for chip testing)
    await page.click('input[value="Access Status"]')
    await page.waitForSelector('text=Configure Chip Colors')
    
    // Step 6: Configure chip colors
    console.log('Step 6: Configuring chip colors...')
    
    // Find and click a color option for the first value
    const colorButtons = page.locator('.color-option-btn')
    const colorCount = await colorButtons.count()
    console.log(`Found ${colorCount} color buttons`)
    
    if (colorCount > 0) {
      await colorButtons.first().click()
      console.log('✓ Selected color for first chip')
    }
    
    // Apply changes
    await page.click('text=Apply Changes')
    
    // Verify modal closes
    await expect(page.locator('text=Configure Status Chips')).not.toBeVisible({ timeout: 3000 })
    console.log('✓ Modal closed after applying changes')
    
    // Step 7: Verify chips appear in grid
    console.log('Step 7: Verifying chips in grid...')
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-with-chips.png', fullPage: true })
    
    // Look for chip elements (styled spans)
    await page.waitForSelector('.ag-center-cols-container span[style*="border-radius"]', { timeout: 5000 })
    const chipElements = await page.locator('.ag-center-cols-container span[style*="border-radius"]').count()
    
    expect(chipElements).toBeGreaterThan(0)
    console.log(`✓ Success! Found ${chipElements} chip elements in the grid`)
    
    // Test reset functionality
    console.log('Step 8: Testing reset functionality...')
    await page.click('text=Configure Chips')
    await page.waitForSelector('text=Configure Status Chips')
    
    // Select a column first
    await page.click('input[value="Access Status"]')
    await page.waitForSelector('text=Configure Chip Colors')
    
    // Reset
    await page.click('text=Reset')
    
    // Verify reset worked
    const checkedAfterReset = await page.locator('input[type="radio"]:checked').count()
    expect(checkedAfterReset).toBe(0)
    console.log('✓ Reset functionality works correctly')
    
    // Close modal
    await page.click('text=Cancel')
    
    console.log('🎉 All chip configuration tests passed successfully!')
  })
})