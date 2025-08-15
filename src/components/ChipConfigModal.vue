<template>
  <div class="chip-config-modal">
    <!-- Header -->
    <div class="modal-header">
      <h3 class="modal-title">Configure Status Chips</h3>
      <p class="modal-description">
        Select a column to display as colored chips and customize the appearance for each value.
      </p>
    </div>

    <!-- Split Screen Layout -->
    <div class="split-layout">
      <!-- Left Panel - Column Selection -->
      <div class="left-panel">
        <div class="panel-header">
          <h4>Select Column</h4>
        </div>
        <div class="column-selection-compact">
          <label class="column-option-compact">
            <input 
              type="radio" 
              name="chipColumn"
              value=""
              v-model="selectedColumnKey"
              @change="onColumnSelectionChange"
            />
            <span class="option-text">No chip column</span>
          </label>
          <div 
            v-for="column in availableColumns" 
            :key="column.key" 
            class="column-option-compact"
          >
            <label>
              <input 
                type="radio" 
                name="chipColumn"
                :value="column.key"
                v-model="selectedColumnKey"
                @change="onColumnSelectionChange"
              />
              <span class="option-text">{{ column.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Right Panel - Chip Configuration -->
      <div class="right-panel">
        <div v-if="!localConfig.enabled || !localConfig.columnKey" class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-palette"></i>
          </div>
          <h4>Select a Column</h4>
          <p>Choose a column from the left to configure chip colors and styling.</p>
        </div>
        
        <div v-else class="chip-configuration-compact">
          <div class="panel-header">
            <h4>Chip Colors</h4>
            <div class="values-badge">
              {{ uniqueValues.length }} values in "{{ getColumnLabel(localConfig.columnKey) }}"
            </div>
          </div>
          
          <div class="chip-configs-grid">
            <div 
              v-for="(chipConfig, index) in localConfig.chips" 
              :key="chipConfig.value"
              class="chip-config-card"
            >
              <div class="chip-header">
                <span class="chip-value-text">{{ chipConfig.value }}</span>
                <span 
                  class="chip-preview-pill"
                  :style="{
                    backgroundColor: chipConfig.color,
                    color: chipConfig.textColor
                  }"
                >
                  {{ chipConfig.value }}
                </span>
              </div>
              
              <div class="color-options-compact">
                <button
                  v-for="colorOption in colorOptions"
                  :key="colorOption.name"
                  class="color-swatch"
                  :class="{ 
                    active: chipConfig.color === colorOption.bg && chipConfig.textColor === colorOption.text 
                  }"
                  :style="{
                    backgroundColor: colorOption.bg,
                    borderColor: chipConfig.color === colorOption.bg ? colorOption.text : 'transparent'
                  }"
                  @click="updateChipColor(index, colorOption.bg, colorOption.text)"
                  :title="colorOption.name"
                >
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Actions Footer -->
    <div class="modal-actions">
      <Button 
        label="Reset" 
        icon="pi pi-refresh"
        severity="secondary"
        @click="resetConfig" 
        :disabled="!localConfig.enabled"
        class="reset-btn"
      />
      <div class="action-buttons">
        <Button 
          label="Cancel" 
          severity="secondary"
          @click="$emit('close')" 
          class="cancel-btn"
        />
        <Button 
          label="Apply Changes" 
          icon="pi pi-check"
          @click="applyChanges" 
          class="apply-btn"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Button from 'primevue/button'
import type { CsvColumn, ChipColumnConfig, ChipConfig } from '@/stores/dataStore'

interface Props {
  columns: CsvColumn[]
  csvData: any[]
  chipConfig: ChipColumnConfig
}

