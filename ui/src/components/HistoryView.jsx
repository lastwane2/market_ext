import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink } from 'lucide-react';
import { loadState, saveState } from '../lib/storage';
import { AuditDetails } from './AuditDetails';
import { Toast } from './Toast';

export function HistoryView({ onSelectAudit }) {
  const [history, setHistory] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const state = await loadState();
    setHistory(state.history || []);
    // Don't auto-open any audit - always show list view
    setSelectedAudit(null);
  };

  const clearHistory = async () => {
    await saveState({ history: [], currentAudit: null, lastViewedId: null });
    setHistory([]);
    setSelectedAudit(null);
    setToast({ visible: true, message: 'History cleared', type: 'success' });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 2000);
  };

  const selectAudit = async (audit) => {
    setSelectedAudit(audit);
    await saveState({ lastViewedId: audit.id });
    if (onSelectAudit) {
      onSelectAudit(audit);
    }
  };

  const getStatusBadge = (audit) => {
    if (audit.clarityScore >= 8 && audit.confidence >= 8) {
      return { label: 'Good', className: 'badge-success' };
    }
    if (audit.clarityScore >= 6 && audit.confidence >= 6) {
      return { label: 'Needs work', className: 'badge-warning' };
    }
    return { label: 'Poor', className: 'badge-error' };
  };

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return {
        domain: urlObj.hostname,
        path: urlObj.pathname,
      };
    } catch {
      return { domain: url, path: '' };
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (selectedAudit) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setSelectedAudit(null)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            ← Back to History
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AuditDetails audit={selectedAudit} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ visible: false, message: '', type: 'success' })}
      />

      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Audit History</h2>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No audit history yet.</p>
            <p className="text-xs mt-2">Run an audit to see results here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {history.map((audit) => {
                const { domain, path } = formatUrl(audit.url || '');
                const status = getStatusBadge(audit);
                
                return (
                  <motion.div
                    key={audit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => selectAudit(audit)}
                    className="card cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {domain}
                          </span>
                          <span className={`badge ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        {path && (
                          <div className="text-xs text-gray-500 truncate mb-2">
                            {path}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Goal: {audit.primaryGoal}</span>
                          <span>Clarity: {audit.clarityScore}/10</span>
                          <span>Confidence: {audit.confidence}/10</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(audit.createdAt)}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

