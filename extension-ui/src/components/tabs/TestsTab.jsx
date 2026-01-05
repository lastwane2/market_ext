import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './TestsTab.css'

const PRIORITY_CYCLE = ['medium', 'high', 'critical']

// Calculate PXL score from factors
const calculatePxlScore = (factors) => {
  let score = 0
  if (factors.aboveFold) score += 15
  if (factors.noticeableIn5Sec) score += 15
  if (factors.runOnHighTraffic) score += 15
  if (factors.affectsAllUsers) score += 15
  if (factors.easyToImplement) score += 20
  if (factors.evidenceBacked) score += 20
  return score
}

function PriorityBadge({ priority, editable = false, onClick }) {
  const handleClick = (e) => {
    if (editable && onClick) {
      e.stopPropagation()
      onClick()
    }
  }

  return (
    <span
      className={`priority-badge ${priority} ${editable ? 'editable' : ''}`}
      onClick={handleClick}
      title={editable ? 'Click to change priority' : ''}
    >
      {priority}
    </span>
  )
}

function PxlScore({ score }) {
  return (
    <div className="pxl-score">
      <span className="pxl-value">{score}</span>
      <span className="pxl-label">PXL</span>
    </div>
  )
}

function TestCard({ test, index, editMode = false, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [isEditingHypothesis, setIsEditingHypothesis] = useState(false)
  const [editHypothesis, setEditHypothesis] = useState(test.hypothesis)

  const getImpactColor = (impact) => {
    if (impact === 'high') return 'var(--success)'
    if (impact === 'medium') return 'var(--warning)'
    return 'var(--text-muted)'
  }

  const getEffortLabel = (effort) => {
    if (effort === 'easy') return '1-2 hours'
    if (effort === 'medium') return '2-4 hours'
    return '4+ hours'
  }

  const handlePriorityChange = () => {
    const currentIndex = PRIORITY_CYCLE.indexOf(test.priority)
    const nextPriority = PRIORITY_CYCLE[(currentIndex + 1) % PRIORITY_CYCLE.length]
    onUpdate?.({ ...test, priority: nextPriority, _edited: true })
  }

  const handleSaveHypothesis = () => {
    onUpdate?.({ ...test, hypothesis: editHypothesis, _edited: true })
    setIsEditingHypothesis(false)
  }

  const handleTogglePxlFactor = (factorKey) => {
    const newFactors = { ...test.pxlFactors, [factorKey]: !test.pxlFactors[factorKey] }
    const newPxlScore = calculatePxlScore(newFactors)
    onUpdate?.({ ...test, pxlFactors: newFactors, pxlScore: newPxlScore, _edited: true })
  }

  const handleUpdateVariant = (variantIndex, field, value) => {
    const newVariants = [...test.variants]
    newVariants[variantIndex] = { ...newVariants[variantIndex], [field]: value }
    onUpdate?.({ ...test, variants: newVariants, _edited: true })
  }

  const handleAddVariant = () => {
    const newVariants = [...test.variants, { name: `Variant ${String.fromCharCode(65 + test.variants.length - 1)}`, description: '' }]
    onUpdate?.({ ...test, variants: newVariants, _edited: true })
  }

  const handleDeleteVariant = (variantIndex) => {
    if (test.variants.length <= 2) return // Keep at least control + 1 variant
    const newVariants = test.variants.filter((_, i) => i !== variantIndex)
    onUpdate?.({ ...test, variants: newVariants, _edited: true })
  }

  return (
    <motion.div
      className={`test-card priority-${test.priority} ${test._origin === 'custom' ? 'custom' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="test-header" onClick={() => setExpanded(!expanded)}>
        <div className="test-rank">#{index + 1}</div>
        <div className="test-main">
          <div className="test-title-row">
            <span className="test-title">
              {test.title}
              {test._origin === 'custom' && <span className="custom-badge">Custom</span>}
              {test._edited && !test._origin && <span className="edited-badge">Edited</span>}
            </span>
            <PriorityBadge
              priority={test.priority}
              editable={editMode}
              onClick={handlePriorityChange}
            />
          </div>
          <span className="test-category">{test.category}</span>
        </div>
        <PxlScore score={test.pxlScore} />
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
        <button className={`test-expand ${expanded ? 'expanded' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="test-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Hypothesis */}
            <div className="test-section">
              <span className="test-section-label">
                Hypothesis
                {editMode && !isEditingHypothesis && (
                  <button className="edit-text-btn" onClick={() => setIsEditingHypothesis(true)}>Edit</button>
                )}
              </span>
              {isEditingHypothesis ? (
                <div className="edit-text-form">
                  <textarea
                    value={editHypothesis}
                    onChange={(e) => setEditHypothesis(e.target.value)}
                    rows={3}
                  />
                  <div className="edit-text-actions">
                    <button className="btn-cancel" onClick={() => setIsEditingHypothesis(false)}>Cancel</button>
                    <button className="btn-save" onClick={handleSaveHypothesis}>Save</button>
                  </div>
                </div>
              ) : (
                <p className="test-hypothesis">{test.hypothesis}</p>
              )}
            </div>

            {/* Variants */}
            <div className="test-section">
              <span className="test-section-label">
                Test Variants
                {editMode && (
                  <button className="add-variant-btn" onClick={handleAddVariant}>+ Add Variant</button>
                )}
              </span>
              <div className="test-variants">
                {test.variants.map((variant, i) => (
                  <div key={i} className={`test-variant ${i === 0 ? 'control' : ''}`}>
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          className="variant-input name"
                          value={variant.name}
                          onChange={(e) => handleUpdateVariant(i, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          className="variant-input description"
                          value={variant.description}
                          onChange={(e) => handleUpdateVariant(i, 'description', e.target.value)}
                          placeholder="Description..."
                        />
                        {i > 0 && (
                          <button className="delete-variant-btn" onClick={() => handleDeleteVariant(i)}>
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="variant-name">{variant.name}</span>
                        <span className="variant-description">{variant.description}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="test-section">
              <span className="test-section-label">Expected Metrics</span>
              <div className="test-metrics">
                <div className="metric">
                  <span className="metric-label">Impact</span>
                  <span className="metric-value" style={{ color: getImpactColor(test.expectedImpact) }}>
                    {test.expectedImpact}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Effort</span>
                  <span className="metric-value">{getEffortLabel(test.implementationEffort)}</span>
                </div>
              </div>
            </div>

            {/* PXL Factors */}
            <div className="test-section">
              <span className="test-section-label">PXL Factors {editMode && '(click to toggle)'}</span>
              <div className="pxl-factors">
                {Object.entries(test.pxlFactors).map(([key, value]) => (
                  <div
                    key={key}
                    className={`pxl-factor ${value ? 'true' : 'false'} ${editMode ? 'editable' : ''}`}
                    onClick={() => editMode && handleTogglePxlFactor(key)}
                  >
                    <span className="pxl-factor-icon">
                      {value ? (
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="pxl-factor-name">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TestsTab({ data, editMode = false, onUpdateData }) {
  const [sortBy, setSortBy] = useState('pxl') // pxl, priority, impact
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTest, setNewTest] = useState({
    title: '',
    hypothesis: '',
    category: 'Value Proposition',
    priority: 'medium',
    expectedImpact: 'medium',
    implementationEffort: 'medium',
    variants: [
      { name: 'Control', description: 'Current version' },
      { name: 'Variant A', description: '' }
    ],
    pxlFactors: {
      aboveFold: true,
      noticeableIn5Sec: true,
      runOnHighTraffic: true,
      affectsAllUsers: true,
      easyToImplement: true,
      evidenceBacked: false
    }
  })

  const sortedTests = [...data.tests].sort((a, b) => {
    if (sortBy === 'pxl') return b.pxlScore - a.pxlScore
    if (sortBy === 'priority') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 }
      return order[a.priority] - order[b.priority]
    }
    if (sortBy === 'impact') {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.expectedImpact] - order[b.expectedImpact]
    }
    return 0
  })

  const handleUpdateTest = (testId, updatedTest) => {
    const newTests = data.tests.map(t => t.id === testId ? updatedTest : t)
    onUpdateData?.({ ...data, tests: newTests })
  }

  const handleDeleteTest = (testId) => {
    const newTests = data.tests.filter(t => t.id !== testId)
    onUpdateData?.({ ...data, tests: newTests })
  }

  const handleAddTest = () => {
    if (!newTest.title) return
    const pxlScore = calculatePxlScore(newTest.pxlFactors)
    const test = {
      ...newTest,
      id: Date.now(),
      pxlScore,
      _origin: 'custom'
    }
    onUpdateData?.({ ...data, tests: [...data.tests, test] })
    setNewTest({
      title: '',
      hypothesis: '',
      category: 'Value Proposition',
      priority: 'medium',
      expectedImpact: 'medium',
      implementationEffort: 'medium',
      variants: [
        { name: 'Control', description: 'Current version' },
        { name: 'Variant A', description: '' }
      ],
      pxlFactors: {
        aboveFold: true,
        noticeableIn5Sec: true,
        runOnHighTraffic: true,
        affectsAllUsers: true,
        easyToImplement: true,
        evidenceBacked: false
      }
    })
    setShowAddForm(false)
  }

  return (
    <motion.div
      className="tests-tab"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="tests-header">
        <div className="tests-info">
          <span className="tests-count">{data.tests.length} A/B Tests</span>
          <span className="tests-subtitle">Prioritized by PXL framework</span>
        </div>
        <div className="tests-header-actions">
          {editMode && (
            <button className="add-test-btn" onClick={() => setShowAddForm(true)}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Test
            </button>
          )}
          <div className="tests-sort">
            <span className="sort-label">Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="pxl">PXL Score</option>
              <option value="priority">Priority</option>
              <option value="impact">Impact</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Test Form */}
      {showAddForm && (
        <motion.div
          className="add-test-form"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="form-row">
            <input
              type="text"
              placeholder="Test title"
              value={newTest.title}
              onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
              className="form-input"
              autoFocus
            />
            <select
              value={newTest.priority}
              onChange={(e) => setNewTest({ ...newTest, priority: e.target.value })}
              className="form-select"
            >
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <textarea
            placeholder="Hypothesis: If we... then... because..."
            value={newTest.hypothesis}
            onChange={(e) => setNewTest({ ...newTest, hypothesis: e.target.value })}
            className="form-textarea"
            rows={2}
          />
          <div className="form-row">
            <select
              value={newTest.category}
              onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
              className="form-select"
            >
              <option value="Value Proposition">Value Proposition</option>
              <option value="Clarity">Clarity</option>
              <option value="Relevance">Relevance</option>
              <option value="Anxiety">Anxiety</option>
              <option value="Distraction">Distraction</option>
              <option value="Urgency">Urgency</option>
            </select>
            <select
              value={newTest.expectedImpact}
              onChange={(e) => setNewTest({ ...newTest, expectedImpact: e.target.value })}
              className="form-select"
            >
              <option value="low">Low Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="high">High Impact</option>
            </select>
            <select
              value={newTest.implementationEffort}
              onChange={(e) => setNewTest({ ...newTest, implementationEffort: e.target.value })}
              className="form-select"
            >
              <option value="easy">Easy (1-2h)</option>
              <option value="medium">Medium (2-4h)</option>
              <option value="hard">Hard (4h+)</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAddTest}>Add Test</button>
          </div>
        </motion.div>
      )}

      {/* Tests List */}
      <div className="tests-list">
        {sortedTests.map((test, index) => (
          <TestCard
            key={test.id}
            test={test}
            index={index}
            editMode={editMode}
            onUpdate={(updated) => handleUpdateTest(test.id, updated)}
            onDelete={() => handleDeleteTest(test.id)}
          />
        ))}
        {data.tests.length === 0 && (
          <div className="empty-state">No tests yet. {editMode && 'Click "Add Test" to create one.'}</div>
        )}
      </div>
    </motion.div>
  )
}

export default TestsTab
