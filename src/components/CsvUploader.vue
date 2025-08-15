<template>
  <div class="csv-uploader">
    <div class="upload-section">
      <h2>Upload CSV File</h2>
      <FileUpload
        ref="fileUpload"
        mode="basic"
        :auto="false"
        accept=".csv"
        :max-file-size="10000000"
        choose-label="Select CSV File"
        @select="onFileSelect"
        @clear="onClear"
        class="p-button-outlined"
      />
      
      <div v-if="uploadError" class="error-message">
        <Message severity="error" :closable="false">{{ uploadError }}</Message>
      </div>
      
      <div v-if="previewData.length > 0" class="preview-section">
        <h3>Preview Data (first 5 rows)</h3>
        <DataTable :value="previewData" class="preview-table">
          <Column 
            v-for="col in availableColumns" 
            :key="col.key"
            :field="col.key" 
            :header="col.label"
          />
        </DataTable>
        
        <Button 
          label="Configure Hierarchy"
          @click="showColumnMapping = true"
          class="configure-btn"
          :disabled="availableColumns.length === 0"
        />
      </div>
    </div>
    
    <ColumnMappingDialog
      v-model:visible="showColumnMapping"
      :columns="availableColumns"
      @confirm="onHierarchyConfigured"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileUpload from 'primevue/fileupload'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Papa from 'papaparse'
import { useDataStore, type CsvColumn } from '@/stores/dataStore'
import ColumnMappingDialog from './ColumnMappingDialog.vue'

const dataStore = useDataStore()

const fileUpload = ref()
const uploadError = ref('')
const previewData = ref<any[]>([])
const availableColumns = ref<CsvColumn[]>([])
const showColumnMapping = ref(false)

function onFileSelect(event: any) {
  const file = event.files[0]
  if (!file) return

  uploadError.value = ''

  Papa.parse(file, {
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

      availableColumns.value = columns
      previewData.value = data.slice(0, 5)
      dataStore.setCsvData(data, columns)
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

function onClear() {
  previewData.value = []
  availableColumns.value = []
  uploadError.value = ''
  dataStore.clearData()
}

function onHierarchyConfigured(hierarchyColumns: string[]) {
  dataStore.setHierarchyColumns(hierarchyColumns)
  showColumnMapping.value = false
}
</script>

<style scoped>
.csv-uploader {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.upload-section {
  margin-bottom: 2rem;
}

.upload-section h2 {
  margin-bottom: 1rem;
  color: #333;
}

.error-message {
  margin-top: 1rem;
}

.preview-section {
  margin-top: 2rem;
}

.preview-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.preview-table {
  margin-bottom: 1rem;
}

.configure-btn {
  margin-top: 1rem;
}

:deep(.p-fileupload-basic) {
  margin-bottom: 1rem;
}
</style>