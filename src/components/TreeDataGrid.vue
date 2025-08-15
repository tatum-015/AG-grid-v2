<template>
  <div class="tree-data-grid">
    <div class="grid-header">
      <div class="header-left">
        <button v-if="showBackButton" @click="$emit('back')" class="back-button">
          <i class="pi pi-arrow-left"></i>
          Back to Configuration
        </button>
        <h2>{{ dataStore.gridMode === 'tree' ? 'Property Hierarchy' : 'Row Grouping' }}</h2>
      </div>
      <div class="grid-actions">
        <!-- Grid Mode Toggle (only show when data is loaded) -->
        <div v-if="dataStore.isDataLoaded" class="grid-mode-toggle">
          <button
            class="mode-toggle-btn"
            :class="{ active: dataStore.gridMode === 'tree' }"
            @click="switchGridMode('tree')"
            title="Tree Hierarchy Mode"
          >
            <i class="pi pi-sitemap"></i>
            Tree
          </button>
          <button
            class="mode-toggle-btn"
            :class="{ active: dataStore.gridMode === 'grouping' }"
            @click="switchGridMode('grouping')"
            title="Row Grouping Mode"
          >
            <i class="pi pi-list"></i>
            Grouping
          </button>
        </div>
        
        <Button
          label="Upload CSV"
          icon="pi pi-upload"
          size="small"
          class="riskhub-primary-btn"
          @click="showUploadModal = true"
        />
        <Button
          :label="dataStore.gridMode === 'tree' ? 'Configure Hierarchy' : 'Configure Grouping'"
          :icon="dataStore.gridMode === 'tree' ? 'pi pi-sitemap' : 'pi pi-list'"
          size="small"
          class="riskhub-secondary-btn"
          @click="showConfigModal"
          :disabled="!dataStore.isDataLoaded"
        />
        <Button
          label="Configure Chips"
          icon="pi pi-tag"
          size="small"
          class="riskhub-secondary-btn"
          @click="showChipModal = true"
          :disabled="!dataStore.isDataLoaded"
        />
        <Button
          v-if="selectedRowCount > 0"
          :label="`${selectedRowCount} selected`"
          icon="pi pi-check"
          class="riskhub-secondary-btn"
          size="small"
          @click="showSelectedNodes"
        />
        <Button
          label="Expand All"
          icon="pi pi-plus"
          size="small"
          class="riskhub-secondary-btn"
          @click="expandAll"
        />
        <Button
          label="Collapse All"
          icon="pi pi-minus"
          size="small"
          class="riskhub-secondary-btn"
          @click="collapseAll"
        />
        <Button
          label="Load Sample Data"
          icon="pi pi-database"
          size="small"
          class="riskhub-secondary-btn"
          @click="loadSampleData"
        />
        <Button
          label="Clear Data"
          icon="pi pi-trash"
          size="small"
          class="riskhub-secondary-btn"
          @click="clearData"
        />
      </div>
    </div>
    
    <div class="grid-wrapper">
      <div 
        ref="gridContainer" 
        class="ag-theme-alpine tree-grid-container"
        :class="{ 'loading': isGridLoading }"
      ></div>
      
      <!-- Loading overlay -->
      <div v-if="isGridLoading" class="grid-loading-overlay">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
      </div>
    </div>
    
    <!-- CSV Upload Modal -->
    <Dialog 
      v-model:visible="showUploadModal" 
      header="Upload New CSV File" 
      :modal="true" 
      :style="{ width: '500px' }"
      :closable="true"
    >
      <CsvUploadModal @file-uploaded="onFileUploaded" @close="showUploadModal = false" />
    </Dialog>
    
    <!-- Hierarchy Configuration Modal -->
    <Dialog 
      v-model:visible="showHierarchyModal" 
      header="Configure Tree Hierarchy" 
      :modal="true" 
      :style="{ width: '1200px', maxWidth: '90vw' }"
      :closable="true"
    >
      <HierarchyConfigModal 
        :columns="dataStore.csvColumns"
        :selectedColumns="dataStore.hierarchyColumns"
        @update:selectedColumns="updateHierarchyColumns"
        @close="showHierarchyModal = false"
      />
    </Dialog>
    
    <!-- Chip Configuration Modal -->
    <Dialog 
      v-model:visible="showChipModal" 
      header="Configure Status Chips" 
      :modal="true" 
      :style="{ width: '900px' }"
      :closable="true"
    >
      <ChipConfigModal 
        :columns="dataStore.csvColumns"
        :csvData="dataStore.csvData"
        :chipConfig="dataStore.chipColumnConfig"
        @update:chipConfig="updateChipConfig"
        @close="showChipModal = false"
      />
    </Dialog>
    
    <!-- Grid Configuration Modal -->
    <Dialog 
      v-model:visible="showGridConfigModal" 
      header="Grid Configuration" 
      :modal="true" 
      :style="{ width: '900px' }"
      :closable="true"
    >
      <GridConfigModal 
        @mode-selected="onModeSelected"
        @back="onGridConfigBack"
      />
    </Dialog>
    
    <!-- Row Grouping Configuration Modal -->
    <Dialog 
      v-model:visible="showRowGroupingModal" 
      header="Configure Row Grouping" 
      :modal="true" 
      :style="{ width: '1000px' }"
      :closable="true"
    >
      <RowGroupingModal 
        :columns="dataStore.csvColumns"
        :selectedColumns="dataStore.rowGroupingColumns"
        @update:selectedColumns="updateRowGroupingColumns"
        @close="showRowGroupingModal = false"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { createGrid } from 'ag-grid-community'
