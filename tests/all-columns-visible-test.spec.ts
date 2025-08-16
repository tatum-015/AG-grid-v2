import { test, expect } from '@playwright/test'

test.describe('All Columns Visible Test', () => {
  
  test('should show ALL CSV columns in hierarchy selection regardless of data type', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5174')
    await page.waitForSelector('[data-testid="wizard-container"]', { timeout: 10000 })
    
    console.log('Testing that ALL columns are visible in hierarchy selection...')
    
    // Use the same CSV content as the user's file
    const csvContent = `UPRN,Property Hierarchy,Property Type,Assessment ID,Assessment Type,Assessment Due Date,Assessment Date,Assessment Month,Assessment Quarter,Assessment Year,Service Provider,Assessor,Access Status
CG-EST-BLKQ-C001,Core,High Rise,REG10-Q1-2024-0001,REG10 Door Inspection,15-03-2024,07-02-2024,February,Q1 2024,2024,Savills,Karen Morris,Accessed
CG-EST-BLKQ-C001,Core,High Rise,REG10-Q2-2024-0001,REG10 Door Inspection,25-03-2024,17-03-2024,March,Q2 2024,2024,Savills,Dino Saur,Accessed`
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-all-column-types.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Continue to Step 2
    await page.waitForSelector('text=Continue', { timeout: 5000 })
    await page.click('text=Continue')
    
    // Wait for Step 2 to load
    await page.waitForSelector('text=Step 2: Configure Data Display', { timeout: 5000 })
    
    // Take screenshot to verify all columns are shown
    await page.screenshot({ path: 'test-results/all-columns-hierarchy-selection.png', fullPage: true })
    
    // Check that ALL 13 columns are visible in the Available Columns section
    const expectedColumns = [
      'UPRN',
      'Property Hierarchy', 
      'Property Type',
      'Assessment ID',
      'Assessment Type',
      'Assessment Due Date',
      'Assessment Date',
      'Assessment Month',
      'Assessment Quarter',
      'Assessment Year', // This was missing before!
      'Service Provider',
      'Assessor',
      'Access Status'
    ]
    
    console.log('Checking for all expected columns...')
    
    for (const columnName of expectedColumns) {
      await expect(page.locator(`text=${columnName}`)).toBeVisible()
      console.log(`✓ Found column: ${columnName}`)
    }
    
    // Count the total number of column buttons
    const columnButtons = await page.locator('.column-pill').count()
    console.log(`Total column buttons found: ${columnButtons}`)
    
    // Should have all 13 columns
    expect(columnButtons).toBe(13)
    
    console.log('✓ All 13 CSV columns are now visible in hierarchy selection!')
  })
})