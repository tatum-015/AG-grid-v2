<template>
  <div class="grid-config-modal">
    <div class="config-header">
      <h2>Choose Your Grid Configuration</h2>
      <p>Select how you want to display and organize your data</p>
    </div>
    
    <div class="config-options">
      <div 
        class="config-option"
        :class="{ selected: selectedMode === 'tree' }"
        @click="selectMode('tree')"
      >
        <div class="option-icon">
          <i class="pi pi-sitemap"></i>
        </div>
        <div class="option-content">
          <h3>Tree Hierarchy</h3>
          <p>Display data in a hierarchical tree structure with parent-child relationships</p>
          <ul class="option-features">
            <li>Multi-level hierarchical display</li>
            <li>Expand/collapse tree nodes</li>
            <li>Custom hierarchy column configuration</li>
            <li>Parent-child data relationships</li>
          </ul>
        </div>
        <div class="option-check">
          <i class="pi pi-check" v-if="selectedMode === 'tree'"></i>
        </div>
      </div>
      
      <div 
        class="config-option"
        :class="{ selected: selectedMode === 'grouping' }"
        @click="selectMode('grouping')"
      >
        <div class="option-icon">
          <i class="pi pi-list"></i>
        </div>
        <div class="option-content">
          <h3>Row Grouping</h3>
          <p>Group rows by column values with aggregated data display</p>
          <ul class="option-features">
            <li>Group by multiple columns</li>
            <li>Aggregate data within groups</li>
            <li>Expand/collapse groups</li>
            <li>Traditional data table layout</li>
          </ul>
        </div>
        <div class="option-check">
          <i class="pi pi-check" v-if="selectedMode === 'grouping'"></i>
        </div>
      </div>
    </div>
    
    <div class="config-actions">
      <Button 
        label="Back" 
        severity="secondary"
        class="riskhub-secondary-btn"
        @click="$emit('back')" 
      />
      <Button 
        label="Continue" 
        class="riskhub-primary-btn"
        @click="continueWithMode"
        :disabled="!selectedMode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'

interface Emits {
  (e: 'mode-selected', mode: 'tree' | 'grouping'): void
  (e: 'back'): void
}

const emit = defineEmits<Emits>()

const selectedMode = ref<'tree' | 'grouping' | null>(null)

function selectMode(mode: 'tree' | 'grouping') {
  selectedMode.value = mode
}

function continueWithMode() {
  if (selectedMode.value) {
    emit('mode-selected', selectedMode.value)
  }
}
</script>

<style scoped>
.grid-config-modal {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.config-header {
  text-align: center;
  margin-bottom: 1rem;
}

.config-header h2 {
  margin: 0 0 0.5rem 0;
  color: #202228;
  font-family: 'Archivo', sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
}

.config-header p {
  margin: 0;
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
}

.config-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.config-option {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  min-height: 280px;
}

.config-option:hover {
  border-color: #202228;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.config-option.selected {
  border-color: #202228;
  background: #f8f9fa;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 50%;
  margin: 0 auto;
  transition: all 0.2s ease;
}

.config-option.selected .option-icon {
  background: #202228;
  color: white;
}

.option-icon i {
  font-size: 1.5rem;
  color: #6b7280;
}

.config-option.selected .option-icon i {
  color: white;
}

.option-content {
  flex: 1;
  text-align: center;
}

.option-content h3 {
  margin: 0 0 0.75rem 0;
  color: #202228;
  font-family: 'Archivo', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
}

.option-content p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
}

.option-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-features li {
  color: #6b7280;
  font-size: 0.875rem;
  position: relative;
  padding-left: 1rem;
  text-align: left;
}

.option-features li:before {
  content: '•';
  color: #202228;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.option-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #202228;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.config-option.selected .option-check {
  opacity: 1;
}

.option-check i {
  color: white;
  font-size: 0.875rem;
}

.config-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* RiskHub Button Styles */
:deep(.riskhub-secondary-btn) {
  background: white !important;
  border: 1px solid #202228 !important;
  color: #202228 !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
  padding: 0.75rem 1.5rem !important;
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
  padding: 0.75rem 1.5rem !important;
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

@media (max-width: 768px) {
  .config-options {
    grid-template-columns: 1fr;
  }
  
  .grid-config-modal {
    padding: 1.5rem;
  }
  
  .config-option {
    min-height: auto;
    padding: 1.25rem;
  }
}
</style>