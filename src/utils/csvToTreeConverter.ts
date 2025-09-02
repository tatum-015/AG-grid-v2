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
    // Build hierarchy path from the selected columns, filtering out empty/null/"-" values
    const hierarchyPath = hierarchyColumns
      .map(col => row[col])
      .filter(val => val != null && val !== '' && val !== '-')
      .map(val => String(val).trim())

    if (hierarchyPath.length === 0) return

    // Create nodes for each level in the hierarchy, ending at the deepest level
    for (let level = 0; level < hierarchyPath.length; level++) {
      const currentPath = hierarchyPath.slice(0, level + 1)
      const pathKey = currentPath.join('|')
      const isLeaf = level === hierarchyPath.length - 1 // Last level is the actual data record
      
      if (!nodeMap.has(pathKey)) {
        const nodeId = generateId()
        
        // Each node contains ALL the data from the row
        const nodeData: any = {
          id: nodeId,
          name: currentPath[currentPath.length - 1],
          hierarchyPath: currentPath, // This is what getDataPath will return
          level: `Level ${level + 1}`,
          nodeType: isLeaf ? 'leaf' : 'group',
          isLeaf: isLeaf
        }
        
        // Add ALL data columns to every node - this makes parent nodes show data
        dataColumns.forEach(col => {
          if (row[col] !== undefined) {
            nodeData[col] = row[col]
          }
        })

        nodeMap.set(pathKey, nodeData)
        treeNodes.push(nodeData)
      } else if (!isLeaf) {
        // For non-leaf existing nodes, update with additional data if missing
        const existingNode = nodeMap.get(pathKey)
        dataColumns.forEach(col => {
          if (row[col] !== undefined && existingNode[col] === undefined) {
            existingNode[col] = row[col]
          }
        })
      }
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
      'PropertyUPRN': 'FLT101',
      'Assessment ID': 'ASM001',
      'Assessment Type': 'Fire Risk Assessment',
      'Assessment Status': 'Completed',
      'Risk Rating': 'Low',
      'Tenure': 'Council'
    },
    {
      'Estate': 'Southwark Estate',
      'Block': 'Nelson Block',
      'Core': 'Core A',
      'Property': 'Flat 102',
      'PropertyUPRN': 'FLT102',
      'Assessment ID': 'ASM002',
      'Assessment Type': 'Fire Risk Assessment',
      'Assessment Status': 'In Progress',
      'Risk Rating': 'Medium',
      'Tenure': 'Leasehold'
    },
    {
      'Estate': 'Southwark Estate',
      'Block': 'Nelson Block',
      'Core': 'Core B',
      'Property': 'Flat 201',
      'PropertyUPRN': 'FLT201',
      'Assessment ID': 'ASM003',
      'Assessment Type': 'Fire Risk Assessment',
      'Assessment Status': 'Completed',
      'Risk Rating': 'High',
      'Tenure': 'Council'
    },
    {
      'Estate': 'Southwark Estate',
      'Block': 'Wellington Block',
      'Core': 'Core C',
      'Property': 'Flat 301',
      'PropertyUPRN': 'FLT301',
      'Assessment ID': 'ASM004',
      'Assessment Type': 'Electrical Safety Check',
      'Assessment Status': 'Pending',
      'Risk Rating': 'Low',
      'Tenure': 'Leasehold'
    },
    {
      'Estate': 'Southwark Estate',
      'Block': 'Wellington Block',
      'Core': 'Core C',
      'Property': 'Flat 302',
      'PropertyUPRN': 'FLT302',
      'Assessment ID': 'ASM005',
      'Assessment Type': 'Electrical Safety Check',
      'Assessment Status': 'Completed',
      'Risk Rating': 'Medium',
      'Tenure': 'Council'
    },
    {
      'Estate': 'Camden Estate',
      'Block': 'Camden Block A',
      'Core': 'Core D',
      'Property': 'Flat 401',
      'PropertyUPRN': 'FLT401',
      'Assessment ID': 'ASM006',
      'Assessment Type': 'Gas Safety Check',
      'Assessment Status': 'Completed',
      'Risk Rating': 'Low',
      'Tenure': 'Council'
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
    if (!hierarchyValue || hierarchyValue === '-') return

    const hierarchyString = String(hierarchyValue).trim()
    
    // Create/update the group node - this IS the data record, not just a parent
    const groupPathKey = hierarchyString
    if (!nodeMap.has(groupPathKey)) {
      const nodeId = generateId()
      
      const groupNode: any = {
        id: nodeId,
        hierarchyPath: [hierarchyString], // Tree data path
        name: hierarchyString,
        level: `Level 1`,
        isLeaf: true, // This is now the actual data record
        nodeType: 'leaf',
        [hierarchyColumnName]: hierarchyValue
      }

      // Add all additional column data
      additionalColumns.forEach(col => {
        if (row[col] !== undefined) {
          groupNode[col] = row[col]
        }
      })

      nodeMap.set(groupPathKey, groupNode)
      treeNodes.push(groupNode)
    }
    // Note: We don't create separate leaf nodes anymore - the hierarchy level IS the data record
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
    
    if (!uprnValue || uprnValue === '-') return

    // Parse UPRN like "CG-EST-BLKQ-C001" into hierarchy levels
    const parts = String(uprnValue).split('-').filter(part => part.trim())
    
    if (parts.length === 0) return

    // Create nodes for each level in the UPRN hierarchy - each part is a level
    for (let level = 0; level < parts.length; level++) {
      const currentPath = parts.slice(0, level + 1)
      const pathKey = currentPath.join('|')
      const isLeaf = level === parts.length - 1 // Last level is the actual data record
      
      if (!nodeMap.has(pathKey)) {
        const nodeId = generateId()
        
        const node: any = {
          id: nodeId,
          hierarchyPath: currentPath, // Tree data path
          name: currentPath[currentPath.length - 1],
          level: `Level ${level + 1}`,
          isLeaf: isLeaf,
          nodeType: isLeaf ? 'leaf' : 'group',
          originalUPRN: uprnValue
        }

        // Add all additional column data to every node
        additionalColumns.forEach(col => {
          if (row[col] !== undefined) {
            node[col] = row[col]
          }
        })

        nodeMap.set(pathKey, node)
        treeNodes.push(node)
      } else if (!isLeaf) {
        // Update existing non-leaf node with additional data if missing
        const existingNode = nodeMap.get(pathKey)
        additionalColumns.forEach(col => {
          if (row[col] !== undefined && existingNode[col] === undefined) {
            existingNode[col] = row[col]
          }
        })
      }
    }
  })

  return Array.from(nodeMap.values())
}