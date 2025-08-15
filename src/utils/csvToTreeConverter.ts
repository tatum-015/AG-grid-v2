import type { TreeNode } from '@/stores/dataStore'

export interface ConversionOptions {
  hierarchyColumns: string[]
  dataColumns: string[]
}

export function convertCsvToTreeData(
  csvData: any[], 
  options: ConversionOptions
): TreeNode[] {
  const { hierarchyColumns, dataColumns } = options
  const treeNodes: TreeNode[] = []
  const nodeMap = new Map<string, TreeNode>()

  // Create unique ID generator
  let nodeIdCounter = 0
  const generateId = () => `node_${++nodeIdCounter}`

  csvData.forEach((row, rowIndex) => {
    // Build hierarchy path from the selected columns
    const hierarchyPath = hierarchyColumns
      .map(col => row[col])
      .filter(val => val != null && val !== '')
      .map(val => String(val).trim())

    if (hierarchyPath.length === 0) return

    // Create nodes for each level in the hierarchy
    for (let level = 0; level < hierarchyPath.length; level++) {
      const currentPath = hierarchyPath.slice(0, level + 1)
      const pathKey = currentPath.join(' > ')
      
      if (!nodeMap.has(pathKey)) {
        const isLeaf = false // These are group nodes
        const nodeId = generateId()
        
        // Extract data for this node
        const nodeData: any = {}
        
        // Add hierarchy column data
        hierarchyColumns.forEach((col, index) => {
          if (index <= level) {
            nodeData[col] = row[col]
          }
        })

        const node: TreeNode = {
          id: nodeId,
          hierarchyPath: currentPath,
          name: currentPath[currentPath.length - 1],
          level: `Level ${level + 1}`,
          isLeaf,
          nodeType: 'group',
          childCount: undefined,
          ...nodeData
        }

        nodeMap.set(pathKey, node)
        treeNodes.push(node)
      }
    }
    
    // Create individual record node for each CSV row
    const recordId = row['Assessment ID'] || row['UPRN'] || `record_${rowIndex}`
    const recordPath = [...hierarchyPath, recordId]
    const recordPathKey = recordPath.join(' > ')
    
    if (!nodeMap.has(recordPathKey)) {
      const nodeId = generateId()
      
      // Add all data columns for the individual record
      const nodeData: any = {}
      dataColumns.forEach(col => {
        if (row[col] !== undefined) {
          nodeData[col] = row[col]
        }
      })
      
      const recordNode: TreeNode = {
        id: nodeId,
        hierarchyPath: recordPath,
        name: recordId,
        level: `Level ${hierarchyPath.length + 1}`,
        isLeaf: true,
        nodeType: 'leaf',
        childCount: 0,
        ...nodeData
      }
      
      nodeMap.set(recordPathKey, recordNode)
      treeNodes.push(recordNode)
    }
  })

  // Calculate child counts for group nodes
  const sortedNodes = Array.from(nodeMap.values()).sort((a, b) => 
    a.hierarchyPath.length - b.hierarchyPath.length
  )

  sortedNodes.forEach(node => {
    if (!node.isLeaf) {
      const childNodes = sortedNodes.filter(child => 
        child.hierarchyPath.length === node.hierarchyPath.length + 1 &&
        child.hierarchyPath.slice(0, node.hierarchyPath.length).join(' > ') === 
        node.hierarchyPath.join(' > ')
      )
      node.childCount = childNodes.length
    }
  })

  return Array.from(nodeMap.values())
}

export function getDataPath(data: TreeNode): string[] {
  return data.hierarchyPath
}

export function generateSampleData(): any[] {
  return [
    {
      'Estate': 'Southwark Estate',
      'Block': 'Nelson Block',
      'Core': 'Core A',
      'Property': 'Flat 101',
      'PropertyUPRN': 'EST001',
      'Level': 'Estate (L1)',
      'PropertyType': 'Estate'
    },
    {
      'Estate': 'Southwark Estate',
      'Block': 'Nelson Block',
      'Core': 'Core A',
      'Property': 'Flat 102',
      'PropertyUPRN': 'BLK001',
      'Level': 'Block (L2)',
      'PropertyType': 'Block'
    },
    {
      'Estate': 'Southwark Estate',
      'Block': 'Nelson Block',
      'Core': 'Core B',
      'Property': 'Flat 201',
      'PropertyUPRN': 'COR001',
      'Level': 'Core (L3)',
      'PropertyType': 'Core'
    },
    {
      'Estate': 'Southwark Estate',
      'Block': 'Wellington Block',
      'Core': 'Core C',
      'Property': 'Flat 301',
      'PropertyUPRN': 'FLT101',
      'Level': 'Flat (L4)',
      'PropertyType': 'Flat'
    }
  ]
}