import type { GridApi, GridOptions } from 'ag-grid-community'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useDataStore } from '@/stores/dataStore'
import { convertCsvToTreeData, convertSingleHierarchyColumn, convertUPRNToHierarchy, getDataPath, generateSampleData } from '@/utils/csvToTreeConverter'
import CsvUploadModal from './CsvUploadModal.vue'
import HierarchyConfigModal from './HierarchyConfigModal.vue'
import ChipConfigModal from './ChipConfigModal.vue'
import GridConfigModal from './GridConfigModal.vue'
import RowGroupingModal from './RowGroupingModal.vue'

interface Props {
  showBackButton?: boolean
}

defineProps<Props>()
defineEmits<{
  back: []
}>()

const dataStore = useDataStore()
const gridContainer = ref<HTMLElement>()
let gridApi: GridApi | null = null

const selectedRowCount = computed(() => dataStore.selectedRows.length)
const showUploadModal = ref(false)
const showHierarchyModal = ref(false)
const showChipModal = ref(false)
const showGridConfigModal = ref(false)
const showRowGroupingModal = ref(false)
const isGridLoading = ref(false)

const gridOptions: GridOptions = {
  // Initial configuration - will be updated dynamically
  treeData: false,
  
  // Selection Configuration - Updated for AG Grid v32+
  rowSelection: {
    mode: 'multiRow',
    checkboxes: false, // Disable default checkboxes, we'll handle in group renderer
    enableClickSelection: false,
    groupSelects: 'descendants' // Parent selection includes all descendants
  },
  
  // Column Definitions - will be set dynamically
  columnDefs: [],
  
  // Grid Options
  animateRows: true,
  rowHeight: 40,
  headerHeight: 45,
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true
  },
  
  // Event Handlers
  onSelectionChanged: (event) => {
    const selectedNodes = event.api.getSelectedNodes()
    const selectedIds = selectedNodes.map(node => node.data?.id || node.data).filter(Boolean)
    dataStore.setSelectedRows(selectedIds)
  },
  
  onGridReady: (event) => {
    gridApi = event.api
    updateGridData()
  }
}

