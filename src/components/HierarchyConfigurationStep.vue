<template>
  <div class="hierarchy-config">
    <div class="config-section">
      <div class="section-header">
        <i class="pi pi-sitemap"></i>
        <h3>Configure Tree Hierarchy</h3>
      </div>
      <p class="section-description">
        Select columns to define the tree hierarchy path. Drag to reorder the hierarchy levels.
      </p>
      
      <div class="columns-grid">
        <h4>Available Columns</h4>
        <div class="available-columns">
          <button
            v-for="column in availableColumns"
            :key="column.key"
            class="column-pill"
            :class="{ selected: isSelected(column.key) }"
            @click="toggleColumn(column.key)"
          >
            <i class="pi" :class="isSelected(column.key) ? 'pi-check' : 'pi-plus'"></i>
            {{ column.label }}
            <span class="column-type">({{ column.type }})</span>
          </button>
        </div>
      </div>
      
      <div v-if="hierarchyPath.length > 0" class="hierarchy-section">
        <h4>Tree Hierarchy Path</h4>
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
    
    <div class="action-section">
      <button 
        @click="clearAll" 
        class="clear-btn"
        :disabled="hierarchyPath.length === 0"
      >
        <i class="pi pi-trash"></i>
        Clear All
      </button>
      <button 
        @click="loadTreeData" 
        class="load-btn"
        :disabled="hierarchyPath.length === 0"
      >
        <i class="pi pi-check"></i>
        Load Tree Data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CsvColumn } from '@/stores/dataStore'

interface Props {
  columns: CsvColumn[]
  selectedColumns: string[]
}

interface Emits {
  (e: 'update:selectedColumns', columns: string[]): void
  (e: 'continue', columns: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const hierarchyPath = ref<string[]>([...props.selectedColumns])
const draggedIndex = ref<number | null>(null)

const availableColumns = computed(() => 
  props.columns.filter(col => col.type === 'text' || col.type === 'string')
)

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
  emit('update:selectedColumns', [...hierarchyPath.value])
}

function removeColumn(columnKey: string) {
  const index = hierarchyPath.value.indexOf(columnKey)
  if (index !== -1) {
    hierarchyPath.value.splice(index, 1)
    emit('update:selectedColumns', [...hierarchyPath.value])
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
  emit('update:selectedColumns', [...hierarchyPath.value])
}

function clearAll() {
  hierarchyPath.value = []
  emit('update:selectedColumns', [])
}

function loadTreeData() {
  emit('continue', [...hierarchyPath.value])
}
</script>

<style scoped>
.hierarchy-config {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 400px;
}

.config-section {
  flex: 1;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.section-header i {
  color: #4f46e5;
  font-size: 1.25rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.section-description {
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.columns-grid h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-weight: 600;
}

.available-columns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.column-pill {
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  color: #374151;
  padding: 0.75rem 1rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.column-pill:hover {
  border-color: #4f46e5;
  background: #eef2ff;
}

.column-pill.selected {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

.column-type {
  font-size: 0.75rem;
  opacity: 0.7;
  font-style: italic;
}

.hierarchy-section {
  margin-top: 2rem;
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
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-hierarchy i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-hierarchy p {
  margin: 0;
  font-style: italic;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.clear-btn {
  background: #6b7280;
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

.clear-btn:hover:not(:disabled) {
  background: #4b5563;
}

.clear-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.load-btn {
  background: #111827;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.load-btn:hover:not(:disabled) {
  background: #000000;
}

.load-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>