interface Emits {
  (e: 'update:chipConfig', config: ChipColumnConfig): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Color options based on the Figma design
const colorOptions = [
  { name: 'Green', bg: '#c0f3dc', text: '#006739' },      // Green light
  { name: 'Red', bg: '#ffd3d6', text: '#80272d' },        // Red light (missing color added)
  { name: 'Orange', bg: '#ffe5b3', text: '#8b5500' },     // Orange light
  { name: 'Yellow', bg: '#fff8cc', text: '#664e00' },     // Yellow light
  { name: 'Blue', bg: '#c5d5ff', text: '#122a80' },       // Blue light
  { name: 'Purple', bg: '#dbd6ff', text: '#362e80' },     // Purple light
  { name: 'Teal', bg: '#c0f2fd', text: '#00667c' },       // Teal light
  { name: 'Beige', bg: '#fef0e0', text: '#403931' },      // Beige light
  { name: 'Neutral', bg: '#f5f5f5', text: '#262626' },    // Neutral light
  { name: 'Slate', bg: '#f2f5f8', text: '#4c5258' }       // Slate light
]

const localConfig = ref<ChipColumnConfig>({
  enabled: props.chipConfig.enabled,
  columnKey: props.chipConfig.columnKey,
  chips: [...props.chipConfig.chips]
})

const selectedColumnKey = ref<string>(props.chipConfig.enabled ? props.chipConfig.columnKey : '')

const availableColumns = computed(() => 
  props.columns.filter(col => col.type === 'text' || col.type === 'string')
)

const uniqueValues = computed(() => {
  if (!localConfig.value.enabled || !localConfig.value.columnKey || !props.csvData.length) {
    return []
  }
  
  const values = props.csvData
    .map(row => row[localConfig.value.columnKey])
    .filter(val => val != null && val !== '')
    .map(val => String(val).trim())
  
  return [...new Set(values)].sort()
})

// Watch for unique values changes to update chip configs
watch(uniqueValues, (newValues) => {
  if (newValues.length > 0) {
    // Create chip configs for new values, preserve existing ones
    const existingChips = new Map(localConfig.value.chips.map(chip => [chip.value, chip]))
    
    localConfig.value.chips = newValues.map((value, index) => {
      if (existingChips.has(value)) {
        return existingChips.get(value)!
      }
      // Assign default colors cycling through available options
      const colorOption = colorOptions[index % colorOptions.length]
      return {
        value,
        color: colorOption.bg,
        textColor: colorOption.text
      }
    })
  }
}, { immediate: true })

function getColumnLabel(columnKey: string): string {
  const column = props.columns.find(col => col.key === columnKey)
  return column?.label || columnKey
}

function onColumnSelectionChange() {
  if (selectedColumnKey.value) {
    localConfig.value.enabled = true
    localConfig.value.columnKey = selectedColumnKey.value
  } else {
    localConfig.value.enabled = false
    localConfig.value.columnKey = ''
    localConfig.value.chips = []
  }
}

function updateChipColor(chipIndex: number, backgroundColor: string, textColor: string) {
  if (localConfig.value.chips[chipIndex]) {
    localConfig.value.chips[chipIndex].color = backgroundColor
    localConfig.value.chips[chipIndex].textColor = textColor
  }
}

function resetConfig() {
  selectedColumnKey.value = ''
  localConfig.value = {
    enabled: false,
    columnKey: '',
    chips: []
  }
  // Force reactivity update
  onColumnSelectionChange()
}

function applyChanges() {
  emit('update:chipConfig', { ...localConfig.value })
}
</script>

<style scoped>
/* Brand Design System CSS Variables */
.chip-config-modal {
  --brand-charcoal: #202228;
  --brand-gold: #957610;
  --brand-off-white: #fefdfc;
  --brand-accent: #245dff;
  --slate-50: #f8fafb;
  --slate-100: #f2f5f8;
  --slate-200: #e5ebf1;
  --slate-300: #d7e0e9;
  --slate-500: #bdccdb;
  --slate-800: #4c5258;
  --green-100: #c0f3dc;
  --green-800: #006739;
  --blue-100: #c5c5ff;
  --blue-800: #122a80;
  --text-primary: var(--brand-charcoal);
  --text-secondary: #636469;
  --text-muted: var(--slate-500);
  --bg-primary: var(--brand-off-white);
  --bg-secondary: var(--slate-50);
  --border-primary: var(--slate-200);
  --border-accent: var(--brand-accent);
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}

.chip-config-modal {
  font-family: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  height: 70vh;
  min-height: 500px;
  max-height: 800px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Header */
.modal-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-primary);
}

.modal-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Split Layout */
.split-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.left-panel {
  width: 300px;
  min-width: 300px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
}

.panel-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.values-badge {
  background: var(--blue-100);
  color: var(--blue-800);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

/* Left Panel - Column Selection */
.column-selection-compact {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.column-option-compact {
  display: block;
}

.column-option-compact label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.column-option-compact label:hover {
  border-color: var(--border-accent);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
}

.column-option-compact input[type="radio"] {
  margin: 0;
  accent-color: var(--brand-accent);
}

.column-option-compact input[type="radio"]:checked + .option-text {
  color: var(--brand-accent);
  font-weight: 500;
}

.option-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

/* Right Panel - Empty State */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-icon i {
  font-size: 3rem;
  color: var(--text-muted);
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-weight: 500;
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  max-width: 280px;
}

/* Right Panel - Chip Configuration */
.chip-configuration-compact {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chip-configs-grid {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chip-config-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1rem;
  transition: all 0.2s ease;
}

.chip-config-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--slate-300);
}

.chip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.chip-value-text {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.chip-preview-pill {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.color-options-compact {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.color-swatch.active {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 3px var(--brand-accent), var(--shadow-md);
}

/* Actions Footer */
.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-primary);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

/* Button Styling */
.reset-btn {
  background: var(--bg-secondary) !important;
  border-color: var(--border-primary) !important;
  color: var(--text-secondary) !important;
}

.cancel-btn {
  background: var(--bg-secondary) !important;
  border-color: var(--border-primary) !important;
  color: var(--text-primary) !important;
}

.apply-btn {
  background: var(--brand-charcoal) !important;
  border-color: var(--brand-charcoal) !important;
  color: var(--brand-off-white) !important;
  font-weight: 500;
}

.apply-btn:hover {
  background: var(--primary-600) !important;
  border-color: var(--primary-600) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .split-layout {
    flex-direction: column;
  }
  
  .left-panel {
    width: 100%;
    min-width: unset;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--border-primary);
  }
  
  .color-options-compact {
    grid-template-columns: repeat(10, 1fr);
  }
  
  .color-swatch {
    width: 24px;
    height: 24px;
  }
}
</style>