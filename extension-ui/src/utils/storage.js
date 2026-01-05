// Storage utility for audit history
// Uses localStorage in dev, chrome.storage in extension

const STORAGE_KEY = 'cro_audit_history'
const MAX_HISTORY = 50 // Keep last 50 audits

// Check if running in Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.storage

// Generate unique ID
function generateId() {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get all audits from storage
export async function getAuditHistory() {
  try {
    if (isExtension) {
      const result = await chrome.storage.local.get(STORAGE_KEY)
      return result[STORAGE_KEY] || []
    } else {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    }
  } catch (error) {
    console.error('Failed to get audit history:', error)
    return []
  }
}

// Save a new audit
export async function saveAudit(auditData) {
  try {
    const history = await getAuditHistory()

    const auditRecord = {
      id: generateId(),
      ...auditData,
      savedAt: new Date().toISOString(),
      isEdited: false
    }

    // Add to beginning of array
    history.unshift(auditRecord)

    // Keep only last MAX_HISTORY items
    const trimmedHistory = history.slice(0, MAX_HISTORY)

    if (isExtension) {
      await chrome.storage.local.set({ [STORAGE_KEY]: trimmedHistory })
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory))
    }

    return auditRecord
  } catch (error) {
    console.error('Failed to save audit:', error)
    throw error
  }
}

// Update an existing audit
export async function updateAudit(auditId, updates) {
  try {
    const history = await getAuditHistory()

    const index = history.findIndex(a => a.id === auditId)
    if (index === -1) {
      throw new Error('Audit not found')
    }

    history[index] = {
      ...history[index],
      ...updates,
      lastEditedAt: new Date().toISOString(),
      isEdited: true
    }

    if (isExtension) {
      await chrome.storage.local.set({ [STORAGE_KEY]: history })
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    }

    return history[index]
  } catch (error) {
    console.error('Failed to update audit:', error)
    throw error
  }
}

// Delete an audit
export async function deleteAudit(auditId) {
  try {
    const history = await getAuditHistory()
    const filtered = history.filter(a => a.id !== auditId)

    if (isExtension) {
      await chrome.storage.local.set({ [STORAGE_KEY]: filtered })
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    }

    return true
  } catch (error) {
    console.error('Failed to delete audit:', error)
    throw error
  }
}

// Get a single audit by ID
export async function getAuditById(auditId) {
  try {
    const history = await getAuditHistory()
    return history.find(a => a.id === auditId) || null
  } catch (error) {
    console.error('Failed to get audit:', error)
    return null
  }
}

// Clear all history
export async function clearHistory() {
  try {
    if (isExtension) {
      await chrome.storage.local.remove(STORAGE_KEY)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    return true
  } catch (error) {
    console.error('Failed to clear history:', error)
    throw error
  }
}
