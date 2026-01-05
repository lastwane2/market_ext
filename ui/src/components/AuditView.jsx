import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { AuditSkeleton } from './Skeleton';
import { getActiveTab, saveState, loadState } from '../lib/storage';
import { Toast } from './Toast';

export function AuditView({ onAuditComplete }) {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [improved, setImproved] = useState(false);

  useEffect(() => {
    // Get current tab URL only - don't restore previous audit
    // Each popup open should start fresh with "Run Audit" button
    getActiveTab()
      .then((tab) => setCurrentUrl(tab.url || ''))
      .catch(() => setCurrentUrl(''));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type }), 3000);
  };

  const runAudit = async () => {
    setLoading(true);
    setAudit(null);
    setImproved(false);

    try {
      chrome.runtime.sendMessage({ action: 'analyzePage' }, (response) => {
        if (chrome.runtime.lastError) {
          showToast(chrome.runtime.lastError.message, 'error');
          setLoading(false);
          return;
        }

        if (response.error) {
          showToast(response.error, 'error');
          setLoading(false);
          return;
        }

        if (response.success && response.audit) {
          const auditData = {
            ...response.audit,
            id: `audit-${Date.now()}`,
            url: currentUrl || window.location.href,
            createdAt: Date.now(),
          };

          setAudit(auditData);
          setImproved(auditData._improved || false);

          // Save to storage
          loadState().then((state) => {
            const history = [auditData, ...(state.history || [])].slice(0, 50); // Keep last 50
            saveState({ currentAudit: auditData, history });
          });

          if (onAuditComplete) {
            onAuditComplete(auditData);
          }

          showToast('Analysis complete!', 'success');
        }

        setLoading(false);
      });
    } catch (error) {
      showToast(error.message, 'error');
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!audit) return;

    const report = formatReport(audit);
    navigator.clipboard.writeText(report).then(() => {
      showToast('Report copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy report', 'error');
    });
  };

  const openSourcePage = () => {
    if (currentUrl) {
      chrome.tabs.create({ url: currentUrl });
    }
  };

  const formatReport = (audit) => {
    let report = 'AI LANDING PAGE AUDIT REPORT\n';
    report += '='.repeat(50) + '\n\n';
    
    report += `Page Type: ${audit.pageType}\n`;
    report += `Primary Goal: ${audit.primaryGoal}\n`;
    report += `Confidence: ${audit.confidence}/10\n\n`;
    
    report += 'TARGET AUDIENCE\n';
    report += '-'.repeat(50) + '\n';
    report += audit.targetAudience + '\n\n';
    
    report += 'CORE OFFER\n';
    report += '-'.repeat(50) + '\n';
    report += audit.coreOffer + '\n\n';
    
    report += `CLARITY SCORE: ${audit.clarityScore}/10\n`;
    report += '-'.repeat(50) + '\n';
    audit.clarityNotes.forEach(note => {
      report += `• ${note}\n`;
    });
    report += '\n';
    
    report += 'CONVERSION ISSUES\n';
    report += '-'.repeat(50) + '\n';
    audit.conversionIssues.forEach((issue, i) => {
      report += `${i + 1}. ${issue}\n`;
    });
    report += '\n';
    
    report += 'QUICK WINS\n';
    report += '-'.repeat(50) + '\n';
    audit.quickWins.forEach((win, i) => {
      report += `${i + 1}. ${win}\n`;
    });
    report += '\n';
    
    report += 'COPY SUGGESTIONS\n';
    report += '-'.repeat(50) + '\n';
    report += `Headline: ${audit.copySuggestions.headline}\n`;
    report += `Subheadline: ${audit.copySuggestions.subheadline}\n`;
    report += `CTA: ${audit.copySuggestions.cta}\n\n`;
    
    if (audit.assumptions && audit.assumptions.length > 0) {
      report += 'ASSUMPTIONS\n';
      report += '-'.repeat(50) + '\n';
      audit.assumptions.forEach(assumption => {
        report += `• ${assumption}\n`;
      });
      report += '\n';
    }
    
    return report;
  };

  return (
    <div className="p-4 space-y-4">
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ visible: false, message: '', type: 'success' })}
      />

      {improved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Initial audit quality was low. Audit was automatically improved.</span>
        </motion.div>
      )}

      {!audit && !loading && (
        <div className="text-center py-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runAudit}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium shadow-sm hover:bg-primary-700 transition-colors"
          >
            <Play className="w-5 h-5" />
            Run Audit
          </motion.button>
          {currentUrl && (
            <p className="mt-3 text-sm text-gray-500">
              Analyzing: {new URL(currentUrl).hostname}
            </p>
          )}
        </div>
      )}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8"
        >
          <AuditSkeleton />
        </motion.div>
      )}

      {audit && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Audit Results</h2>
              {currentUrl && (
                <button
                  onClick={openSourcePage}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open source page
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyReport}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Report
              </button>
              <button
                onClick={runAudit}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Re-run
              </button>
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <div className="text-xs text-gray-500 mb-1">Clarity Score</div>
              <div className="text-2xl font-bold text-gray-900">{audit.clarityScore}/10</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-500 mb-1">Confidence</div>
              <div className="text-2xl font-bold text-gray-900">{audit.confidence}/10</div>
            </div>
          </div>

          {/* Sections */}
          <Section title="Target Audience" content={audit.targetAudience} />
          <Section title="Core Offer" content={audit.coreOffer} />
          
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Clarity Notes</h3>
            <ul className="space-y-2">
              {audit.clarityNotes.map((note, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Conversion Issues</h3>
            <ol className="space-y-3">
              {audit.conversionIssues.map((issue, i) => (
                <li key={i} className="text-sm text-gray-700">
                  <span className="font-medium text-primary-600">{i + 1}.</span> {issue}
                </li>
              ))}
            </ol>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Wins</h3>
            <ol className="space-y-2">
              {audit.quickWins.map((win, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="font-medium text-green-600 mt-1">{i + 1}.</span>
                  <span>{win}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Copy Suggestions</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Headline</div>
                <div className="text-sm font-medium text-gray-900">{audit.copySuggestions.headline}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Subheadline</div>
                <div className="text-sm font-medium text-gray-900">{audit.copySuggestions.subheadline}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">CTA</div>
                <div className="text-sm font-medium text-gray-900">{audit.copySuggestions.cta}</div>
              </div>
            </div>
          </div>

          {audit.assumptions && audit.assumptions.length > 0 && (
            <div className="card bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3">Assumptions</h3>
              <ul className="space-y-2">
                {audit.assumptions.map((assumption, i) => (
                  <li key={i} className="text-sm text-yellow-800 flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Section({ title, content }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}

