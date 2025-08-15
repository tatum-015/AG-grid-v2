<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    header="Configure Hierarchy Columns"
    :style="{ width: '600px' }"
    :closable="true"
  >
    <div class="column-mapping">
      <p class="description">
        Select the columns that will form your hierarchy path. 
        Drag to reorder them from highest to lowest level.
      </p>
      
      <div class="available-columns">
        <h4>Available Columns</h4>
        <div class="column-list">
          <div
            v-for="column in availableColumns"
            :key="column.key"
            class="column-item available"
            :class="{ selected: selectedColumns.includes(column.key) }"
            @click="toggleColumn(column.key)"
          >
            <i class="pi pi-plus" v-if="!selectedColumns.includes(column.key)"></i>
            <i class="pi pi-check" v-else></i>
            <span>{{ column.label }}</span>
            <span class="column-type">({{ column.type }})</span>
          </div>
        </div>
      </div>
      
      <div class="hierarchy-columns" v-if="selectedColumns.length > 0">
        <h4>Hierarchy Path (drag to reorder)</h4>
        <div class="hierarchy-list">
          <div
            v-for="(columnKey, index) in selectedColumns"
            :key="columnKey"
            class="hierarchy-item"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragover.prevent
            @drop="onDrop(index)"
          >
            <i class="pi pi-bars drag-handle"></i>
            <span class="level-number">{{ index + 1 }}.</span>
            <span class="column-name">{{ getColumnLabel(columnKey) }}</span>
            <Button
              icon="pi pi-times"
              size="small"
              text
              @click="removeColumn(columnKey)"
              class="remove-btn"
            />
          </div>
        </div>
        
        <div class="hierarchy-preview">
          <h5>Preview Path Structure:</h5>
          <div class="path-preview">
            <span v-for="(columnKey, index) in selectedColumns" :key="columnKey">
              <strong>{{ getColumnLabel(columnKey) }}</strong>
              <i v-if="index < selectedColumns.length - 1" class="pi pi-angle-right path-separator"></i>
            </span>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <p>Select at least one column to create a hierarchy</p>
      </div>
    </div>
    
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        @click="cancel"
        class="p-button-text"
      />
      <Button
        label="Apply Hierarchy"
        icon="pi pi-check"
        @click="confirm"
        :disabled="selectedColumns.length === 0"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import type { CsvColumn } from '@/stores/dataStore'

interface Props {
  visible: boolean
  columns: CsvColumn[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', hierarchyColumns: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedColumns = ref<string[]>([])
const draggedIndex = ref<number | null>(null)

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const availableColumns = computed(() => 
  props.columns.filter(col => col.type === 'text' || col.type === 'string')
)

watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    selectedColumns.value = []
  }
})

function toggleColumn(columnKey: string) {
  const index = selectedColumns.value.indexOf(columnKey)
  if (index === -1) {
    selectedColumns.value.push(columnKey)
  } else {
    selectedColumns.value.splice(index, 1)
  }
}

function removeColumn(columnKey: string) {
  const index = selectedColumns.value.indexOf(columnKey)
  if (index !== -1) {
    selectedColumns.value.splice(index, 1)
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
  
  const draggedItem = selectedColumns.value[draggedIndex.value]
  selectedColumns.value.splice(draggedIndex.value, 1)
  selectedColumns.value.splice(dropIndex, 0, draggedItem)
  
  draggedIndex.value = null
}

function confirm() {
  emit('confirm', [...selectedColumns.value])
}

function cancel() {
  isVisible.value = false
}
</script>

<style scoped>
.column-mapping {
  min-height: 400px;
}

.description {
  margin-bottom: 1.5rem;
  color: #666;
  line-height: 1.5;
}

.available-columns, .hierarchy-columns {
  margin-bottom: 1.5rem;
}

.available-columns h4, .hierarchy-columns h4 {
  margin-bottom: 0.75rem;
  color: #333;
}

.column-list, .hierarchy-list {
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  min-height: 120px;
  padding: 0.5rem;
}

.column-item, .hierarchy-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin: 0.25rem 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.column-item.available {
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
}

.column-item.available:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.column-item.available.selected {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

.hierarchy-item {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  cursor: move;
}

.hierarchy-item:hover {
  background: #e0f2fe;
}

.column-item i {
  margin-right: 0.5rem;
  color: #6c757d;
}

.column-item.selected i {
  color: #2196f3;
}

.column-type {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
  font-style: italic;
}

.drag-handle {
  margin-right: 0.75rem;
  color: #6c757d;
  cursor: move;
}

.level-number {
  margin-right: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.column-name {
  flex: 1;
  font-weight: 500;
}

.remove-btn {
  margin-left: 0.5rem;
}

.hierarchy-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.hierarchy-preview h5 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.path-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.path-separator {
  color: #6c757d;
  margin: 0 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-state p {
  margin: 0;
  font-style: italic;
}
</style>