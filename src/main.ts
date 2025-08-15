import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

// PrimeVue imports
import PrimeVue from 'primevue/config'

// AG-Grid imports
import { ModuleRegistry } from 'ag-grid-community'
import { ClientSideRowModelModule } from 'ag-grid-community'
import { LicenseManager } from 'ag-grid-enterprise'
import { RowGroupingModule } from 'ag-grid-enterprise'
import { MenuModule } from 'ag-grid-enterprise'
import { ColumnsToolPanelModule } from 'ag-grid-enterprise'

// Set AG-Grid Enterprise license
// LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY)

// Register AG-Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowGroupingModule,
  MenuModule,
  ColumnsToolPanelModule
])

const app = createApp(App)

// Configure PrimeVue
app.use(PrimeVue)

app.use(createPinia())
app.use(router)

app.mount('#app')