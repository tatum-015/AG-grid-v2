import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CsvColumn {
  key: string
  label: string
  type: string
}

export interface TreeNode {
  id: string
  hierarchyPath: string[]
  [key: string]: any
}

export interface ChipConfig {
  value: string
  color: string
  textColor: string
}

export interface ChipColumnConfig {
  enabled: boolean
  columnKey: string
  chips: ChipConfig[]
}

export interface MultiChipConfig {
  [columnKey: string]: ChipColumnConfig
}

export type GridMode = 'tree' | 'grouping'

export const useDataStore = defineStore('data', () => {
  const csvData = ref<any[]>([])
  const csvColumns = ref<CsvColumn[]>([])
  const hierarchyColumns = ref<string[]>([])
  const treeData = ref<TreeNode[]>([])
  const selectedRows = ref<string[]>([])
  const isDataLoaded = ref(false)
  const chipColumnConfig = ref<ChipColumnConfig>({
    enabled: false,
    columnKey: '',
    chips: []
  })
  const multiChipConfigs = ref<MultiChipConfig>({})
  
  // Grid mode state
  const gridMode = ref<GridMode>('tree')
  const rowGroupingColumns = ref<string[]>([])

  function setCsvData(data: any[], columns: CsvColumn[]) {
    csvData.value = data
    csvColumns.value = columns
    isDataLoaded.value = true
  }

  function setHierarchyColumns(columns: string[]) {
    hierarchyColumns.value = columns
  }

  function setTreeData(data: TreeNode[]) {
    treeData.value = data
  }

  function setSelectedRows(rows: string[]) {
    selectedRows.value = rows
  }

  function setChipColumnConfig(config: ChipColumnConfig) {
    chipColumnConfig.value = config
  }

  function setMultiChipConfigs(configs: MultiChipConfig) {
    multiChipConfigs.value = configs
  }

  function addChipConfig(columnKey: string, config: ChipColumnConfig) {
    multiChipConfigs.value[columnKey] = config
  }

  function removeChipConfig(columnKey: string) {
    delete multiChipConfigs.value[columnKey]
  }

  function getChipConfig(columnKey: string): ChipColumnConfig | undefined {
    return multiChipConfigs.value[columnKey]
  }

  function setGridMode(mode: GridMode) {
    gridMode.value = mode
  }

  function setRowGroupingColumns(columns: string[]) {
    rowGroupingColumns.value = columns
  }

  function clearData() {
    csvData.value = []
    csvColumns.value = []
    hierarchyColumns.value = []
    treeData.value = []
    selectedRows.value = []
    isDataLoaded.value = false
    chipColumnConfig.value = {
      enabled: false,
      columnKey: '',
      chips: []
    }
    multiChipConfigs.value = {}
    gridMode.value = 'tree'
    rowGroupingColumns.value = []
  }

  return {
    csvData,
    csvColumns,
    hierarchyColumns,
    treeData,
    selectedRows,
    isDataLoaded,
    chipColumnConfig,
    multiChipConfigs,
    gridMode,
    rowGroupingColumns,
    setCsvData,
    setHierarchyColumns,
    setTreeData,
    setSelectedRows,
    setChipColumnConfig,
    setMultiChipConfigs,
    addChipConfig,
    removeChipConfig,
    getChipConfig,
    setGridMode,
    setRowGroupingColumns,
    clearData
  }
})