function updateGridData() {
  if (!gridApi || !dataStore.isDataLoaded) return
  
  isGridLoading.value = true
  
  console.log('Updating grid data...')
  console.log('Grid Mode:', dataStore.gridMode)
  console.log('CSV Data:', dataStore.csvData.slice(0, 3))
  
  try {
    if (dataStore.gridMode === 'tree') {
      // Only update if we have hierarchy columns configured
      if (dataStore.hierarchyColumns.length > 0) {
        updateTreeModeGrid()
      } else {
        console.log('No hierarchy columns configured - waiting for configuration')
        gridApi.setGridOption('rowData', [])
        gridApi.setGridOption('columnDefs', [])
      }
    } else if (dataStore.gridMode === 'grouping') {
      // Only update if we have row grouping columns configured
      if (dataStore.rowGroupingColumns.length > 0) {
        updateRowGroupingModeGrid()
      } else {
        console.log('No row grouping columns configured - waiting for configuration')
        gridApi.setGridOption('rowData', [])
        gridApi.setGridOption('columnDefs', [])
      }
    }
  } catch (error) {
    console.error('Error updating grid data:', error)
  } finally {
    // Add a small delay to ensure smooth UX
    setTimeout(() => {
      isGridLoading.value = false
    }, 100)
  }
}

function updateTreeModeGrid() {
  console.log('Updating tree mode grid...')
  console.log('Hierarchy Columns:', dataStore.hierarchyColumns)
  
  let treeData: any[] = []
  
  // Check if we have hierarchy columns selected
  if (dataStore.hierarchyColumns.length > 0) {
    // Use the multi-column hierarchy converter
    treeData = convertCsvToTreeData(dataStore.csvData, {
      hierarchyColumns: dataStore.hierarchyColumns,
      dataColumns: dataStore.csvColumns.map(col => col.key)
    })
  } else {
    // Check if there's a "Property Hierarchy" column or similar
    const hierarchyCol = dataStore.csvColumns.find(col => 
      col.key.toLowerCase().includes('hierarchy') || 
      col.key.toLowerCase().includes('property hierarchy')
    )
    
    if (hierarchyCol) {
      console.log('Using single hierarchy column:', hierarchyCol.key)
      treeData = convertSingleHierarchyColumn(
        dataStore.csvData, 
        hierarchyCol.key,
        dataStore.csvColumns.map(col => col.key)
      )
    } else {
      // Try to find UPRN column for hierarchical parsing
      const uprnCol = dataStore.csvColumns.find(col => 
        col.key.toLowerCase().includes('uprn') || 
        col.key.toLowerCase() === 'uprn' ||
        col.key === 'UPRN'
      )
      
      console.log('Available columns:', dataStore.csvColumns.map(c => c.key))
      console.log('Looking for UPRN column, found:', uprnCol?.key)
      
      if (uprnCol) {
        console.log('Using UPRN column as hierarchy:', uprnCol.key)
        treeData = convertUPRNToHierarchy(
          dataStore.csvData, 
          uprnCol.key,
          dataStore.csvColumns.map(col => col.key)
        )
      } else {
        // Fallback: group by first text column
        const firstTextCol = dataStore.csvColumns.find(col => col.type === 'text')
        if (firstTextCol) {
          console.log('Using first text column as hierarchy:', firstTextCol.key)
          treeData = convertSingleHierarchyColumn(
            dataStore.csvData, 
            firstTextCol.key,
            dataStore.csvColumns.map(col => col.key)
          )
        }
      }
    }
  }
  
  console.log('Generated tree data:', treeData.slice(0, 3))
  
  // Configure for tree data mode
  gridApi.setGridOption('treeData', true)
  gridApi.setGridOption('getDataPath', getDataPath)
  gridApi.setGridOption('groupDefaultExpanded', 1)
  gridApi.setGridOption('autoGroupColumnDef', {
    headerName: "Property Hierarchy",
    field: "name",
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      suppressCount: false,
      checkbox: true,
      innerRenderer: (params: any) => {
        if (params.data) {
          const node = params.data
          const count = node.childCount > 0 ? ` (${node.childCount})` : ''
          return `${node.name}${count}`
        }
        return ''
      }
    },
    width: 400
  })
  
  // Create dynamic column definitions based on available data
  const dynamicColumns = createTreeModeColumns()
  
  dataStore.setTreeData(treeData)
  gridApi.setGridOption('columnDefs', dynamicColumns)
  gridApi.setGridOption('rowData', treeData)
}

