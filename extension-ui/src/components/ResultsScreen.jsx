import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SummaryTab from './tabs/SummaryTab'
import FindingsTab from './tabs/FindingsTab'
import TestsTab from './tabs/TestsTab'
import { exportAuditToPDF } from '../utils/exportPDF'
import { updateAudit } from '../utils/storage'
import './ResultsScreen.css'

const tabs = [
  { id: 'summary', label: 'Summary', icon: 'chart' },
  { id: 'findings', label: 'Findings', icon: 'search' },
  { id: 'tests', label: 'Tests', icon: 'flask' }
]

function TabIcon({ type }) {
  const icons = {
    chart: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M16 12V16M12 8V16M8 12V16M4 4H20C20.5523 4 21 4.44772 21 5V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    flask: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9 3H15M10 3V8.4C10 8.73137 9.89464 9.05391 9.7 9.32L5.3 15.68C4.55279 16.6868 5.27542 18 6.52 18H17.48C18.7246 18 19.4472 16.6868 18.7 15.68L14.3 9.32C14.1054 9.05391 14 8.73137 14 8.4V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return icons[type] || null
}

function ResultsScreen({ data, onReset, onDataUpdate }) {
  const [activeTab, setActiveTab] = useState('summary')
  const [exporting, setExporting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [editedData, setEditedData] = useState(data)

  // Sync editedData when data changes (e.g., loading different audit)
  useEffect(() => {
    setEditedData(data)
  }, [data])

  // Calculate scores from assertions
  const recalculateScores = useCallback((auditData) => {
    const newData = { ...auditData }
    const categories = { ...newData.liftCategories }

    let totalScore = 0
    const categoryKeys = Object.keys(categories)

    categoryKeys.forEach(key => {
      const cat = categories[key]
      const passed = cat.assertions.filter(a => a.status === 'pass').length
      const total = cat.assertions.length
      const score = total > 0 ? Math.round((passed / total) * 100) : 0
      categories[key] = { ...cat, score }
      totalScore += score
    })

    newData.liftCategories = categories
    newData.overallScore = Math.round(totalScore / categoryKeys.length)

    // Update critical issues (filter from assertions)
    newData.criticalIssues = []
    categoryKeys.forEach(key => {
      const cat = categories[key]
      cat.assertions
        .filter(a => a.status === 'fail' && a.severity === 'critical')
        .forEach(a => {
          newData.criticalIssues.push({
            id: a.id,
            category: cat.name,
            title: a.name,
            impact: 'critical'
          })
        })
    })

    return newData
  }, [])

  // Update data with optional recalculation
  const updateData = useCallback((newData) => {
    if (autoCalculate) {
      setEditedData(recalculateScores(newData))
    } else {
      setEditedData(newData)
    }
  }, [autoCalculate, recalculateScores])

  // Save and exit edit mode
  const handleSaveAndExit = async () => {
    const dataToSave = {
      ...editedData,
      isEdited: true,
      editedAt: new Date().toISOString(),
      autoCalculate
    }

    if (editedData.id) {
      await updateAudit(editedData.id, dataToSave)
    }

    // Update parent with new data
    onDataUpdate?.(dataToSave)
    setEditMode(false)
  }

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditedData(data)
    setEditMode(false)
  }

  // Current data to display
  const displayData = editMode ? editedData : data

  // Count failed assertions for badge
  const failedCount = Object.values(displayData.liftCategories).reduce((acc, cat) => {
    return acc + cat.assertions.filter(a => a.status === 'fail').length
  }, 0)

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      exportAuditToPDF(displayData)
    } catch (error) {
      console.error('PDF export failed:', error)
    }
    setExporting(false)
  }

  return (
    <motion.div
      className="results-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="results-header">
        <motion.button
          className="back-button"
          onClick={onReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        <div className="header-center">
          <div className="url-badge">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M13.8284 10.1716C12.2663 8.60948 9.73367 8.60948 8.17157 10.1716L4.17157 14.1716C2.60948 15.7337 2.60948 18.2663 4.17157 19.8284C5.73367 21.3905 8.26633 21.3905 9.82843 19.8284L11.5 18.1569M10.1716 13.8284C11.7337 15.3905 14.2663 15.3905 15.8284 13.8284L19.8284 9.82843C21.3905 8.26633 21.3905 5.73367 19.8284 4.17157C18.2663 2.60948 15.7337 2.60948 14.1716 4.17157L12.5 5.84315" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{data.url}</span>
          </div>
        </div>

        {!editMode ? (
          <div className="header-actions">
            <motion.button
              className="edit-button"
              onClick={() => setEditMode(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Edit</span>
            </motion.button>
            <motion.button
              className="export-button"
              onClick={handleExportPDF}
              disabled={exporting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 10V16M12 16L9 13M12 16L15 13M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
            </motion.button>
          </div>
        ) : (
          <div className="edit-mode-actions">
            <motion.button
              className="cancel-button"
              onClick={handleCancelEdit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              className="save-button"
              onClick={handleSaveAndExit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Save</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Edit Mode Bar */}
      {editMode && (
        <motion.div
          className="edit-mode-bar"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="edit-mode-indicator">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Edit Mode</span>
          </div>
          <label className="auto-calc-toggle">
            <span>Auto-calculate scores</span>
            <input
              type="checkbox"
              checked={autoCalculate}
              onChange={(e) => setAutoCalculate(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <TabIcon type={tab.icon} />
            <span>{tab.label}</span>
            {tab.id === 'findings' && failedCount > 0 && (
              <span className="tab-badge">{failedCount}</span>
            )}
            {tab.id === 'tests' && (
              <span className="tab-badge">{data.tests.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <SummaryTab
              key="summary"
              data={displayData}
              editMode={editMode}
              autoCalculate={autoCalculate}
              onUpdateData={updateData}
              onViewFindings={() => setActiveTab('findings')}
              onViewTests={() => setActiveTab('tests')}
            />
          )}
          {activeTab === 'findings' && (
            <FindingsTab
              key="findings"
              data={displayData}
              editMode={editMode}
              onUpdateData={updateData}
            />
          )}
          {activeTab === 'tests' && (
            <TestsTab
              key="tests"
              data={displayData}
              editMode={editMode}
              onUpdateData={updateData}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default ResultsScreen
