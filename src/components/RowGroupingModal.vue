<template>
  <div class="row-grouping-modal">
    <div class="config-content split-screen">
      <div class="section-description">
        <p>Select columns to group your data by. Multiple columns create nested groupings with the first column as the primary group.</p>
      </div>
      
      <!-- Left Panel: Available Columns -->
      <div class="left-panel">
        <div class="panel-header">
          <h4>Available Columns</h4>
          <p class="panel-subtitle">{{ availableColumns.length }} columns available</p>
        </div>
        <div class="available-columns-list">
          <button
            v-for="column in availableColumns"
            :key="column.key"
            class="column-item"
            :class="{ selected: isSelected(column.key) }"
            @click="toggleColumn(column.key)"
          >
            <div class="column-info">
              <div class="column-header">
                <i class="pi" :class="isSelected(column.key) ? 'pi-check' : 'pi-plus'"></i>
                <span class="column-name">{{ column.label }}</span>
              </div>
              <span class="column-type">{{ column.type }}</span>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Right Panel: Grouping Configuration -->
      <div class="right-panel">
        <div class="panel-header">
          <h4>Row Grouping Configuration</h4>
          <p class="panel-subtitle">{{ groupingColumns.length }} columns selected for grouping</p>
        </div>
        
        <div v-if="groupingColumns.length > 0" class="grouping-section">
          <div class="grouping-preview">
            <div class="preview-header">
              <i class="pi pi-list"></i>
              <span>Grouping Order</span>
            </div>
            <div class="grouping-path">
              <span v-for="(col, index) in groupingColumns" :key="col" class="grouping-segment">
                {{ getColumnLabel(col) }}
                <i v-if="index < groupingColumns.length - 1" class="pi pi-angle-right path-arrow"></i>
              </span>
            </div>
          </div>
        
          <div class="selected-columns">
            <div
              v-for="(columnKey, index) in groupingColumns"
              :key="columnKey"
              class="grouping-level"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent
              @drop="onDrop(index)"
            >
              <div class="level-indicator">
                <i class="pi pi-bars"></i>
                <span class="level-badge">Group {{ index + 1 }}</span>
              </div>
              <div class="level-content">
                <span class="level-name">{{ getColumnLabel(columnKey) }}</span>
              </div>
              <button @click="removeColumn(columnKey)" class="remove-level">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-grouping">
          <i class="pi pi-info-circle"></i>
          <p>Select at least one column to enable row grouping</p>
        </div>
      </div>
    </div>
    
    <div class="modal-actions">
      <Button 
        label="Clear All" 
        icon="pi pi-trash"
        class="riskhub-secondary-btn"
        @click="clearAll" 
        :disabled="groupingColumns.length === 0"
      />
      <div class="action-buttons">
        <Button 
          label="Cancel" 
          class="riskhub-secondary-btn"
          @click="$emit('close')" 
        />
        <Button 
          label="Apply Grouping" 
          icon="pi pi-check"
          class="riskhub-primary-btn"
          @click="applyChanges" 
          :disabled="groupingColumns.length === 0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import type { CsvColumn } from '@/stores/dataStore'

interface Props {
  columns: CsvColumn[]
  selectedColumns: string[]
}

interface Emits {
  (e: 'update:selectedColumns', columns: string[]): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const groupingColumns = ref<string[]>([...props.selectedColumns])
const draggedIndex = ref<number | null>(null)

const availableColumns = computed(() => {
  console.log('=== ROW GROUPING MODAL DEBUG ===')
  console.log('Props columns received:', props.columns.map(c => ({ key: c.key, type: c.type })))
  console.log('Total columns count:', props.columns.length)
  console.log('=== END ROW GROUPING DEBUG ===')
  
  // Allow ALL column types to be used for row grouping
  return props.columns
})

function isSelected(columnKey: string): boolean {
  return groupingColumns.value.includes(columnKey)
}

function toggleColumn(columnKey: string) {
  const index = groupingColumns.value.indexOf(columnKey)
  if (index === -1) {
    groupingColumns.value.push(columnKey)
  } else {
    groupingColumns.value.splice(index, 1)
  }
}

function removeColumn(columnKey: string) {
  const index = groupingColumns.value.indexOf(columnKey)
  if (index !== -1) {
    groupingColumns.value.splice(index, 1)
  }
}

function getColumnLabel(columnKey: string): string {
  const column = props.columns.find(col => col.key === columnKey)
  return column?.label || columnKey
}

function onDragStart(index: number) {
  draggedIndex.value = index
}

function onDrop(dropIndex: number) {
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) return
  
  const draggedItem = groupingColumns.value[draggedIndex.value]
  groupingColumns.value.splice(draggedIndex.value, 1)
  groupingColumns.value.splice(dropIndex, 0, draggedItem)
  
  draggedIndex.value = null
}

function clearAll() {
  groupingColumns.value = []
}

function applyChanges() {
  emit('update:selectedColumns', [...groupingColumns.value])
}
</script>

<style scoped>
.row-grouping-modal {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 500px;
}

.config-content {
  flex: 1;
}

.split-screen {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  grid-template-rows: auto 1fr;
}

.section-description {
  grid-column: 1 / -1;
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.section-description p {
  margin: 0;
}

/* Left Panel */
.left-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafbfc;
  overflow: hidden;
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.panel-header h4 {
  margin: 0 0 0.25rem 0;
  color: #202228;
  font-weight: 600;
  font-family: 'Archivo', sans-serif;
}

.panel-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.available-columns-list {
  flex: 1;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Right Panel */
.right-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafbfc;
  overflow: hidden;
}

/* Column Item Styles */
.column-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.column-item:hover {
  border-color: #202228;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.column-item.selected {
  background: #f0f9ff;
  border-color: #202228;
}

.column-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-name {
  font-weight: 500;
  color: #202228;
  font-family: 'Archivo', sans-serif;
}

.column-type {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
}

.grouping-section {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.grouping-preview {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #374151;
  font-weight: 600;
}

.grouping-path {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.grouping-segment {
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.path-arrow {
  color: #6b7280;
  margin: 0 0.25rem;
}

.selected-columns {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.grouping-level {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: move;
  transition: all 0.2s;
}

.grouping-level:hover {
  border-color: #4f46e5;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.level-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.level-indicator i {
  color: #6b7280;
  cursor: move;
}

.level-badge {
  background: #4f46e5;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.level-content {
  flex: 1;
}

.level-name {
  font-weight: 600;
  color: #111827;
}

.remove-level {
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

.remove-level:hover {
  background: #dc2626;
}

.empty-grouping {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  background: white;
  margin: 1rem;
}

.empty-grouping i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.empty-grouping p {
  margin: 0;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
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

:deep(.riskhub-primary-btn:disabled) {
  background: #9ca3af !important;
  border-color: #9ca3af !important;
  cursor: not-allowed !important;
}
</style>