function updateRowGroupingModeGrid() {
  console.log('Updating row grouping mode grid...')
  console.log('Row Grouping Columns:', dataStore.rowGroupingColumns)
  
  // Clear existing configuration completely
  gridApi.setGridOption('rowData', [])
  gridApi.setGridOption('columnDefs', [])
  
  // Reset all tree data settings
  gridApi.setGridOption('treeData', false)
  gridApi.setGridOption('getDataPath', null)
  
  // Configure for row grouping mode
  gridApi.setGridOption('enableRowGroup', true)
  gridApi.setGridOption('groupDisplayType', 'singleColumn')
  gridApi.setGridOption('groupDefaultExpanded', 1)
  gridApi.setGridOption('autoGroupColumnDef', {
    headerName: "Grouped Values",
    field: "ag-Grid-AutoColumn",
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      suppressCount: false,
      checkbox: true,
      innerRenderer: (params: any) => {
        // For leaf nodes (actual data rows), show the original data value
        if (!params.node.group && params.data) {
          // Find the first grouped column to display its value
          const groupedCol = dataStore.rowGroupingColumns[0]
          if (groupedCol && params.data[groupedCol]) {
            return params.data[groupedCol]
          }
        }
        return params.value
      }
    },
    width: 300
  })
  
  // Create column definitions with row grouping
  const rowGroupColumns = createRowGroupingColumns()
  console.log('Setting column definitions for row grouping:', rowGroupColumns.length, 'columns')
  
  // Apply column definitions and data in sequence
  gridApi.setGridOption('columnDefs', rowGroupColumns)
  
  // Force a complete refresh after configuration
  setTimeout(() => {
    gridApi.setGridOption('rowData', dataStore.csvData)
    console.log('Row grouping mode grid updated with', dataStore.csvData.length, 'rows')
    
    // Force grid to refresh and apply grouping
    setTimeout(() => {
      gridApi.refreshCells()
      gridApi.onGroupExpandedOrCollapsed()
    }, 50)
  }, 150)
}

function createTreeModeColumns() {
  if (!dataStore.isDataLoaded) return []
  
  const columns: any[] = []
  
  // Checkbox is handled by autoGroupColumnDef - no separate column needed
  
  // Get all columns that should be displayed (exclude only hierarchy columns)
  const excludedColumns = [...dataStore.hierarchyColumns]
  
  const nonHierarchyColumns = dataStore.csvColumns.filter(col => 
    !excludedColumns.includes(col.key)
  )
  
  console.log('All CSV columns:', dataStore.csvColumns.map(c => c.key))
  console.log('Hierarchy columns (excluded):', excludedColumns)
  console.log('Columns to display:', nonHierarchyColumns.map(c => c.key))
  
  // Add ALL non-hierarchy columns dynamically
  nonHierarchyColumns.forEach(column => {
    const isLegacyChipColumn = dataStore.chipColumnConfig.enabled && 
                              dataStore.chipColumnConfig.columnKey === column.key
    const multiChipConfig = dataStore.getChipConfig(column.key)
    const isMultiChipColumn = multiChipConfig?.enabled
    
    columns.push({
      headerName: column.label,
      field: column.key,
      width: getColumnWidth(column.key),
      cellClass: (isLegacyChipColumn || isMultiChipColumn) ? 'chip-cell' : '',
      cellRenderer: (params: any) => {
        const value = params.data?.[column.key] || ''
        
        // Check multi-chip configuration first
        if (isMultiChipColumn && multiChipConfig) {
          const chipConfig = multiChipConfig.chips.find(chip => chip.value === value)
          if (chipConfig) {
            const chipElement = document.createElement('span')
            chipElement.textContent = value
            chipElement.style.cssText = `
              background-color: ${chipConfig.color}; 
              color: ${chipConfig.textColor}; 
              padding: 0.25rem 0.5rem; 
              border-radius: 12px; 
              font-size: 0.75rem; 
              font-weight: 500;
              display: inline-block;
              max-width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 1.2;
              vertical-align: middle;
              margin: 0 auto;
              text-align: center;
            `
            return chipElement
          }
        }
        // Fall back to legacy chip configuration
        else if (isLegacyChipColumn) {
          const chipConfig = dataStore.chipColumnConfig.chips.find(chip => chip.value === value)
          if (chipConfig) {
            const chipElement = document.createElement('span')
            chipElement.textContent = value
            chipElement.style.cssText = `
              background-color: ${chipConfig.color}; 
              color: ${chipConfig.textColor}; 
              padding: 0.25rem 0.5rem; 
              border-radius: 12px; 
              font-size: 0.75rem; 
              font-weight: 500;
              display: inline-block;
              max-width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 1.2;
              vertical-align: middle;
              margin: 0 auto;
              text-align: center;
            `
            return chipElement
          }
        }
        
        return value
      }
    })
  })
  
  return columns
}

