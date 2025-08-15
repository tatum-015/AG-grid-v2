<template>
  <div class="hierarchy-config-modal">
    <div class="config-content split-screen">
      <div class="section-description">
        <p>Select and reorder columns to define the tree hierarchy path. Columns appear on the left, and your hierarchy order on the right.</p>
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
                <div class="column-left">
                  <i class="pi" :class="isSelected(column.key) ? 'pi-check' : 'pi-plus'"></i>
                  <span class="column-name">{{ column.label }}</span>
                </div>
                <span class="column-type">{{ column.type }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Right Panel: Hierarchy Path -->
      <div class="right-panel">
        <div class="panel-header">
          <h4>Tree Hierarchy Path</h4>
          <p class="panel-subtitle">{{ hierarchyPath.length }} levels configured</p>
        </div>
        
        <div v-if="hierarchyPath.length > 0" class="hierarchy-section">
          <div class="hierarchy-preview">
            <div class="path-display">
              <span v-for="(col, index) in hierarchyPath" :key="col" class="path-segment">
                {{ getColumnLabel(col) }}
                <i v-if="index < hierarchyPath.length - 1" class="pi pi-angle-right path-arrow"></i>
              </span>
            </div>
          </div>
        
          <div class="selected-columns">
            <div
              v-for="(columnKey, index) in hierarchyPath"
              :key="columnKey"
              class="hierarchy-level"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent
              @drop="onDrop(index)"
            >
              <div class="level-indicator">
                <i class="pi pi-bars"></i>
                <span class="level-badge">Level {{ index + 1 }}</span>
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
        
        <div v-else class="empty-hierarchy">
          <i class="pi pi-info-circle"></i>
          <p>Select at least one column to create a hierarchy</p>
        </div>
      </div>
    </div>
    
    <div class="modal-actions">
      <Button 
        label="Clear All" 
        icon="pi pi-trash"
        class="riskhub-secondary-btn"
        @click="clearAll" 
        :disabled="hierarchyPath.length === 0"
      />
      <div class="action-buttons">
        <Button 
          label="Cancel" 
          class="riskhub-secondary-btn"
          @click="$emit('close')" 
        />
        <Button 
          label="Apply Changes" 
          icon="pi pi-check"
          class="riskhub-primary-btn"
          @click="applyChanges" 
          :disabled="hierarchyPath.length === 0"
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

const hierarchyPath = ref<string[]>([...props.selectedColumns])
const draggedIndex = ref<number | null>(null)

const availableColumns = computed(() => {
  console.log('=== HIERARCHY MODAL DEBUG ===')
  console.log('Props columns received:', props.columns.map(c => ({ key: c.key, type: c.type })))
  console.log('Total columns count:', props.columns.length)
  console.log('=== END HIERARCHY DEBUG ===')
  
  // Allow ALL column types to be used for hierarchy
  return props.columns
})

function isSelected(columnKey: string): boolean {
  return hierarchyPath.value.includes(columnKey)
}

function toggleColumn(columnKey: string) {
  const index = hierarchyPath.value.indexOf(columnKey)
  if (index === -1) {
    hierarchyPath.value.push(columnKey)
  } else {
    hierarchyPath.value.splice(index, 1)
  }
}

function removeColumn(columnKey: string) {
  const index = hierarchyPath.value.indexOf(columnKey)
  if (index !== -1) {
    hierarchyPath.value.splice(index, 1)
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
  
  const draggedItem = hierarchyPath.value[draggedIndex.value]
  hierarchyPath.value.splice(draggedIndex.value, 1)
  hierarchyPath.value.splice(dropIndex, 0, draggedItem)
  
  draggedIndex.value = null
}

function clearAll() {
  hierarchyPath.value = []
}

function applyChanges() {
  emit('update:selectedColumns', [...hierarchyPath.value])
}
</script>

<style scoped>
.hierarchy-config-modal {
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
  justify-content: space-between;
  width: 100%;
}

.column-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-name {
  font-weight: 600;
  font-size: 15px;
  color: #202228;
  font-family: 'Archivo', sans-serif;
}

.column-type {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.hierarchy-section {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hierarchy-section h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-weight: 600;
}

.hierarchy-preview {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.path-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.path-segment {
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

.hierarchy-level {
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

.hierarchy-level:hover {
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

.empty-hierarchy {
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

.empty-hierarchy i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.empty-hierarchy p {
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