# AG Grid v2 - CSV Data Visualization Platform

## 📋 Project Overview

**AG Grid v2** is a sophisticated Vue 3 application that provides advanced CSV data visualization capabilities using AG Grid Enterprise. The application allows users to upload CSV files and display them with hierarchical tree structures, row grouping, and configurable status chips for enhanced data analysis.

### 🚀 Key Features

- **CSV File Upload & Processing**: Drag-and-drop CSV upload with PapaParse parsing
- **Hierarchical Tree Display**: Multi-level tree structures with expandable/collapsible nodes
- **Row Grouping**: Dynamic grouping functionality with AG Grid Enterprise
- **Status Chips**: Configurable colored chips for categorical data visualization
- **Responsive Design**: Professional UI with brand-consistent styling
- **Advanced Grid Features**: Sorting, filtering, column resizing, and selection

### 🏗️ Architecture

**Frontend Framework**: Vue 3 with Composition API and TypeScript
**Build Tool**: Vite with hot module replacement
**State Management**: Pinia store for reactive data management
**UI Components**: PrimeVue with custom brand styling
**Data Grid**: AG Grid Enterprise (v32.0.0) with full feature set
**Testing**: Playwright for E2E testing, Vitest for unit tests

---

## 🛠️ Technical Stack

### Core Dependencies
```json
{
  "vue": "^3.4.0",                    // Vue 3 framework
  "vue-router": "^4.2.5",             // Client-side routing
  "pinia": "^2.1.7",                  // State management
  "ag-grid-community": "^32.0.0",     // Base grid functionality
  "ag-grid-enterprise": "^32.0.0",    // Advanced grid features
  "ag-grid-vue3": "^32.0.0",          // Vue 3 AG Grid wrapper
  "primevue": "^3.50.0",              // UI component library
  "primeicons": "^6.0.1",             // Icon library
  "papaparse": "^5.4.1"               // CSV parsing library
}
```

### Development Dependencies
```json
{
  "typescript": "~5.3.0",             // Type safety
  "vite": "^5.0.0",                   // Build tool
  "eslint": "^8.57.0",                // Code linting
  "@playwright/test": "^1.40.0",      // E2E testing
  "vitest": "^1.0.0"                  // Unit testing
}
```

---

## 🎨 Brand Design System

The application follows a professional brand identity with consistent styling across all components.

### Color Palette
```css
/* Primary Brand Colors */
--brand-charcoal: #202228;     /* Primary text and CTA buttons */
--brand-gold: #957610;         /* Accent highlights */
--brand-off-white: #fefdfc;    /* Background and contrast text */
--brand-accent: #245dff;       /* Interactive elements */

/* Semantic Color Scales */
--slate-50 to --slate-950      /* Neutral grays */
--blue-50 to --blue-950        /* Blue variants */
--green-50 to --green-950      /* Success states */
```

