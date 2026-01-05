import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './FindingsTab.css'

const STATUS_CYCLE = ['pass', 'warning', 'fail']
const SEVERITY_CYCLE = ['low', 'medium', 'high', 'critical']

function StatusIcon({ status, editable = false, onClick }) {
  const handleClick = (e) => {
    if (editable && onClick) {
      e.stopPropagation()
      onClick()
    }
  }

  const icon = {
    pass: <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    fail: <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    warning: <path d="M12 9V13M12 17H12.01M12 3L2 21H22L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  }

  return (
    <div
      className={`status-icon ${status} ${editable ? 'editable' : ''}`}
      onClick={handleClick}
      title={editable ? 'Click to change status' : ''}
    >
      <svg viewBox="0 0 24 24" fill="none">
        {icon[status] || icon.warning}
      </svg>
    </div>
  )
}

function SeverityBadge({ severity, editable = false, onClick }) {
  const handleClick = (e) => {
    if (editable && onClick) {
      e.stopPropagation()
      onClick()
    }
  }

  return (
    <span
      className={`severity-badge ${severity} ${editable ? 'editable' : ''}`}
      onClick={handleClick}
      title={editable ? 'Click to change severity' : ''}
    >
      {severity}
    </span>
  )
}

function AssertionCard({ assertion, index, editMode = false, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [isEditingEvidence, setIsEditingEvidence] = useState(false)
  const [isEditingRecommendation, setIsEditingRecommendation] = useState(false)
  const [editValues, setEditValues] = useState({
    evidence: assertion.evidence,
    recommendation: assertion.recommendation || ''
  })

  const handleStatusChange = () => {
    const currentIndex = STATUS_CYCLE.indexOf(assertion.status)
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length]
    onUpdate?.({ ...assertion, status: nextStatus, _edited: true })
  }

  const handleSeverityChange = () => {
    const currentIndex = SEVERITY_CYCLE.indexOf(assertion.severity)
    const nextSeverity = SEVERITY_CYCLE[(currentIndex + 1) % SEVERITY_CYCLE.length]
    onUpdate?.({ ...assertion, severity: nextSeverity, _edited: true })
  }

  const handleSaveEvidence = () => {
    onUpdate?.({ ...assertion, evidence: editValues.evidence, _edited: true })
    setIsEditingEvidence(false)
  }

  const handleSaveRecommendation = () => {
    onUpdate?.({ ...assertion, recommendation: editValues.recommendation, _edited: true })
    setIsEditingRecommendation(false)
  }

  return (
    <motion.div
      className={`assertion-card ${assertion.status} ${assertion._origin === 'custom' ? 'custom' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="assertion-header" onClick={() => setExpanded(!expanded)}>
        <StatusIcon
          status={assertion.status}
          editable={editMode}
          onClick={handleStatusChange}
        />
        <div className="assertion-info">
          <div className="assertion-top">
            <span className="assertion-name">
              {assertion.name}
              {assertion._origin === 'custom' && <span className="custom-badge">Custom</span>}
              {assertion._edited && !assertion._origin && <span className="edited-badge">Edited</span>}
            </span>
            <SeverityBadge
              severity={assertion.severity}
              editable={editMode}
              onClick={handleSeverityChange}
            />
          </div>
          <span className="assertion-question">{assertion.question}</span>
        </div>
        {editMode && (
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <button className={`expand-button ${expanded ? 'expanded' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="assertion-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="detail-section">
              <span className="detail-label">
                Evidence
                {editMode && !isEditingEvidence && (
                  <button className="edit-text-btn" onClick={() => setIsEditingEvidence(true)}>Edit</button>
                )}
              </span>
              {isEditingEvidence ? (
                <div className="edit-text-form">
                  <textarea
                    value={editValues.evidence}
                    onChange={(e) => setEditValues({ ...editValues, evidence: e.target.value })}
                    rows={3}
                  />
                  <div className="edit-text-actions">
                    <button className="btn-cancel" onClick={() => setIsEditingEvidence(false)}>Cancel</button>
                    <button className="btn-save" onClick={handleSaveEvidence}>Save</button>
                  </div>
                </div>
              ) : (
                <p className="detail-text">{assertion.evidence}</p>
              )}
            </div>
            <div className="detail-section">
              <span className="detail-label">
                Recommendation
                {editMode && !isEditingRecommendation && (
                  <button className="edit-text-btn" onClick={() => setIsEditingRecommendation(true)}>Edit</button>
                )}
              </span>
              {isEditingRecommendation ? (
                <div className="edit-text-form">
                  <textarea
                    value={editValues.recommendation}
                    onChange={(e) => setEditValues({ ...editValues, recommendation: e.target.value })}
                    rows={3}
                    placeholder="Add recommendation..."
                  />
                  <div className="edit-text-actions">
                    <button className="btn-cancel" onClick={() => setIsEditingRecommendation(false)}>Cancel</button>
                    <button className="btn-save" onClick={handleSaveRecommendation}>Save</button>
                  </div>
                </div>
              ) : (
                <p className="detail-text recommendation">
                  {assertion.recommendation || (editMode ? 'No recommendation' : '')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CategorySection({ categoryKey, category, index, editMode = false, onUpdateAssertion, onDeleteAssertion, onAddAssertion }) {
  const [collapsed, setCollapsed] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAssertion, setNewAssertion] = useState({
    name: '',
    question: '',
    status: 'fail',
    severity: 'medium',
    evidence: '',
    recommendation: ''
  })

  const passedCount = category.assertions.filter(a => a.status === 'pass').length
  const totalCount = category.assertions.length

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const handleAddAssertion = () => {
    if (!newAssertion.name) return
    onAddAssertion?.(categoryKey, {
      ...newAssertion,
      id: `CUSTOM_${Date.now()}`,
      _origin: 'custom'
    })
    setNewAssertion({
      name: '',
      question: '',
      status: 'fail',
      severity: 'medium',
      evidence: '',
      recommendation: ''
    })
    setShowAddForm(false)
  }

  return (
    <motion.div
      className="category-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="category-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="category-left">
          <span className={`category-score ${getScoreColor(category.score)}`}>
            {category.score}
          </span>
          <div className="category-info">
            <div className="category-name-row">
              <span className="category-name">{category.name}</span>
              {category.isInhibitor && (
                <span className="category-inhibitor">Inhibitor</span>
              )}
            </div>
            <span className="category-description">{category.description}</span>
          </div>
        </div>
        <div className="category-right">
          <span className="category-progress">
            {passedCount}/{totalCount} passed
          </span>
          {editMode && (
            <button
              className="add-assertion-btn"
              onClick={(e) => {
                e.stopPropagation()
                setCollapsed(false)
                setShowAddForm(true)
              }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button className={`collapse-button ${collapsed ? 'collapsed' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            className="assertions-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {showAddForm && (
              <div className="add-assertion-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Assertion name"
                    value={newAssertion.name}
                    onChange={(e) => setNewAssertion({ ...newAssertion, name: e.target.value })}
                    className="form-input"
                  />
                  <select
                    value={newAssertion.status}
                    onChange={(e) => setNewAssertion({ ...newAssertion, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="pass">Pass</option>
                    <option value="warning">Warning</option>
                    <option value="fail">Fail</option>
                  </select>
                  <select
                    value={newAssertion.severity}
                    onChange={(e) => setNewAssertion({ ...newAssertion, severity: e.target.value })}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Question (e.g., 'Is the value clear?')"
                  value={newAssertion.question}
                  onChange={(e) => setNewAssertion({ ...newAssertion, question: e.target.value })}
                  className="form-input full"
                />
                <textarea
                  placeholder="Evidence"
                  value={newAssertion.evidence}
                  onChange={(e) => setNewAssertion({ ...newAssertion, evidence: e.target.value })}
                  className="form-textarea"
                  rows={2}
                />
                <textarea
                  placeholder="Recommendation"
                  value={newAssertion.recommendation}
                  onChange={(e) => setNewAssertion({ ...newAssertion, recommendation: e.target.value })}
                  className="form-textarea"
                  rows={2}
                />
                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button className="btn-save" onClick={handleAddAssertion}>Add Assertion</button>
                </div>
              </div>
            )}
            {category.assertions.map((assertion, i) => (
              <AssertionCard
                key={assertion.id}
                assertion={assertion}
                index={i}
                editMode={editMode}
                onUpdate={(updated) => onUpdateAssertion?.(categoryKey, assertion.id, updated)}
                onDelete={() => onDeleteAssertion?.(categoryKey, assertion.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FindingsTab({ data, editMode = false, onUpdateData }) {
  const [filter, setFilter] = useState('all') // all, failed, passed

  const categories = Object.entries(data.liftCategories)

  const getFilteredAssertions = (assertions) => {
    if (filter === 'failed') return assertions.filter(a => a.status === 'fail' || a.status === 'warning')
    if (filter === 'passed') return assertions.filter(a => a.status === 'pass')
    return assertions
  }

  const totalFailed = categories.reduce((acc, [, cat]) =>
    acc + cat.assertions.filter(a => a.status === 'fail').length, 0)
  const totalWarnings = categories.reduce((acc, [, cat]) =>
    acc + cat.assertions.filter(a => a.status === 'warning').length, 0)
  const totalPassed = categories.reduce((acc, [, cat]) =>
    acc + cat.assertions.filter(a => a.status === 'pass').length, 0)

  // Update assertion in category
  const handleUpdateAssertion = (categoryKey, assertionId, updatedAssertion) => {
    const newCategories = { ...data.liftCategories }
    const category = newCategories[categoryKey]
    const assertions = category.assertions.map(a =>
      a.id === assertionId ? updatedAssertion : a
    )
    newCategories[categoryKey] = { ...category, assertions }
    onUpdateData?.({ ...data, liftCategories: newCategories })
  }

  // Delete assertion from category
  const handleDeleteAssertion = (categoryKey, assertionId) => {
    const newCategories = { ...data.liftCategories }
    const category = newCategories[categoryKey]
    const assertions = category.assertions.filter(a => a.id !== assertionId)
    newCategories[categoryKey] = { ...category, assertions }
    onUpdateData?.({ ...data, liftCategories: newCategories })
  }

  // Add new assertion to category
  const handleAddAssertion = (categoryKey, newAssertion) => {
    const newCategories = { ...data.liftCategories }
    const category = newCategories[categoryKey]
    const assertions = [...category.assertions, newAssertion]
    newCategories[categoryKey] = { ...category, assertions }
    onUpdateData?.({ ...data, liftCategories: newCategories })
  }

  return (
    <motion.div
      className="findings-tab"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Filter Bar */}
      <div className="findings-filter">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-button ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          <span className="filter-dot fail" />
          Failed ({totalFailed + totalWarnings})
        </button>
        <button
          className={`filter-button ${filter === 'passed' ? 'active' : ''}`}
          onClick={() => setFilter('passed')}
        >
          <span className="filter-dot pass" />
          Passed ({totalPassed})
        </button>
      </div>

      {/* Categories */}
      <div className="categories-list">
        {categories.map(([key, category], index) => {
          const filteredAssertions = getFilteredAssertions(category.assertions)
          if (filteredAssertions.length === 0 && !editMode) return null

          return (
            <CategorySection
              key={key}
              categoryKey={key}
              category={editMode ? category : { ...category, assertions: filteredAssertions }}
              index={index}
              editMode={editMode}
              onUpdateAssertion={handleUpdateAssertion}
              onDeleteAssertion={handleDeleteAssertion}
              onAddAssertion={handleAddAssertion}
            />
          )
        })}
      </div>
    </motion.div>
  )
}

export default FindingsTab
