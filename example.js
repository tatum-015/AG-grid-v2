import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Initial JSON for Row Grouping
const INITIAL_GROUPING_JSON = `[
  {
    "system": "Lifts",
    "systemSubCategory": "Fireman (BS 2655-1)",
    "component": "Control switch",
    "location": "Ground floor",
    "category": "Firefighting lift",
    "uprn": "81264TA"
  },
  {
    "system": "Lifts",
    "systemSubCategory": "Fireman (BS 2655-1)",
    "component": "Lift car",
    "location": "Ground floor",
    "category": "Firefighting lift",
    "uprn": "81264TA"
  },
  {
    "system": "Lifts",
    "systemSubCategory": "Fireman (BS 2655-1)",
    "component": "Landing doors",
    "location": "Ground floor",
    "category": "Firefighting lift",
    "uprn": "81264TA"
  }
]`;

// Initial JSON for Tree Data with Data Paths
const INITIAL_TREE_DATA_PATHS_JSON = `[
  {
    "path": ["Lifts"],
    "name": "Lifts",
    "type": "System"
  },
  {
    "path": ["Lifts", "Fireman (BS 2655-1)"],
    "name": "Fireman (BS 2655-1)",
    "type": "Sub Category"
  },
  {
    "path": ["Lifts", "Fireman (BS 2655-1)", "Control switch"],
    "name": "Control switch",
    "location": "Ground floor",
    "category": "Firefighting lift",
    "uprn": "81264TA",
    "type": "Component"
  },
  {
    "path": ["Lifts", "Fireman (BS 2655-1)", "Lift car"],
    "name": "Lift car",
    "location": "Ground floor",
    "category": "Firefighting lift",
    "uprn": "81264TA",
    "type": "Component"
  },
  {
    "path": ["Lifts", "Fireman (BS 2655-1)", "Landing doors"],
    "name": "Landing doors",
    "location": "Ground floor",
    "category": "Firefighting lift",
    "uprn": "81264TA",
    "type": "Component"
  }
]`;

// Initial JSON for Tree Data with Nested Records
const INITIAL_TREE_DATA_NESTED_JSON = `[
  {
    "name": "Lifts",
    "type": "System",
    "children": [
      {
        "name": "Fireman (BS 2655-1)",
        "type": "Sub Category",
        "children": [
          {
            "name": "Control switch",
            "location": "Ground floor",
            "category": "Firefighting lift",
            "uprn": "81264TA",
            "type": "Component"
          },
          {
            "name": "Lift car",
            "location": "Ground floor",
            "category": "Firefighting lift",
            "uprn": "81264TA",
            "type": "Component"
          },
          {
            "name": "Landing doors",
            "location": "Ground floor",
            "category": "Firefighting lift",
            "uprn": "81264TA",
            "type": "Component"
          }
        ]
      }
    ]
  }
]`;

// Property Hierarchy Data - Tree Data with Data Paths
const PROPERTY_HIERARCHY_TREE_PATHS_JSON = `[
  {
    "path": ["Southwark Estate"],
    "name": "Southwark Estate",
    "propertyUPRN": "EST001",
    "level": "Estate (L1)",
    "propertyType": "Estate"
  },
  {
    "path": ["Southwark Estate", "Nelson Block"],
    "name": "Nelson Block",
    "propertyUPRN": "BLK001",
    "parentUPRN": "EST001",
    "level": "Block (L2)",
    "buildingName": "Nelson Block",
    "propertyType": "Block"
  },
  {
    "path": ["Southwark Estate", "Nelson Block", "Core A"],
    "name": "Core A",
    "propertyUPRN": "COR001",
    "parentUPRN": "BLK001",
    "level": "Core (L3)",
    "propertyType": "Core"
  },
  {
    "path": ["Southwark Estate", "Nelson Block", "Core A", "Flat 101"],
    "name": "Flat 101",
    "propertyUPRN": "FLT101",
    "parentUPRN": "COR001",
    "level": "Flat (L4)",
    "streetNumber": "101",
    "street": "Nelson Way",
    "postcode": "SE1 0XX",
    "town": "Southwark",
    "city": "London",
    "riskRating": "Low",
    "tenure": "Council",
    "propertyType": "Flat"
  },
  {
    "path": ["Southwark Estate", "Nelson Block", "Core A", "Flat 102"],
    "name": "Flat 102",
    "propertyUPRN": "FLT102",
    "parentUPRN": "COR001",
    "level": "Flat (L4)",
    "streetNumber": "102",
    "street": "Nelson Way",
    "postcode": "SE1 0XX",
    "town": "Southwark",
    "city": "London",
    "riskRating": "Medium",
    "tenure": "Leasehold",
    "propertyType": "Flat"
  },
  {
    "path": ["Southwark Estate", "Wellington Block"],
    "name": "Wellington Block",
    "propertyUPRN": "BLK002",
    "parentUPRN": "EST001",
    "level": "Block (L2)",
    "buildingName": "Wellington Block",
    "propertyType": "Block"
  },
  {
    "path": ["Southwark Estate", "Wellington Block", "Core B"],
    "name": "Core B",
    "propertyUPRN": "COR002",
    "parentUPRN": "BLK002",
    "level": "Core (L3)",
    "propertyType": "Core"
  },
  {
    "path": ["Southwark Estate", "Wellington Block", "Core B", "Flat 201"],
    "name": "Flat 201",
    "propertyUPRN": "FLT201",
    "parentUPRN": "COR002",
    "level": "Flat (L4)",
    "streetNumber": "201",
    "street": "Wellington Avenue",
    "postcode": "SE1 0XY",
    "town": "Southwark",
    "city": "London",
    "riskRating": "High",
    "tenure": "Council",
    "propertyType": "Flat"
  }
]`;