### Typography
- **Primary Font**: Archivo (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Usage**: Professional, clean, highly readable

### Design Tokens
- **Spacing**: Consistent 8px grid system
- **Border Radius**: 4px, 8px, 12px, 16px, 20px, full
- **Shadows**: Subtle elevation with 4 levels
- **Animations**: 0.2s ease transitions

---

## 📁 Project Structure

```
ag-grid-v2/
├── src/
│   ├── components/
│   │   ├── ChipConfigModal.vue        # Status chip configuration
│   │   ├── ColumnMappingDialog.vue    # Column mapping interface
│   │   ├── CsvUploadModal.vue         # File upload dialog
│   │   ├── CsvUploader.vue            # Main upload component
│   │   ├── GridConfigModal.vue        # Grid configuration
│   │   ├── HierarchyConfigModal.vue   # Hierarchy setup
│   │   ├── RowGroupingModal.vue       # Row grouping configuration
│   │   ├── TreeDataGrid.vue           # Main grid component
│   │   └── WizardContainer.vue        # Multi-step wizard
│   ├── stores/
│   │   └── dataStore.ts               # Pinia state management
│   ├── utils/
│   │   └── csvToTreeConverter.ts      # Data transformation logic
│   ├── views/
│   │   └── HomeView.vue               # Main application view
│   ├── assets/
│   │   └── main.css                   # Global styles and brand system
│   ├── router/
│   │   └── index.ts                   # Vue Router configuration
│   └── main.ts                        # Application entry point
├── tests/                             # Playwright E2E tests
├── public/                            # Static assets
├── package.json                       # Dependencies and scripts
├── vite.config.ts                     # Vite configuration
└── tsconfig.json                      # TypeScript configuration
```

---

## 🔧 Installation & Setup

### Prerequisites
- **Node.js**: ^20.19.0 || >=22.12.0
- **npm**: Latest stable version

### Quick Start
```bash
# 1. Clone or extract the project
cd ag-grid-v2

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:5174
```

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production (includes type checking)
npm run preview      # Preview production build locally
npm run test:unit    # Run unit tests with Vitest
npm run test:e2e     # Run E2E tests with Playwright
npm run lint         # Lint and auto-fix code issues
npm run type-check   # TypeScript type checking only
```

---

## 📊 Core Components

### 1. TreeDataGrid.vue
**Purpose**: Main data grid component with AG Grid Enterprise integration
**Key Features**:
- Hierarchical tree display with expand/collapse
- Row grouping with dynamic configuration
- Status chip rendering in cells
- Advanced filtering and sorting
- Column resizing and reordering
- Row selection with multi-select support

**Props**:
- `gridMode`: 'tree' | 'grouping'
- Grid data from Pinia store

### 2. ChipConfigModal.vue ✨ **Recently Enhanced**
**Purpose**: Configure status chips for categorical data visualization
**Key Features**:
- Split-screen layout for improved UX
- Brand-consistent styling with Archivo font
- Column selection with radio buttons
- Color picker with predefined brand colors
- Real-time chip preview
- Responsive design for mobile
- Professional empty state

**Recent Improvements**:
- Redesigned from vertical scrolling to split-screen layout
- Applied brand colors and typography
- Compact color swatches instead of full buttons
- Improved space efficiency by 60%
- Enhanced visual hierarchy and user guidance

### 3. CsvUploadModal.vue
**Purpose**: Handle CSV file upload and initial processing
**Key Features**:
- Drag-and-drop file upload
- CSV format validation
- Preview of parsed data
- Column type detection
- Error handling and user feedback

### 4. HierarchyConfigModal.vue
**Purpose**: Configure hierarchical display settings
**Key Features**:
- Multi-level hierarchy definition
- Column mapping for tree structure
- Drag-and-drop column ordering
- Preview of hierarchy result

### 5. RowGroupingModal.vue
**Purpose**: Configure AG Grid Enterprise row grouping
**Key Features**:
- Dynamic grouping column selection
- Aggregation function configuration
- Group expansion controls
- Performance optimization settings

---

## 🗃️ State Management (Pinia Store)

### Data Store Interface
```typescript
interface DataStore {
  // Core Data
  csvData: any[]                    // Raw CSV data
  csvColumns: CsvColumn[]           // Column definitions
  hierarchyColumns: string[]        // Selected hierarchy columns
  treeData: TreeNode[]             // Transformed tree data
  
  // UI State
  selectedRows: string[]            // Selected row IDs
  isDataLoaded: boolean            // Data loading state
  gridMode: 'tree' | 'grouping'   // Current display mode
  
  // Feature Configuration
  chipColumnConfig: ChipColumnConfig  // Status chip settings
  rowGroupingColumns: string[]        // Grouping columns
}
```

### Key Store Methods
```typescript
// Data Management
setCsvData(data: any[], columns: CsvColumn[])
setHierarchyColumns(columns: string[])
setTreeData(data: TreeNode[])

// Configuration
setChipColumnConfig(config: ChipColumnConfig)
setGridMode(mode: GridMode)
setRowGroupingColumns(columns: string[])

// Utilities
clearData()                      // Reset all state
```

---

## 🎯 User Workflow

### 1. CSV Upload Process
1. User opens CSV Upload Modal
2. Drags/drops or selects CSV file
3. PapaParse processes file with header detection
4. Preview shows parsed data and detected columns
5. Data stored in Pinia store for application use

### 2. Hierarchy Configuration
1. User accesses Hierarchy Config Modal
2. Selects columns for multi-level hierarchy
3. Configures column order via drag-and-drop
4. Preview shows resulting tree structure
5. Tree data generated and stored

### 3. Status Chip Configuration ✨
1. User opens Configure Status Chips modal
2. **Left Panel**: Selects column for chip display
3. **Right Panel**: Configures colors for each unique value
4. Real-time preview shows chip appearance
5. Applies configuration to grid display

### 4. Grid Interaction
1. Data displays in AG Grid with configured features
2. Users can expand/collapse tree nodes
3. Apply filters and sorting
4. Select rows for further actions
5. Switch between tree and grouping modes

---

## 🧪 Testing Strategy

### E2E Testing (Playwright)
Located in `tests/` directory with comprehensive test coverage:

```bash
# Key Test Files
all-columns-visible-test.spec.ts    # Column visibility testing
basic-navigation.spec.ts            # Navigation and routing
chip-functionality.spec.ts          # Status chip features
column-display-test.spec.ts         # Grid column behavior
complete-chip-workflow.spec.ts      # Full chip configuration flow
csv-data-test.spec.ts              # CSV upload and processing
working-chip-test.spec.ts          # Chip rendering validation
```

### Test Execution
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test chip-functionality.spec.ts

# Run tests with browser UI (debugging)
npx playwright test --headed

# Generate test report
npx playwright show-report
```

---

## 🚀 Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Build Output
- Optimized JavaScript bundles with code splitting
- CSS with vendor prefixes and minification
- Static assets with cache-friendly naming
- Source maps for debugging (optional)

### Deployment Targets
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: AWS CloudFront, Azure CDN
- **Traditional Hosting**: Apache, Nginx

---

## ⚡ Performance Considerations

### Current Optimizations
- **Virtual Scrolling**: AG Grid handles large datasets efficiently
- **Code Splitting**: Dynamic imports for reduced initial bundle size
- **Tree Shaking**: Unused code elimination via Vite
- **Asset Optimization**: Image compression and lazy loading
- **CSS**: Scoped styles prevent global conflicts

### Scalability Features
- **Incremental Data Loading**: Supports pagination for large CSV files
- **Memory Management**: Proper cleanup of event listeners and watchers
- **State Efficiency**: Minimal re-renders with Vue 3 reactivity
- **AG Grid Performance**: Enterprise features optimized for large datasets

---

## 🐛 Troubleshooting

### Common Issues

**1. AG Grid Not Displaying**
```bash
# Check that AG Grid modules are properly registered
# Verify in main.ts: ModuleRegistry.registerModules([AllModules])
```

**2. CSV Upload Failures**
```bash
# Ensure file is valid CSV format
# Check console for PapaParse errors
# Verify file size limits
```

**3. Styling Issues**
```bash
# Check CSS import order in main.css
# Verify CSS custom properties are defined
# Check for conflicting PrimeVue themes
```

**4. TypeScript Errors**
```bash
# Run type checking
npm run type-check

# Fix common issues
npm run lint
```

### Debug Mode
```bash
# Enable Vue DevTools
# Open http://localhost:5174/__devtools__

# Check Pinia store state
# Monitor reactive data changes
# Inspect component props and events
```

---

## 🔮 Future Enhancements

### Planned Features
1. **Export Functionality**: PDF, Excel, and filtered CSV exports
2. **Advanced Filtering**: Date ranges, multi-select filters
3. **Custom Themes**: Dark mode and theme customization
4. **Data Validation**: Schema validation for uploaded CSV files
5. **Real-time Collaboration**: Multi-user editing capabilities
6. **Analytics Dashboard**: Usage metrics and data insights

### Technical Improvements
1. **Internationalization**: Multi-language support with Vue I18n
2. **Offline Support**: PWA capabilities with service workers
3. **Enhanced Testing**: Increased test coverage and visual regression tests
4. **Performance Monitoring**: Integration with performance analytics
5. **Accessibility**: WCAG 2.1 AA compliance improvements

---

## 👥 Development Team Handoff

### Key Knowledge Areas
1. **Vue 3 Composition API**: Understanding reactive data patterns
2. **AG Grid Enterprise**: Advanced grid features and configuration
3. **Pinia State Management**: Store patterns and best practices
4. **Brand Design System**: Color palette and typography standards
5. **TypeScript**: Interface definitions and type safety

### Development Workflow
1. **Branch Strategy**: Feature branches with PR reviews
2. **Code Standards**: ESLint configuration with auto-fixing
3. **Testing**: Write tests for new features before implementation
4. **Documentation**: Update this file for significant changes
5. **Performance**: Monitor bundle size and runtime performance

### Code Quality Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Component Design**: Single responsibility principle
- **Styling**: Scoped CSS with design token usage
- **Testing**: Minimum 80% test coverage for new features
- **Git Commits**: Conventional commit format

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- **Dependency Updates**: Monthly security and feature updates
- **Performance Monitoring**: Weekly bundle size and runtime checks
- **Browser Testing**: Cross-browser compatibility validation
- **Documentation**: Quarterly documentation review and updates

### Monitoring & Alerts
- **Build Status**: CI/CD pipeline monitoring
- **Error Tracking**: Production error monitoring
- **Performance Metrics**: Core Web Vitals tracking
- **User Feedback**: Feature request and bug report processing

---

**Last Updated**: August 15, 2025
**Version**: 2.0.0
**Maintainer**: Development Team
**License**: Private/Proprietary

---

## 📝 Recent Changes Log

### August 15, 2025 - v2.0.0
- ✨ **Major Enhancement**: ChipConfigModal redesigned with split-screen layout
- 🎨 **Brand Update**: Applied comprehensive brand design system
- 🔧 **UX Improvement**: Reduced modal vertical space usage by 60%
- 🎯 **Button Fix**: Changed primary CTA from blue to brand charcoal
- 📱 **Responsive**: Added mobile-responsive design for chip configuration
- 🧪 **Testing**: Updated E2E tests for new modal design

### Previous Versions
- v1.x.x: Initial implementation with basic CSV upload and tree display
- Legacy features migrated to current architecture