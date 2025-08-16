import { test, expect } from '@playwright/test'

test.describe('Column Display Test', () => {
  
  test('should display all CSV columns including Assessment Month, Quarter, etc.', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5174')
    await page.waitForSelector('[data-testid="wizard-container"]', { timeout: 10000 })
    
    console.log('Testing column display with complete CSV data...')
    
    // Create CSV with all columns
    const csvContent = `UPRN,Property Hierarchy,Property Type,Assessment ID,Assessment Type,Assessment Due Date,Assessment Date,Assessment Month,Assessment Quarter,Assessment Year,Service Provider,Assessor,Access Status
CG-EST-BLKQ-C001,Core,High Rise,REG10-Q1-2024-0001,REG10 Door Inspection,15-03-2024,07-02-2024,February,Q1 2024,2024,Savills,Karen Morris,Accessed
CG-EST-BLKQ-C001,Core,High Rise,REG10-Q2-2024-0001,REG10 Door Inspection,25-03-2024,17-03-2024,March,Q2 2024,2024,Savills,Dino Saur,Accessed`
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-all-columns.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Continue to Step 2
    await page.waitForSelector('text=Continue', { timeout: 5000 })
    await page.click('text=Continue')
    
    // Select hierarchy columns
    await page.waitForSelector('text=Step 2: Configure Data Display', { timeout: 5000 })
    await page.click('text=Property Hierarchy')
    await page.waitForTimeout(500)
    await page.click('text=Property Type')
    await page.waitForTimeout(500)
    await page.click('text=Assessment Type')
    
    // Load tree data
    await page.waitForSelector('.load-btn', { timeout: 5000 })
    await page.click('.load-btn')
    
    // Wait for grid to load
    await page.waitForSelector('.tree-data-grid', { timeout: 10000 })
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/all-columns-test.png', fullPage: true })
    
    // Expand all to see data
    await page.click('text=Expand All')
    await page.waitForTimeout(1000)
    
    await page.screenshot({ path: 'test-results/all-columns-expanded.png', fullPage: true })
    
    // Check for specific columns in the header
    await expect(page.locator('text=Assessment Month')).toBeVisible()
    await expect(page.locator('text=Assessment Quarter')).toBeVisible()
    await expect(page.locator('text=Assessment Year')).toBeVisible()
    await expect(page.locator('text=Service Provider')).toBeVisible()
    await expect(page.locator('text=Assessment Due Date')).toBeVisible()
    
    // Check that values are displayed in the grid
    await expect(page.locator('text=February').first()).toBeVisible()
    await expect(page.locator('text=Q1 2024').first()).toBeVisible() 
    await expect(page.locator('text=2024').first()).toBeVisible() // Assessment Year
    await expect(page.locator('text=Savills').first()).toBeVisible()
    
    // Count total columns in header
    const headerColumns = await page.locator('.ag-header-cell').count()
    console.log(`Total columns in header: ${headerColumns}`)
    
    // Should have Property Hierarchy + all data columns (9 data columns)
    expect(headerColumns).toBeGreaterThan(8)
    
    console.log('✓ All columns are now displayed correctly')
  })
})