// Property Hierarchy Data - Tree Data with Nested Records
const PROPERTY_HIERARCHY_TREE_NESTED_JSON = `[
  {
    "name": "Southwark Estate",
    "propertyUPRN": "EST001",
    "level": "Estate (L1)",
    "propertyType": "Estate",
    "children": [
      {
        "name": "Nelson Block",
        "propertyUPRN": "BLK001",
        "parentUPRN": "EST001",
        "level": "Block (L2)",
        "buildingName": "Nelson Block",
        "propertyType": "Block",
        "children": [
          {
            "name": "Core A",
            "propertyUPRN": "COR001",
            "parentUPRN": "BLK001",
            "level": "Core (L3)",
            "propertyType": "Core",
            "children": [
              {
                "name": "Flat 101",
                "propertyUPRN": "FLT101",
                "parentUPRN": "COR001",
                "level": "Flat (L4)",
                "streetNumber": "101",
                "street": "Nelson Way",
                "postcode": "SE1 0XX",
                "town": "Southwark",
                "city": "London",
                "riskRating": "Low",
                "tenure": "Council",
                "propertyType": "Flat"
              },
              {
                "name": "Flat 102",
                "propertyUPRN": "FLT102",
                "parentUPRN": "COR001",
                "level": "Flat (L4)",
                "streetNumber": "102",
                "street": "Nelson Way",
                "postcode": "SE1 0XX",
                "town": "Southwark",
                "city": "London",
                "riskRating": "Medium",
                "tenure": "Leasehold",
                "propertyType": "Flat"
              }
            ]
          }
        ]
      },
      {
        "name": "Wellington Block",
        "propertyUPRN": "BLK002",
        "parentUPRN": "EST001",
        "level": "Block (L2)",
        "buildingName": "Wellington Block",
        "propertyType": "Block",
        "children": [
          {
            "name": "Core B",
            "propertyUPRN": "COR002",
            "parentUPRN": "BLK002",
            "level": "Core (L3)",
            "propertyType": "Core",
            "children": [
              {
                "name": "Flat 201",
                "propertyUPRN": "FLT201",
                "parentUPRN": "COR002",
                "level": "Flat (L4)",
                "streetNumber": "201",
                "street": "Wellington Avenue",
                "postcode": "SE1 0XY",
                "town": "Southwark",
                "city": "London",
                "riskRating": "High",
                "tenure": "Council",
                "propertyType": "Flat"
              }
            ]
          }
        ]
      }
    ]
  }
]`;

const INITIAL_CONFIG = {
  // Common configurations
  groupDefaultExpanded: 1,
  groupSelectsChildren: true,
  groupSelectsFiltered: true,
  showOpenedGroup: true,
  suppressGroupSelectParent: false,
  groupIncludeFooter: false,
  groupIncludeTotalFooter: false,
  showGroupCheckbox: true,
  indentSize: 50,
  rowGroupPanelShow: 'always',

  // Row Grouping specific
  selectedGroupFields: ['system', 'systemSubCategory', 'component'],
  groupDisplayType: 'groupRows',
  groupColumnLabels: {},

  // Tree Data specific
  dataMode: 'rowGrouping', // 'rowGrouping', 'treeDataPaths', 'treeDataNested'
};