export function convertSingleHierarchyColumn(
  csvData: any[],
  hierarchyColumnName: string,
  additionalColumns: string[] = []
): TreeNode[] {
  const treeNodes: TreeNode[] = []
  const nodeMap = new Map<string, TreeNode>()
  
  // Create unique ID generator
  let nodeIdCounter = 0
  const generateId = () => `node_${++nodeIdCounter}`

  csvData.forEach((row, rowIndex) => {
    const hierarchyValue = row[hierarchyColumnName]
    if (!hierarchyValue) return

    // For single hierarchy column, treat each unique value as a separate group
    const pathKey = String(hierarchyValue).trim()
    
    if (!nodeMap.has(pathKey)) {
      const nodeId = generateId()
      
      // Count how many rows have this hierarchy value
      const childCount = csvData.filter(r => r[hierarchyColumnName] === hierarchyValue).length
      
      const node: TreeNode = {
        id: nodeId,
        hierarchyPath: [pathKey],
        name: pathKey,
        level: `Level 1`,
        isLeaf: false,
        nodeType: 'group',
        childCount: childCount,
        [hierarchyColumnName]: hierarchyValue
      }

      // Add additional column data
      additionalColumns.forEach(col => {
        if (col !== hierarchyColumnName && row[col] !== undefined) {
          node[col] = row[col]
        }
      })

      nodeMap.set(pathKey, node)
      treeNodes.push(node)
    }
  })

  return Array.from(nodeMap.values())
}

export function convertUPRNToHierarchy(
  csvData: any[],
  uprnColumnName: string,
  additionalColumns: string[] = []
): TreeNode[] {
  const treeNodes: TreeNode[] = []
  const nodeMap = new Map<string, TreeNode>()
  
  // Create unique ID generator
  let nodeIdCounter = 0
  const generateId = () => `node_${++nodeIdCounter}`

  csvData.forEach((row, rowIndex) => {
    const uprnValue = row[uprnColumnName]
    const assessmentType = row['Assessment Type']
    const assessmentId = row['Assessment ID']
    
    if (!uprnValue) return

    // Parse UPRN like "CG-EST-BLKQ-C001" into hierarchy levels
    const parts = String(uprnValue).split('-').filter(part => part.trim())
    
    if (parts.length === 0) return

    // Create hierarchy: UPRN parts -> Assessment Type -> Individual Assessment Records
    const fullHierarchy = [...parts]
    
    // Add Assessment Type as next level if available
    if (assessmentType) {
      fullHierarchy.push(assessmentType)
    }
    
    // Add individual assessment record if Assessment ID is available
    if (assessmentId) {
      fullHierarchy.push(assessmentId)
    }

    // Create nodes for each level in the full hierarchy
    for (let level = 0; level < fullHierarchy.length; level++) {
      const currentPath = fullHierarchy.slice(0, level + 1)
      const pathKey = currentPath.join(' > ')
      
      if (!nodeMap.has(pathKey)) {
        const isLeaf = level === fullHierarchy.length - 1
        const nodeId = generateId()
        
        const node: TreeNode = {
          id: nodeId,
          hierarchyPath: currentPath,
          name: currentPath[currentPath.length - 1],
          level: `Level ${level + 1}`,
          isLeaf,
          nodeType: isLeaf ? 'leaf' : 'group',
          childCount: isLeaf ? 0 : undefined,
          originalUPRN: uprnValue
        }

        // For leaf nodes (individual assessment records), add all row data
        if (isLeaf && assessmentId) {
          additionalColumns.forEach(col => {
            if (row[col] !== undefined) {
              node[col] = row[col]
            }
          })
        }

        nodeMap.set(pathKey, node)
        treeNodes.push(node)
      }
    }
  })

  // Calculate child counts for group nodes
  const sortedNodes = Array.from(nodeMap.values()).sort((a, b) => 
    a.hierarchyPath.length - b.hierarchyPath.length
  )

  sortedNodes.forEach(node => {
    if (!node.isLeaf) {
      const childNodes = sortedNodes.filter(child => 
        child.hierarchyPath.length === node.hierarchyPath.length + 1 &&
        child.hierarchyPath.slice(0, node.hierarchyPath.length).join(' > ') === 
        node.hierarchyPath.join(' > ')
      )
      node.childCount = childNodes.length
    }
  })

  return Array.from(nodeMap.values())
}