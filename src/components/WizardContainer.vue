<template>
  <div class="wizard-container" data-testid="wizard-container">
    <!-- Step 1: Upload CSV File -->
    <div v-if="currentStep === 1" class="wizard-step">
      <div class="wizard-overlay">
        <div class="wizard-card">
          <div class="wizard-header">
            <h1>Step 1: Upload CSV File</h1>
            <p>Upload your CSV file to create a hierarchical tree visualization</p>
          </div>
          
          <div class="wizard-content">
            <div class="upload-section">
              <h3>CSV File Upload</h3>
              
              <div v-if="!selectedFile" class="file-selector">
                <input
                  ref="fileInput"
                  type="file"
                  accept=".csv"
                  @change="onFileSelect"
                  style="display: none"
                />
                <button @click="fileInput?.click()" class="choose-file-btn">
                  <i class="pi pi-plus"></i>
                  Choose CSV File
                </button>
                <span class="file-status">No file chosen</span>
              </div>
              
              <div v-else class="file-selected">
                <div class="file-info">
                  <div class="file-icon">
                    <i class="pi pi-file"></i>
                  </div>
                  <div class="file-details">
                    <div class="file-name">{{ selectedFile.name }}</div>
                    <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
                  </div>
                  <button @click="removeFile" class="remove-file">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
                
                <button @click="processFile" class="continue-btn">
                  Continue
                  <i class="pi pi-arrow-right"></i>
                </button>
              </div>
            </div>
            
            <div v-if="uploadError" class="error-message">
              <i class="pi pi-exclamation-triangle"></i>
              {{ uploadError }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Step 2: Configure Data Display -->
    <div v-if="currentStep === 2" class="wizard-step">
      <div class="wizard-overlay">
        <div class="wizard-card wide">
          <div class="wizard-header">
            <button @click="goToStep(1)" class="back-btn">
              <i class="pi pi-arrow-left"></i>
            </button>
            <div class="header-content">
              <h1>Step 2: Configure Data Display</h1>
              <p>Select columns to display in your data grid</p>
            </div>
          </div>
          
          <div class="wizard-content">
            <HierarchyConfigurationStep
              :columns="csvColumns"
              :selectedColumns="selectedHierarchyColumns"
              @update:selectedColumns="updateHierarchyColumns"
              @continue="goToGrid"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Step 3: Data Grid Display -->
    <div v-if="currentStep === 3" class="grid-step">
      <TreeDataGrid :showBackButton="true" @back="goToStep(2)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Papa from 'papaparse'
import { useDataStore, type CsvColumn } from '@/stores/dataStore'
import TreeDataGrid from './TreeDataGrid.vue'
import HierarchyConfigurationStep from './HierarchyConfigurationStep.vue'

const dataStore = useDataStore()

const currentStep = ref(1)
const selectedFile = ref<File | null>(null)
const uploadError = ref('')
const csvColumns = ref<CsvColumn[]>([])
const selectedHierarchyColumns = ref<string[]>([])
const fileInput = ref<HTMLInputElement>()

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    selectedFile.value = file
    uploadError.value = ''
  }
}

function removeFile() {
  selectedFile.value = null
  uploadError.value = ''
  dataStore.clearData()
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function processFile() {
  if (!selectedFile.value) return
  
  uploadError.value = ''
  
  Papa.parse(selectedFile.value, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length > 0) {
        uploadError.value = `CSV parsing error: ${results.errors[0].message}`
        return
      }

      const data = results.data as any[]
      if (data.length === 0) {
        uploadError.value = 'CSV file is empty'
        return
      }

      // Extract columns from first row
      const firstRow = data[0]
      const columns: CsvColumn[] = Object.keys(firstRow).map(key => ({
        key,
        label: key,
        type: inferColumnType(data, key)
      }))

      csvColumns.value = columns
      dataStore.setCsvData(data, columns)
      
      // Move to step 2
      currentStep.value = 2
    },
    error: (error) => {
      uploadError.value = `File read error: ${error.message}`
    }
  })
}

function inferColumnType(data: any[], columnKey: string): string {
  const sample = data.slice(0, 10).map(row => row[columnKey]).filter(val => val != null && val !== '')
  
  if (sample.length === 0) return 'text'
  
  const allNumbers = sample.every(val => !isNaN(Number(val)))
  if (allNumbers) return 'number'
  
  const allDates = sample.every(val => !isNaN(Date.parse(val)))
  if (allDates) return 'date'
  
  return 'text'
}

function updateHierarchyColumns(columns: string[]) {
  selectedHierarchyColumns.value = columns
}

function goToStep(step: number) {
  currentStep.value = step
}

function goToGrid(hierarchyColumns: string[]) {
  dataStore.setHierarchyColumns(hierarchyColumns)
  currentStep.value = 3
}
</script>

<style scoped>
.wizard-container {
  min-height: 100vh;
  position: relative;
}

.wizard-step {
  min-height: 100vh;
  position: relative;
}

.wizard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.wizard-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.wizard-card.wide {
  max-width: 1000px;
}

.wizard-header {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px 16px 0 0;
  text-align: center;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.header-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.wizard-content {
  padding: 2rem;
}

.upload-section h3 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.2rem;
  font-weight: 600;
}

.file-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.choose-file-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.choose-file-btn:hover {
  background: #059669;
}

.file-status {
  color: #6b7280;
  font-style: italic;
}

.file-selected {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.file-icon {
  background: #e0e7ff;
  color: #4338ca;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.file-size {
  color: #6b7280;
  font-size: 0.875rem;
}

.remove-file {
  background: #ef4444;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-file:hover {
  background: #dc2626;
}

.continue-btn {
  background: #111827;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-end;
  transition: background-color 0.2s;
}

.continue-btn:hover {
  background: #000000;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.grid-step {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>