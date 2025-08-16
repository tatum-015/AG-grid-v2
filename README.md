# AG Grid v2 - CSV Data Visualization Platform

🚀 **Live Demo**: Ready for StackBlitz deployment!

## 🎯 Features

- **Multi-Column Status Chips**: Automatically detects and applies colored chips to status, assessment, and outcome columns
- **Intelligent Color Mapping**: RAG (Red-Amber-Green) status indicators with smart value detection
- **Tree Hierarchy & Row Grouping**: Flexible data visualization modes
- **CSV Upload & Processing**: Drag-and-drop CSV upload with automatic parsing
- **Professional UI**: Clean, responsive design with brand-consistent styling

## 🔧 Quick Start

1. **Upload CSV**: Click "Upload CSV" and drag/drop your file
2. **Auto-Detection**: Status columns automatically get colored chips
3. **Configure View**: Choose Tree or Grouping mode
4. **Explore Data**: Interactive grid with sorting, filtering, and selection

## 🎨 Auto-Detected Chip Columns

The system automatically applies colored chips to columns containing:

- **Status**: Any column with "status" in the name
- **Assessment Outcomes**: "Assessment Outcome", "Assessment Result", "Assessment Extent"
- **RAG States**: outcome, result, severity, priority, risk, rating, level, grade, condition, compliance, performance

## 🌈 Color Intelligence

- 🟢 **Green**: excellent, good, complete, passed, success, approved, active, low risk
- 🔴 **Red**: fail, poor, critical, error, denied, blocked, high risk, non-compliant
- 🟡 **Orange**: medium, pending, progress, warning, review, needs attention
- 🔵 **Blue**: info, draft, new, scheduled, low priority
- ⚪ **Gray**: Default for unrecognized values

## 📊 Sample Data

Try uploading a CSV with these column types:
- Status (e.g., "Complete", "Pending", "Failed")
- Assessment Outcome (e.g., "Pass", "Fail", "Partial")
- Risk Level (e.g., "High", "Medium", "Low")
- Priority (e.g., "Critical", "High", "Medium", "Low")

## 🛠️ Technology Stack

- **Vue 3** with Composition API and TypeScript
- **AG Grid Enterprise** for advanced data grid features
- **PrimeVue** for UI components
- **Pinia** for state management
- **PapaParse** for CSV processing
- **Vite** for build tooling

## 🎮 Interactive Features

- **Drag & Drop**: Easy CSV file upload
- **Multi-Select**: Checkbox selection with parent-child relationships
- **Filtering**: Column-based filtering and search
- **Sorting**: Click headers to sort data
- **Grouping**: Dynamic row grouping configuration
- **Tree View**: Hierarchical data display
- **Responsive**: Works on desktop and mobile

---

**Built with ❤️ using Vue 3 + AG Grid Enterprise**