function createRowGroupingColumns() {
  if (!dataStore.isDataLoaded) return []
  
  const columns: any[] = []
  
  console.log('Creating row grouping columns...')
  console.log('Grouping columns:', dataStore.rowGroupingColumns)
  
  // Add ALL CSV columns for row grouping mode
  dataStore.csvColumns.forEach(column => {
    const isGroupingColumn = dataStore.rowGroupingColumns.includes(column.key)
    const isLegacyChipColumn = dataStore.chipColumnConfig.enabled && 
                              dataStore.chipColumnConfig.columnKey === column.key
    const multiChipConfig = dataStore.getChipConfig(column.key)
    const isMultiChipColumn = multiChipConfig?.enabled
    
    console.log(`Column ${column.key}: isGrouping=${isGroupingColumn}`)
    
    const colDef: any = {
      headerName: column.label,
      field: column.key,
      width: getColumnWidth(column.key),
      cellClass: (isLegacyChipColumn || isMultiChipColumn) ? 'chip-cell' : '',
      sortable: true,
      filter: true,
      resizable: true
    }
    
    // Enable row grouping for selected columns
    if (isGroupingColumn) {
      colDef.rowGroup = true
      colDef.hide = true // Hide grouped columns from main display
    }
    
    // Add cell renderer for chips (multi-chip takes precedence)
    if (isMultiChipColumn && multiChipConfig) {
      colDef.cellRenderer = (params: any) => {
        const value = params.data?.[column.key] || ''
        const chipConfig = multiChipConfig.chips.find(chip => chip.value === value)
        if (chipConfig) {
          const chipElement = document.createElement('span')
          chipElement.textContent = value
          chipElement.style.cssText = `
            background-color: ${chipConfig.color}; 
            color: ${chipConfig.textColor}; 
            padding: 0.25rem 0.5rem; 
            border-radius: 12px; 
            font-size: 0.75rem; 
            font-weight: 500;
            display: inline-block;
            max-width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
            vertical-align: middle;
            margin: 0 auto;
            text-align: center;
          `
          return chipElement
        }
        return value
      }
    } else if (isLegacyChipColumn) {
      colDef.cellRenderer = (params: any) => {
        const value = params.data?.[column.key] || ''
        const chipConfig = dataStore.chipColumnConfig.chips.find(chip => chip.value === value)
        if (chipConfig) {
          const chipElement = document.createElement('span')
          chipElement.textContent = value
          chipElement.style.cssText = `
            background-color: ${chipConfig.color}; 
            color: ${chipConfig.textColor}; 
            padding: 0.25rem 0.5rem; 
            border-radius: 12px; 
            font-size: 0.75rem; 
            font-weight: 500;
            display: inline-block;
            max-width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
            vertical-align: middle;
            margin: 0 auto;
            text-align: center;
          `
          return chipElement
        }
        return value
      }
    }
    
    columns.push(colDef)
  })
  
  console.log('Created columns with row grouping:', columns.filter(col => col.rowGroup).map(col => col.field))
  
  return columns
}


