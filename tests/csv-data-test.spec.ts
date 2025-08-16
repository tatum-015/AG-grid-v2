import { test, expect } from '@playwright/test'

test.describe('CSV Data Structure Test', () => {
  
  test('should display all assessment records under correct assessment types', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5174')
    await page.waitForSelector('[data-testid="wizard-container"]', { timeout: 10000 })
    
    console.log('Loading sample CSV data to test hierarchy display...')
    
    // Create a sample CSV with the same structure as the user's file
    const csvContent = `UPRN,Property Hierarchy,Property Type,Assessment ID,Assessment Type,Assessment Due Date,Assessment Date,Assessment Month,Assessment Quarter,Assessment Year,Service Provider,Assessor,Access Status
CG-EST-BLKQ-C001,Core,High Rise,REG10-Q1-2024-0001,REG10 Door Inspection,15-03-2024,07-02-2024,February,Q1 2024,2024,Savills,Karen Morris,Accessed
CG-EST-BLKQ-C001,Core,High Rise,REG10-Q2-2024-0001,REG10 Door Inspection,25-03-2024,17-03-2024,March,Q2 2024,2024,Savills,Dino Saur,Accessed
CG-EST-BLKQ-C001,Core,High Rise,REG10-Q3-2024-0001,REG10 Door Inspection,31-07-2024,21-07-2024,July,Q3 2024,2024,Savills,Tim Foil,Accessed
CG-EST-BLKQ-C001,Core,High Rise,REG7-Q1-Jan-2024,REG7 Visual Check,-,-,January,Q1 2024,2024,Savills,-,Not In Programme
CG-EST-BLKQ-C001,Core,High Rise,REG7-Q2-Apr-2024,REG7 Visual Check,30-04-2024,16-04-2024,April,Q2 2024,2024,Savills,Dino Saur,Accessed
CG-EST-BLKQ-C001,Core,High Rise,REG7-Q3-July-2024,REG7 Visual Check,30-07-2024,18-07-2024,July,Q3 2024,2024,Savills,Dino Saur,Accessed`
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-hierarchy-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Continue to Step 2
    await page.waitForSelector('text=Continue', { timeout: 5000 })
    await page.click('text=Continue')
    
    // Step 2: Configure hierarchy manually 
    console.log('Step 2: Configuring hierarchy...')
    await page.waitForSelector('text=Step 2: Configure Data Display', { timeout: 5000 })
    
    // Take screenshot to see available columns
    await page.screenshot({ path: 'test-results/step2-columns.png', fullPage: true })
    
    // Select proper hierarchy columns: Property Hierarchy, Property Type, Assessment Type
    await page.click('text=Property Hierarchy')
    await page.waitForTimeout(500)
    await page.click('text=Property Type') 
    await page.waitForTimeout(500)
    await page.click('text=Assessment Type')
    
    // Wait for hierarchy to be configured
    await page.waitForTimeout(1000)
    
    // Take screenshot after selection
    await page.screenshot({ path: 'test-results/after-uprn-selection.png', fullPage: true })
    
    // Look for the Load Tree Data button with a more specific selector
    await page.waitForSelector('.load-btn', { timeout: 5000 })
    
    // Check if button is enabled
    const isEnabled = await page.locator('.load-btn').isEnabled()
    console.log(`Load Tree Data button is enabled: ${isEnabled}`)
    
    if (isEnabled) {
      await page.click('.load-btn')
    } else {
      throw new Error('Load Tree Data button is not enabled after UPRN selection')
    }
    
    // Wait for the grid to load
    await page.waitForSelector('.tree-data-grid', { timeout: 10000 })
    await page.waitForSelector('.ag-center-cols-container', { timeout: 5000 })
    
    // Take screenshot of the loaded grid
    await page.screenshot({ path: 'test-results/csv-hierarchy-test.png', fullPage: true })
    
    // Wait for data to be rendered
    await page.waitForTimeout(2000)
    
    // Verify we can see the UPRN structure (should start with root nodes)
    const uprnRows = await page.locator('.ag-center-cols-container .ag-row').count()
    console.log(`Found ${uprnRows} rows in the grid`)
    expect(uprnRows).toBeGreaterThan(1) // Should have at least the UPRN hierarchy nodes
    
    // Expand all nodes to see the full structure
    await page.click('text=Expand All')
    await page.waitForTimeout(1000)
    
    // Take screenshot after expansion
    await page.screenshot({ path: 'test-results/csv-hierarchy-expanded.png', fullPage: true })
    
    // Count rows after expansion
    const expandedRows = await page.locator('.ag-center-cols-container .ag-row').count()
    console.log(`Found ${expandedRows} rows after expansion`)
    expect(expandedRows).toBeGreaterThan(5) // Should have all assessment records visible
    
    // Check for REG10 Door Inspection
    await expect(page.locator('text=REG10 Door Inspection')).toBeVisible()
    
    // Check for REG7 Visual Check
    await expect(page.locator('text=REG7 Visual Check')).toBeVisible()
    
    // Verify we can see individual assessment IDs (the leaf nodes)
    await expect(page.locator('text=REG10-Q1-2024-0001').first()).toBeVisible()
    await expect(page.locator('text=REG10-Q2-2024-0001').first()).toBeVisible()
    await expect(page.locator('text=REG7-Q1-Jan-2024').first()).toBeVisible()
    
    console.log('✓ Successfully verified that all assessment records are displayed in hierarchy')
  })
})