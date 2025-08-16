import { test, expect } from '@playwright/test'

test.describe('Debug CSV Parsing', () => {
  
  test('should debug CSV parsing and column detection', async ({ page }) => {
    // Listen to console logs
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(`BROWSER LOG: ${msg.text()}`)
      }
    })
    
    // Navigate to the application
    await page.goto('http://localhost:5174')
    await page.waitForSelector('[data-testid="wizard-container"]', { timeout: 10000 })
    
    console.log('Debugging CSV parsing with Assessment Year column...')
    
    // Use the exact same CSV content as the user's file
    const csvContent = `UPRN,Property Hierarchy,Property Type,Assessment ID,Assessment Type,Assessment Due Date,Assessment Date,Assessment Month,Assessment Quarter,Assessment Year,Service Provider,Assessor,Access Status
CG-EST-BLKQ-C001,Core,High Rise,REG10-Q1-2024-0001,REG10 Door Inspection,15-03-2024,07-02-2024,February,Q1 2024,2024,Savills,Karen Morris,Accessed
CG-EST-BLKQ-C001,Core,High Rise,REG10-Q2-2024-0001,REG10 Door Inspection,25-03-2024,17-03-2024,March,Q2 2024,2024,Savills,Dino Saur,Accessed`
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'debug-assessment-year.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Continue to Step 2
    await page.waitForSelector('text=Continue', { timeout: 5000 })
    await page.click('text=Continue')
    
    // Wait for Step 2 to load and give time for console logs
    await page.waitForSelector('text=Step 2: Configure Data Display', { timeout: 5000 })
    await page.waitForTimeout(2000) // Wait for debug logs
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/debug-csv-parsing.png', fullPage: true })
    
    console.log('Debug test complete - check browser console logs above')
  })
})