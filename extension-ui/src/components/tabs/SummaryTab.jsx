import { useState } from 'react'
import { motion } from 'framer-motion'
import './SummaryTab.css'

function ScoreRing({ score, size = 100, editable = false, onChange }) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(score)
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Good'
    if (score >= 60) return 'Needs Work'
    return 'Critical'
  }

  const handleSave = () => {
    const newScore = Math.max(0, Math.min(100, parseInt(tempValue) || 0))
    onChange?.(newScore)
    setIsEditing(false)
  }

  return (
    <div className={`score-ring ${editable ? 'editable' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="score-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="6"
        />
        <motion.circle
          className="score-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ stroke: getScoreColor(score) }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="score-ring-content">
        {isEditing ? (
          <input
            type="number"
            className="score-edit-input"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            min="0"
            max="100"
            autoFocus
          />
        ) : (
          <motion.span
            className="score-ring-value"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => editable && setIsEditing(true)}
          >
            {score}
          </motion.span>
        )}
        <span className="score-ring-label" style={{ color: getScoreColor(score) }}>
          {getScoreLabel(score)}
        </span>
      </div>
      {editable && !isEditing && (
        <div className="edit-hint" onClick={() => setIsEditing(true)}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}

function LiftBar({ category, categoryKey, index, editable = false, onChange }) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(category.score)

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)'
    if (score >= 60) return 'var(--warning)'
    return 'var(--error)'
  }

  const handleSave = () => {
    const newScore = Math.max(0, Math.min(100, parseInt(tempValue) || 0))
    onChange?.(categoryKey, newScore)
    setIsEditing(false)
  }

  return (
    <motion.div
      className={`lift-bar ${editable ? 'editable' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      <div className="lift-bar-header">
        <span className="lift-bar-name">
          {category.shortName}
          {category.isInhibitor && <span className="inhibitor-badge">Inhibitor</span>}
        </span>
        {isEditing ? (
          <input
            type="number"
            className="lift-score-input"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            min="0"
            max="100"
            autoFocus
          />
        ) : (
          <span
            className={`lift-bar-score ${editable ? 'clickable' : ''}`}
            style={{ color: getScoreColor(category.score) }}
            onClick={() => editable && setIsEditing(true)}
          >
            {category.score}
            {editable && (
              <svg className="edit-icon" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        )}
      </div>
      <div className="lift-bar-track">
        <motion.div
          className="lift-bar-fill"
          style={{ background: getScoreColor(category.score) }}
          initial={{ width: 0 }}
          animate={{ width: `${category.score}%` }}
          transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
        />
      </div>
    </motion.div>
  )
}

function CriticalIssueCard({ issue, index }) {
  return (
    <motion.div
      className="critical-issue-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
    >
      <div className="critical-issue-indicator" />
      <div className="critical-issue-content">
        <span className="critical-issue-category">{issue.category}</span>
        <span className="critical-issue-title">{issue.title}</span>
      </div>
    </motion.div>
  )
}

function QuickWinCard({ win, index, editMode = false, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState(win)

  const handleSave = () => {
    onEdit?.(index, editValues)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <motion.div
        className="quick-win-card editing"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="quick-win-edit-form">
          <input
            type="text"
            placeholder="Title"
            value={editValues.title}
            onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
            className="quick-win-input"
          />
          <div className="quick-win-edit-row">
            <input
              type="text"
              placeholder="Current"
              value={editValues.current}
              onChange={(e) => setEditValues({ ...editValues, current: e.target.value })}
              className="quick-win-input small"
            />
            <span className="arrow">→</span>
            <input
              type="text"
              placeholder="Suggested"
              value={editValues.suggested}
              onChange={(e) => setEditValues({ ...editValues, suggested: e.target.value })}
              className="quick-win-input small"
            />
          </div>
          <div className="quick-win-edit-actions">
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn-save" onClick={handleSave}>Save</button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="quick-win-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1 }}
    >
      <div className="quick-win-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="quick-win-content">
        <span className="quick-win-title">{win.title}</span>
        <div className="quick-win-change">
          <span className="quick-win-current">{win.current}</span>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="quick-win-suggested">{win.suggested}</span>
        </div>
      </div>
      {editMode && (
        <div className="quick-win-actions">
          <button className="action-btn edit" onClick={() => setIsEditing(true)}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="action-btn delete" onClick={() => onDelete?.(index)}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  )
}

function SummaryTab({ data, editMode = false, autoCalculate = true, onUpdateData, onViewFindings, onViewTests }) {
  const categories = Object.entries(data.liftCategories)
  const [showAddQuickWin, setShowAddQuickWin] = useState(false)
  const [newQuickWin, setNewQuickWin] = useState({ title: '', current: '', suggested: '', effort: 'easy', impact: 'high' })

  // Handle overall score change (only when autoCalculate is OFF)
  const handleOverallScoreChange = (newScore) => {
    onUpdateData?.({ ...data, overallScore: newScore })
  }

  // Handle category score change (only when autoCalculate is OFF)
  const handleCategoryScoreChange = (categoryKey, newScore) => {
    const newCategories = { ...data.liftCategories }
    newCategories[categoryKey] = { ...newCategories[categoryKey], score: newScore }
    onUpdateData?.({ ...data, liftCategories: newCategories })
  }

  // Handle quick win edit
  const handleQuickWinEdit = (index, updatedWin) => {
    const newQuickWins = [...data.quickWins]
    newQuickWins[index] = { ...newQuickWins[index], ...updatedWin, _edited: true }
    onUpdateData?.({ ...data, quickWins: newQuickWins })
  }

  // Handle quick win delete
  const handleQuickWinDelete = (index) => {
    const newQuickWins = data.quickWins.filter((_, i) => i !== index)
    onUpdateData?.({ ...data, quickWins: newQuickWins })
  }

  // Handle add quick win
  const handleAddQuickWin = () => {
    if (!newQuickWin.title) return
    const newQuickWins = [...data.quickWins, { ...newQuickWin, _origin: 'custom' }]
    onUpdateData?.({ ...data, quickWins: newQuickWins })
    setNewQuickWin({ title: '', current: '', suggested: '', effort: 'easy', impact: 'high' })
    setShowAddQuickWin(false)
  }

  return (
    <motion.div
      className="summary-tab"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Left: Score + LIFT Bars */}
      <div className="summary-left">
        <div className="score-section">
          <ScoreRing
            score={data.overallScore}
            size={110}
            editable={editMode && !autoCalculate}
            onChange={handleOverallScoreChange}
          />
          <span className="score-section-label">Overall CRO Score</span>
        </div>

        <div className="lift-bars-section">
          <div className="section-header">
            <span className="section-title">LIFT Model Breakdown</span>
          </div>
          <div className="lift-bars">
            {categories.map(([key, cat], i) => (
              <LiftBar
                key={cat.shortName}
                category={cat}
                categoryKey={key}
                index={i}
                editable={editMode && !autoCalculate}
                onChange={handleCategoryScoreChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Critical Issues + Quick Wins */}
      <div className="summary-right">
        <div className="critical-issues-section">
          <div className="section-header">
            <span className="section-title">Critical Issues</span>
            <button className="section-link" onClick={onViewFindings}>
              View all
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="critical-issues-list">
            {data.criticalIssues.length > 0 ? (
              data.criticalIssues.map((issue, i) => (
                <CriticalIssueCard key={issue.id} issue={issue} index={i} />
              ))
            ) : (
              <div className="empty-state">No critical issues found</div>
            )}
          </div>
        </div>

        <div className="quick-wins-section">
          <div className="section-header">
            <span className="section-title">Quick Wins</span>
            {editMode ? (
              <button className="add-button" onClick={() => setShowAddQuickWin(true)}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add
              </button>
            ) : (
              <button className="section-link" onClick={onViewTests}>
                View tests
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
          <div className="quick-wins-list">
            {showAddQuickWin && (
              <motion.div
                className="quick-win-card editing"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="quick-win-edit-form">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newQuickWin.title}
                    onChange={(e) => setNewQuickWin({ ...newQuickWin, title: e.target.value })}
                    className="quick-win-input"
                    autoFocus
                  />
                  <div className="quick-win-edit-row">
                    <input
                      type="text"
                      placeholder="Current"
                      value={newQuickWin.current}
                      onChange={(e) => setNewQuickWin({ ...newQuickWin, current: e.target.value })}
                      className="quick-win-input small"
                    />
                    <span className="arrow">→</span>
                    <input
                      type="text"
                      placeholder="Suggested"
                      value={newQuickWin.suggested}
                      onChange={(e) => setNewQuickWin({ ...newQuickWin, suggested: e.target.value })}
                      className="quick-win-input small"
                    />
                  </div>
                  <div className="quick-win-edit-actions">
                    <button className="btn-cancel" onClick={() => setShowAddQuickWin(false)}>Cancel</button>
                    <button className="btn-save" onClick={handleAddQuickWin}>Add</button>
                  </div>
                </div>
              </motion.div>
            )}
            {data.quickWins.map((win, i) => (
              <QuickWinCard
                key={i}
                win={win}
                index={i}
                editMode={editMode}
                onEdit={handleQuickWinEdit}
                onDelete={handleQuickWinDelete}
              />
            ))}
            {data.quickWins.length === 0 && !showAddQuickWin && (
              <div className="empty-state">No quick wins yet</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SummaryTab
