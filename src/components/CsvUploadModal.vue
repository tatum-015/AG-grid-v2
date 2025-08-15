<template>
  <div class="csv-upload-modal">
    <div class="upload-content">
      <div v-if="!selectedFile" class="file-selector">
        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          @change="onFileSelect"
          style="display: none"
        />
        <div class="upload-area" @drop="onDrop" @dragover.prevent @dragenter.prevent>
          <i class="pi pi-cloud-upload upload-icon"></i>
          <h4>Upload CSV File</h4>
          <p>Click to browse or drag and drop your CSV file here</p>
          <Button 
            label="Choose File" 
            icon="pi pi-upload" 
            class="riskhub-primary-btn"
            @click="fileInput?.click()"
          />
        </div>
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
        
        <div class="file-actions">
          <Button 
            label="Cancel" 
            class="riskhub-secondary-btn"
            @click="$emit('close')"
          />
          <Button 
            label="Upload & Process" 
            icon="pi pi-check" 
            class="riskhub-primary-btn"
            @click="processFile"
            :loading="processing"
          />
        </div>
      </div>
      
      <div v-if="uploadError" class="error-message">
        <i class="pi pi-exclamation-triangle"></i>
        {{ uploadError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Papa from 'papaparse'
import Button from 'primevue/button'
import type { CsvColumn, ChipColumnConfig, MultiChipConfig } from '@/stores/dataStore'

interface Emits {
  (e: 'file-uploaded', data: any[], columns: CsvColumn[], multiChipConfigs?: MultiChipConfig): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const selectedFile = ref<File | null>(null)
const uploadError = ref('')
const processing = ref(false)
const fileInput = ref<HTMLInputElement>()

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file && file.type === 'text/csv') {
    selectedFile.value = file
    uploadError.value = ''
  } else if (file && !file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
    uploadError.value = 'Please select a valid CSV file'
    target.value = '' // Clear the input
  } else if (file) {
    selectedFile.value = file
    uploadError.value = ''
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
    uploadError.value = ''
  }
}

function removeFile() {
  selectedFile.value = null
  uploadError.value = ''
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
  
  processing.value = true
  uploadError.value = ''
  
  Papa.parse(selectedFile.value, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      processing.value = false
      
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

      // Auto-detect status columns and create multiple chip configurations
      const multiChipConfigs = autoDetectStatusColumns(data, columns)
      
      emit('file-uploaded', data, columns, multiChipConfigs)
    },
    error: (error) => {
      processing.value = false
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

function autoDetectStatusColumns(data: any[], columns: CsvColumn[]): MultiChipConfig {
  const multiChipConfigs: MultiChipConfig = {}
  
  // Enhanced detection patterns for state-like columns
  const stateColumns = columns.filter(col => {
    const lowerKey = col.key.toLowerCase()
    const lowerLabel = col.label.toLowerCase()
    
    return (
      // Status columns
      lowerKey.includes('status') || lowerLabel.includes('status') ||
      // Assessment columns
      lowerKey.includes('assessment') && (lowerKey.includes('outcome') || lowerKey.includes('result') || lowerKey.includes('extent')) ||
      lowerLabel.includes('assessment') && (lowerLabel.includes('outcome') || lowerLabel.includes('result') || lowerLabel.includes('extent')) ||
      // RAG-like columns
      lowerKey.includes('outcome') || lowerLabel.includes('outcome') ||
      lowerKey.includes('result') || lowerLabel.includes('result') ||
      lowerKey.includes('extent') || lowerLabel.includes('extent') ||
      lowerKey.includes('severity') || lowerLabel.includes('severity') ||
      lowerKey.includes('priority') || lowerLabel.includes('priority') ||
      lowerKey.includes('risk') || lowerLabel.includes('risk') ||
      lowerKey.includes('rating') || lowerLabel.includes('rating') ||
      lowerKey.includes('level') || lowerLabel.includes('level') ||
      lowerKey.includes('grade') || lowerLabel.includes('grade') ||
      lowerKey.includes('condition') || lowerLabel.includes('condition') ||
      lowerKey.includes('compliance') || lowerLabel.includes('compliance') ||
      lowerKey.includes('performance') || lowerLabel.includes('performance')
    )
  })
  
  console.log('Auto-detected state columns:', stateColumns.map(c => c.key))
  
  stateColumns.forEach(column => {
    // Get unique values from the column
    const uniqueValues = [...new Set(
      data.map(row => row[column.key])
        .filter(val => val != null && val !== '')
        .map(val => String(val).trim())
    )].sort()
    
    if (uniqueValues.length === 0 || uniqueValues.length > 20) return // Skip if no values or too many values
    
    // Create chip configurations with intelligent color assignment
    const chips = uniqueValues.map(value => {
      const lowerValue = value.toLowerCase()
      let color = '#f3f4f6' // Default gray
      let textColor = '#374151'
      
      // Positive indicators - Green
      if (lowerValue.includes('excellent') || lowerValue.includes('high') ||
          lowerValue.includes('good') || lowerValue.includes('satisfactory') ||
          lowerValue.includes('complete') || lowerValue.includes('compliant') ||
          lowerValue.includes('passed') || lowerValue.includes('success') || 
          lowerValue.includes('approved') || lowerValue.includes('access') ||
          lowerValue.includes('active') || lowerValue.includes('open') ||
          lowerValue.includes('available') || lowerValue.includes('ready') ||
          lowerValue.includes('ok') || lowerValue === 'yes' ||
          lowerValue.includes('low risk') || lowerValue.includes('green') ||
          lowerValue === 'a' || lowerValue === '1' || lowerValue === 'pass') {
        color = '#c0f3dc'
        textColor = '#006739'
      }
      // Negative indicators - Red  
      else if (lowerValue.includes('fail') || lowerValue.includes('poor') ||
               lowerValue.includes('critical') || lowerValue.includes('severe') ||
               lowerValue.includes('error') || lowerValue.includes('reject') || 
               lowerValue.includes('denied') || lowerValue.includes('no access') ||
               lowerValue.includes('blocked') || lowerValue.includes('closed') ||
               lowerValue.includes('inactive') || lowerValue.includes('unavailable') ||
               lowerValue.includes('cancel') || lowerValue === 'no' ||
               lowerValue.includes('high risk') || lowerValue.includes('red') ||
               lowerValue.includes('non-compliant') || lowerValue.includes('breach') ||
               lowerValue === 'f' || lowerValue === '5' || lowerValue === 'fail') {
        color = '#ffd3d6'
        textColor = '#80272d'
      }
      // Warning/Medium indicators - Orange/Yellow
      else if (lowerValue.includes('medium') || lowerValue.includes('moderate') ||
               lowerValue.includes('pending') || lowerValue.includes('progress') || 
               lowerValue.includes('waiting') || lowerValue.includes('review') ||
               lowerValue.includes('partial') || lowerValue.includes('warning') ||
               lowerValue.includes('caution') || lowerValue.includes('amber') ||
               lowerValue.includes('yellow') || lowerValue.includes('advisory') ||
               lowerValue.includes('medium risk') || lowerValue.includes('needs attention') ||
               lowerValue === 'c' || lowerValue === '3') {
        color = '#ffe5b3'
        textColor = '#8b5500'
      }
      // Information/Low priority indicators - Blue
      else if (lowerValue.includes('info') || lowerValue.includes('informational') ||
               lowerValue.includes('draft') || lowerValue.includes('new') ||
               lowerValue.includes('scheduled') || lowerValue.includes('blue') ||
               lowerValue.includes('low') || lowerValue.includes('minor') ||
               lowerValue === 'b' || lowerValue === '2') {
        color = '#c5d5ff'
        textColor = '#122a80'
      }
      
      return {
        value,
        color,
        textColor
      }
    })
    
    multiChipConfigs[column.key] = {
      enabled: true,
      columnKey: column.key,
      chips
    }
  })
  
  return multiChipConfigs
}
</script>

<style scoped>
.csv-upload-modal {
  padding: 1rem;
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

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.upload-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.upload-area h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.25rem;
}

.upload-area p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
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
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  min-height: 80px;
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
  word-wrap: break-word;
  line-height: 1.4;
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

.file-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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
}
</style>