const App = () => {
  const [rowData, setRowData] = useState([]);
  const [jsonInput, setJsonInput] = useState(INITIAL_GROUPING_JSON);
  const [error, setError] = useState('');
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [config, setConfig] = useState(INITIAL_CONFIG);

  // Parse JSON input and update grid data
  const handleJsonChange = (input) => {
    setJsonInput(input);
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) {
        throw new Error('Input must be an array');
      }
      setRowData(parsed);
      setError('');
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  // Add handler for group column label changes
  const handleGroupLabelChange = (field, label) => {
    setConfig((prev) => ({
      ...prev,
      groupColumnLabels: {
        ...prev.groupColumnLabels,
        [field]: label,
      },
    }));
  };

  // Reset to initial configuration
  const handleReset = () => {
    const initialJson =
      config.dataMode === 'rowGrouping'
        ? INITIAL_GROUPING_JSON
        : config.dataMode === 'treeDataPaths'
        ? INITIAL_TREE_DATA_PATHS_JSON
        : INITIAL_TREE_DATA_NESTED_JSON;

    setJsonInput(initialJson);
    setConfig({ ...INITIAL_CONFIG, dataMode: config.dataMode });
    handleJsonChange(initialJson);

    if (gridApi) {
      // Reset grid options
      Object.entries(INITIAL_CONFIG).forEach(([key, value]) => {
        if (key !== 'dataMode') {
          gridApi.setGridOption(key, value);
        }
      });

      gridApi.refreshCells({ force: true });
    }
  };

  // Handle data mode change
  const handleDataModeChange = (mode) => {
    setConfig((prev) => ({ ...prev, dataMode: mode }));

    // Load appropriate initial data
    const newJson =
      mode === 'rowGrouping'
        ? INITIAL_GROUPING_JSON
        : mode === 'treeDataPaths'
        ? INITIAL_TREE_DATA_PATHS_JSON
        : INITIAL_TREE_DATA_NESTED_JSON;

    handleJsonChange(newJson);
  };

  // Default column properties
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 150,
      sortable: true,
      filter: true,
      resizable: true,
      enableRowGroup: config.dataMode === 'rowGrouping',
      enablePivot: config.dataMode === 'rowGrouping',
    }),
    [config.dataMode]
  );

  // Auto-group column definition for both Row Grouping and Tree Data
  const autoGroupColumnDef = useMemo(
    () => ({
      headerName:
        config.dataMode === 'treeDataPaths' &&
        jsonInput.includes('propertyUPRN')
          ? 'Property Hierarchy'
          : 'Grouped Items',
      minWidth: 300,
      flex: 2,
      field:
        config.dataMode === 'treeDataNested' ||
        config.dataMode === 'treeDataPaths'
          ? 'name'
          : undefined,
      cellRendererParams: {
        checkbox: config.showGroupCheckbox,
        suppressCount: false,
        suppressDoubleClickExpand: false,
        suppressEnterExpand: false,
        innerRenderer:
          config.dataMode === 'rowGrouping'
            ? (params) => {
                const indent = params.node.level * config.indentSize;
                const fieldName = params.node.rowGroupColumn?.colId;
                const customLabel = config.groupColumnLabels[fieldName];

                const displayValue =
                  params.node.group && customLabel
                    ? `${customLabel}: ${params.value}`
                    : params.value;

                return (
                  <span style={{ marginLeft: indent + 'px' }}>
                    {displayValue}
                  </span>
                );
              }
            : undefined,
      },
    }),
    [
      config.showGroupCheckbox,
      config.indentSize,
      config.groupColumnLabels,
      config.dataMode,
      jsonInput,
    ]
  );

  // Column definitions
  const columnDefs = useMemo(() => {
    if (!rowData.length) return [];

    // For tree data with nested records, we need to flatten to get all possible fields
    const getAllFields = (data) => {
      const fields = new Set();

      const processItem = (item) => {
        Object.keys(item).forEach((key) => {
          if (key !== 'children' && key !== 'path') {
            fields.add(key);
          }
        });
        if (item.children && Array.isArray(item.children)) {
          item.children.forEach(processItem);
        }
      };

      data.forEach(processItem);
      return Array.from(fields);
    };

    const allFields =
      config.dataMode === 'treeDataNested'
        ? getAllFields(rowData)
        : Object.keys(rowData[0]).filter(
            (field) => field !== 'path' && field !== 'children'
          );

    return allFields.map((field) => ({
      field,
      headerName: field.charAt(0).toUpperCase() + field.slice(1),
      rowGroup:
        config.dataMode === 'rowGrouping' &&
        config.selectedGroupFields.includes(field),
      hide:
        config.dataMode === 'rowGrouping' &&
        config.selectedGroupFields.includes(field),
    }));
  }, [rowData, config.selectedGroupFields, config.dataMode]);

  // Get data path callback for Tree Data
  const getDataPath = useCallback((data) => {
    return data.path;
  }, []);

  // Handle grid ready event
  const onGridReady = (params) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  };

  // Available fields for grouping (only for row grouping mode)
  const availableFields = useMemo(() => {
    if (!rowData.length || config.dataMode !== 'rowGrouping') return [];
    return Object.keys(rowData[0]);
  }, [rowData, config.dataMode]);

  // Update grouping when fields change
  const handleGroupingChange = (e) => {
    const field = e.target.value;
    const newSelectedFields = e.target.checked
      ? [...config.selectedGroupFields, field]
      : config.selectedGroupFields.filter((f) => f !== field);

    setConfig((prev) => ({
      ...prev,
      selectedGroupFields: newSelectedFields,
    }));

    if (columnApi && gridApi) {
      const newColDefs = columnDefs.map((col) => ({
        ...col,
        rowGroup: newSelectedFields.includes(col.field),
        hide: newSelectedFields.includes(col.field),
      }));

      gridApi.setColumnDefs(newColDefs);
      gridApi.refreshCells({ force: true });
    }
  };

  // Handle configuration changes
  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (gridApi) {
      gridApi.setGridOption(key, value);

      if (key.startsWith('group')) {
        gridApi.refreshCells({ force: true });
      }
    }
  };

  // Auto-size columns helper
  const sizeToFit = () => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
  };

  useEffect(() => {
    handleJsonChange(jsonInput);
  }, []);

  // Determine if tree data is enabled
  const isTreeData =
    config.dataMode === 'treeDataPaths' || config.dataMode === 'treeDataNested';
  const treeDataChildrenField =
    config.dataMode === 'treeDataNested' ? 'children' : undefined;

  return (
    <div
      className="p-4"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Configuration Panel */}
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '400px',
          }}
        >
          <div
            style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
              }}
            >
              <h3 style={{ margin: 0 }}>Configuration</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setConfig((prev) => ({
                      ...prev,
                      dataMode: 'treeDataPaths',
                    }));
                    handleJsonChange(PROPERTY_HIERARCHY_TREE_PATHS_JSON);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Load property hierarchy data"
                >
                  Load Property Hierarchy
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Reset to Initial
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Data Mode</h4>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <label
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <input
                    type="radio"
                    value="rowGrouping"
                    checked={config.dataMode === 'rowGrouping'}
                    onChange={(e) => handleDataModeChange(e.target.value)}
                  />
                  Row Grouping (Current)
                </label>
                <label
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <input
                    type="radio"
                    value="treeDataPaths"
                    checked={config.dataMode === 'treeDataPaths'}
                    onChange={(e) => handleDataModeChange(e.target.value)}
                  />
                  Tree Data (Data Paths)
                </label>
                <label
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <input
                    type="radio"
                    value="treeDataNested"
                    checked={config.dataMode === 'treeDataNested'}
                    onChange={(e) => handleDataModeChange(e.target.value)}
                  />
                  Tree Data (Nested Records)
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>JSON Data</h4>
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '200px',
                  fontFamily: 'monospace',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '12px',
                }}
              />
              {error && (
                <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>
              )}
            </div>

            {config.dataMode === 'rowGrouping' && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Group By Fields</h4>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {availableFields.map((field) => (
                      <label
                        key={field}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="checkbox"
                          value={field}
                          checked={config.selectedGroupFields.includes(field)}
                          onChange={handleGroupingChange}
                        />
                        {field}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Group Column Labels</h4>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    {config.selectedGroupFields.map((field) => (
                      <label key={field}>
                        {field} Label:
                        <input
                          type="text"
                          value={config.groupColumnLabels[field] || ''}
                          onChange={(e) =>
                            handleGroupLabelChange(field, e.target.value)
                          }
                          placeholder={`Custom label for ${field}`}
                          style={{
                            width: '100%',
                            padding: '4px',
                            marginTop: '4px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Display Options</h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {config.dataMode === 'rowGrouping' && (
                  <label>
                    Display Type:
                    <select
                      value={config.groupDisplayType}
                      onChange={(e) =>
                        handleConfigChange('groupDisplayType', e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '4px',
                        marginTop: '4px',
                      }}
                    >
                      <option value="groupRows">Group Rows</option>
                      <option value="multipleColumns">Multiple Columns</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>
                )}

                <label>
                  Default Expanded Level:
                  <input
                    type="number"
                    value={config.groupDefaultExpanded}
                    onChange={(e) =>
                      handleConfigChange(
                        'groupDefaultExpanded',
                        parseInt(e.target.value)
                      )
                    }
                    style={{ width: '100%', padding: '4px', marginTop: '4px' }}
                  />
                </label>

                <label
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={config.groupSelectsChildren}
                    onChange={(e) =>
                      handleConfigChange(
                        'groupSelectsChildren',
                        e.target.checked
                      )
                    }
                  />
                  Group Selects Children
                </label>

                <label
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={config.groupSelectsFiltered}
                    onChange={(e) =>
                      handleConfigChange(
                        'groupSelectsFiltered',
                        e.target.checked
                      )
                    }
                  />
                  Group Selects Filtered
                </label>

                <label
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={config.showOpenedGroup}
                    onChange={(e) =>
                      handleConfigChange('showOpenedGroup', e.target.checked)
                    }
                  />
                  Show Opened Group
                </label>

                <label
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={config.suppressGroupSelectParent}
                    onChange={(e) =>
                      handleConfigChange(
                        'suppressGroupSelectParent',
                        e.target.checked
                      )
                    }
                  />
                  Suppress Group Select Parent
                </label>

                {config.dataMode === 'rowGrouping' && (
                  <>
                    <label
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={config.groupIncludeFooter}
                        onChange={(e) =>
                          handleConfigChange(
                            'groupIncludeFooter',
                            e.target.checked
                          )
                        }
                      />
                      Include Group Footer
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={config.groupIncludeTotalFooter}
                        onChange={(e) =>
                          handleConfigChange(
                            'groupIncludeTotalFooter',
                            e.target.checked
                          )
                        }
                      />
                      Include Total Footer
                    </label>
                  </>
                )}

                <label
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={config.showGroupCheckbox}
                    onChange={(e) =>
                      handleConfigChange('showGroupCheckbox', e.target.checked)
                    }
                  />
                  Show Checkboxes in Group Rows
                </label>

                <label>
                  Indent Size (px):
                  <input
                    type="number"
                    value={config.indentSize}
                    onChange={(e) =>
                      handleConfigChange('indentSize', parseInt(e.target.value))
                    }
                    style={{ width: '100%', padding: '4px', marginTop: '4px' }}
                    min="0"
                    max="100"
                  />
                </label>
              </div>
            </div>

            <button
              onClick={sizeToFit}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Size Columns to Fit
            </button>
          </div>
        </div>

        {/* Grid Container */}
        <div style={{ flex: '2' }}>
          <div
            className="ag-theme-alpine"
            style={{ height: '800px', width: '100%' }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              autoGroupColumnDef={autoGroupColumnDef}
              onGridReady={onGridReady}
              // Tree Data properties
              treeData={isTreeData}
              getDataPath={
                config.dataMode === 'treeDataPaths' ? getDataPath : undefined
              }
              treeDataChildrenField={treeDataChildrenField}
              // Row Grouping properties
              groupDisplayType={
                !isTreeData ? config.groupDisplayType : undefined
              }
              // Common properties
              groupDefaultExpanded={config.groupDefaultExpanded}
              groupSelectsChildren={config.groupSelectsChildren}
              groupSelectsFiltered={config.groupSelectsFiltered}
              showOpenedGroup={config.showOpenedGroup}
              suppressGroupSelectParent={config.suppressGroupSelectParent}
              groupIncludeFooter={
                !isTreeData ? config.groupIncludeFooter : undefined
              }
              groupIncludeTotalFooter={
                !isTreeData ? config.groupIncludeTotalFooter : undefined
              }
              rowSelection="multiple"
              suppressRowClickSelection={true}
              animateRows={true}
              rowGroupPanelShow={!isTreeData ? 'always' : 'never'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
