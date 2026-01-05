import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuditHistory, deleteAudit } from '../utils/storage'
import './StartScreen.css'

function HistoryList({ audits, onSelect, onDelete, onRefresh }) {
  if (audits.length === 0) {
    return (
      <div className="history-empty">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>No audits yet</p>
        <span>Run your first audit to see history</span>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000)
      return `${mins}m ago`
    }
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}h ago`
    }
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days}d ago`
    }
    // Otherwise show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const handleDelete = async (e, auditId) => {
    e.stopPropagation()
    if (confirm('Delete this audit?')) {
      await onDelete(auditId)
      onRefresh()
    }
  }

  return (
    <div className="history-list">
      {audits.map((audit, index) => (
        <motion.div
          key={audit.id}
          className="history-item"
          onClick={() => onSelect(audit)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className={`history-score ${getScoreColor(audit.overallScore)}`}>
            {audit.overallScore}
          </div>
          <div className="history-info">
            <span className="history-url">{getDomain(audit.url)}</span>
            <span className="history-meta">
              {formatDate(audit.savedAt || audit.analyzedAt)}
              {audit.isEdited && <span className="edited-badge">Edited</span>}
            </span>
          </div>
          <button
            className="history-delete"
            onClick={(e) => handleDelete(e, audit.id)}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </motion.div>
      ))}
    </div>
  )
}

function StartScreen({ onStart, onLoadAudit }) {
  const [activeTab, setActiveTab] = useState('new')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const loadHistory = async () => {
    setLoading(true)
    const audits = await getAuditHistory()
    setHistory(audits)
    setLoading(false)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleDelete = async (auditId) => {
    await deleteAudit(auditId)
  }

  return (
    <motion.div
      className="start-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Tabs */}
      <div className="start-tabs">
        <button
          className={`start-tab ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          New Audit
        </button>
        <button
          className={`start-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          History
          {history.length > 0 && <span className="tab-count">{history.length}</span>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'new' ? (
          <motion.div
            key="new"
            className="start-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="logo-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
            >
              <div className="logo">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 20L24 14L34 20V28L24 34L14 28V20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <circle cx="24" cy="24" r="4" fill="currentColor"/>
                </svg>
              </div>
            </motion.div>

            <motion.h1
              className="title"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              CRO Audit
            </motion.h1>

            <motion.p
              className="subtitle"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              AI-powered landing page conversion analysis
            </motion.p>

            <motion.button
              className="start-button"
              onClick={onStart}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Analyze This Page</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>

            <motion.div
              className="features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <div className="feature">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span>LIFT Model</span>
              </div>
              <div className="feature">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M9 3H15M10 3V8.4C10 8.73137 9.89464 9.05391 9.7 9.32L5.3 15.68C4.55279 16.6868 5.27542 18 6.52 18H17.48C18.7246 18 19.4472 16.6868 18.7 15.68L14.3 9.32C14.1054 9.05391 14 8.73137 14 8.4V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span>A/B Tests</span>
              </div>
              <div className="feature">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 10V16M12 16L9 13M12 16L15 13M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span>PDF Export</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            className="history-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="history-header">
              <h2>Audit History</h2>
              <button className="refresh-button" onClick={loadHistory} disabled={loading}>
                <svg viewBox="0 0 24 24" fill="none" className={loading ? 'spinning' : ''}>
                  <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <HistoryList
              audits={history}
              onSelect={onLoadAudit}
              onDelete={handleDelete}
              onRefresh={loadHistory}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default StartScreen