function getColumnWidth(columnKey: string): number {
  // Dynamic width calculation based on column name patterns
  const widthMap: { [key: string]: number } = {
    'UPRN': 150,
    'Assessment ID': 150,
    'Assessment Type': 150,
    'Assessment Due Date': 120,
    'Assessment Date': 120,
    'Assessment Month': 120,
    'Assessment Quarter': 130,
    'Assessment Year': 100,
    'Service Provider': 120,
    'Assessor': 120,
    'Access Status': 140,
    'Property Type': 120,
    'Property Hierarchy': 150
  }
  
  // If exact match found, use it
  if (widthMap[columnKey]) {
    return widthMap[columnKey]
  }
  
  // Otherwise, calculate width based on content type and length
  if (columnKey.toLowerCase().includes('date')) {
    return 120
  }
  if (columnKey.toLowerCase().includes('id')) {
    return 150
  }
  if (columnKey.toLowerCase().includes('status')) {
    return 140
  }
  if (columnKey.toLowerCase().includes('type')) {
    return 120
  }
  
  // Default width based on column name length
  return Math.max(100, Math.min(200, columnKey.length * 10 + 80))
}

function expandAll() {
  if (gridApi) {
    gridApi.expandAll()
  }
}

function collapseAll() {
  if (gridApi) {
    gridApi.collapseAll()
  }
}

function showSelectedNodes() {
  if (gridApi) {
    const selectedNodes = gridApi.getSelectedNodes()
    console.log('Selected nodes:', selectedNodes.map(node => ({
      id: node.data?.id,
      name: node.data?.name,
      path: node.data?.hierarchyPath
    })))
  }
}

function loadSampleData() {
  const sampleData = generateSampleData()
  const sampleColumns = Object.keys(sampleData[0]).map(key => ({
    key,
    label: key,
    type: 'text'
  }))
  
  dataStore.setCsvData(sampleData, sampleColumns)
  dataStore.setHierarchyColumns(['Estate', 'Block', 'Core', 'Property'])
}

function clearData() {
  dataStore.clearData()
  if (gridApi) {
    gridApi.setGridOption('rowData', [])
  }
}

// debugCSV function removed as requested

function onFileUploaded(data: any, columns: any[], multiChipConfigs?: any) {
  console.log('File uploaded with', data.length, 'rows and', columns.length, 'columns')
  
  // Validate uploaded data
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error('Invalid or empty data uploaded')
    return
  }
  
  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    console.error('Invalid or missing column definitions')
    return
  }
  
  dataStore.setCsvData(data, columns)
  
  // Auto-apply multiple chip configurations if detected
  if (multiChipConfigs && Object.keys(multiChipConfigs).length > 0) {
    console.log('Auto-detected status columns:', Object.keys(multiChipConfigs))
    console.log('Auto-configured chip columns:', Object.keys(multiChipConfigs).length)
    dataStore.setMultiChipConfigs(multiChipConfigs)
    
    // Also set the first one as the legacy single chip config for backward compatibility
    const firstChipConfig = Object.values(multiChipConfigs)[0] as any
    if (firstChipConfig) {
      dataStore.setChipColumnConfig(firstChipConfig)
    }
  }
  
  showUploadModal.value = false
  
  // After CSV upload, show grid configuration choice modal
  showGridConfigModal.value = true
}

function updateHierarchyColumns(columns: string[]) {
  dataStore.setHierarchyColumns(columns)
  showHierarchyModal.value = false
}

function updateRowGroupingColumns(columns: string[]) {
  dataStore.setRowGroupingColumns(columns)
  showRowGroupingModal.value = false
}

function updateChipConfig(config: any) {
  dataStore.setChipColumnConfig(config)
  showChipModal.value = false
}

function onModeSelected(mode: 'tree' | 'grouping') {
  console.log('Grid mode selected:', mode)
  dataStore.setGridMode(mode)
  showGridConfigModal.value = false
  
  if (mode === 'tree') {
    // Show hierarchy configuration modal
    showHierarchyModal.value = true
  } else if (mode === 'grouping') {
    // Show row grouping configuration modal
    showRowGroupingModal.value = true
  }
}

function onGridConfigBack() {
  showGridConfigModal.value = false
  showUploadModal.value = true
}

function switchGridMode(mode: 'tree' | 'grouping') {
  console.log('Switching to grid mode:', mode)
  
  // Clear any current selection to avoid confusion when switching modes
  dataStore.setSelectedRows([])
  
  // Set the new grid mode
  dataStore.setGridMode(mode)
  
  // Always show configuration modal when switching modes
  if (mode === 'tree') {
    // Clear previous hierarchy configuration and show modal
    dataStore.setHierarchyColumns([])
    showHierarchyModal.value = true
  } else if (mode === 'grouping') {
    // Clear previous grouping configuration and show modal
    dataStore.setRowGroupingColumns([])
    showRowGroupingModal.value = true
  }
  
  console.log(`Switched to ${mode} mode - showing configuration modal`)
}

function showConfigModal() {
  if (dataStore.gridMode === 'tree') {
    showHierarchyModal.value = true
  } else if (dataStore.gridMode === 'grouping') {
    showRowGroupingModal.value = true
  }
}

// Watch for data changes
watch(() => [dataStore.csvData, dataStore.hierarchyColumns, dataStore.chipColumnConfig, dataStore.gridMode, dataStore.rowGroupingColumns], () => {
  updateGridData()
}, { deep: true })

onMounted(() => {
  if (gridContainer.value) {
    createGrid(gridContainer.value, gridOptions)
  }
  
  // Auto-open CSV upload modal if no data exists
  if (!dataStore.isDataLoaded) {
    showUploadModal.value = true
  }
})

onUnmounted(() => {
  if (gridApi) {
    gridApi.destroy()
  }
})
</script>

<style scoped>
.tree-data-grid {
  padding: 1.5rem;
  background: #202228;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.grid-header h2 {
  margin: 0;
  color: white;
}

.grid-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.grid-mode-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 2px;
  margin-right: 0.75rem;
}

.mode-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Archivo', sans-serif;
}

.mode-toggle-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.mode-toggle-btn.active {
  background: white;
  color: #202228;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mode-toggle-btn i {
  font-size: 0.875rem;
}

/* RiskHub Button Styles */
:deep(.riskhub-secondary-btn) {
  background: white !important;
  border: 1px solid #202228 !important;
  color: #202228 !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

:deep(.riskhub-secondary-btn:hover) {
  background: #f8f9fa !important;
  border-color: #202228 !important;
}

:deep(.riskhub-primary-btn) {
  background: #202228 !important;
  border: 1px solid #202228 !important;
  color: white !important;
  border-radius: 4px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
}

:deep(.riskhub-primary-btn:hover) {
  background: #404148 !important;
  border-color: #404148 !important;
}

.grid-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 0;
}

.tree-grid-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 100%;
  transition: opacity 0.2s ease;
}

.tree-grid-container.loading {
  opacity: 0.7;
}

.grid-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #202228;
}

/* AG Grid Theme with RiskHub Colors */
:deep(.ag-theme-alpine) {
  --ag-header-background-color: #f8f9fa;
  --ag-header-foreground-color: #202228;
  --ag-border-color: #e5e7eb;
  --ag-row-border-color: #f3f4f6;
  --ag-selected-row-background-color: rgba(32, 34, 40, 0.1);
  --ag-row-hover-color: rgba(32, 34, 40, 0.05);
  --ag-background-color: #ffffff;
  --ag-odd-row-background-color: #ffffff;
  --ag-even-row-background-color: #f9fafb;
  --ag-foreground-color: #202228;
  --ag-data-color: #202228;
  --ag-checkbox-checked-color: #202228;
  --ag-accent-color: #202228;
}

:deep(.ag-group-expanded) .ag-icon-tree-open,
:deep(.ag-group-contracted) .ag-icon-tree-closed {
  color: #202228;
}

:deep(.ag-group-title-bar) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
}

:deep(.ag-group-child-count) {
  color: #6c757d;
  font-weight: normal;
}

:deep(.ag-checkbox-input-wrapper) {
  color: #202228;
}

:deep(.ag-icon-checkbox-checked) {
  color: #202228;
}

/* Chip alignment in cells */
:deep(.ag-cell) {
  display: flex !important;
  align-items: center;
  padding: 4px 8px;
}

:deep(.ag-cell.chip-cell) {
  justify-content: center;
}

:deep(.ag-cell:not(.chip-cell)) {
  justify-content: flex-start;
}
</style>