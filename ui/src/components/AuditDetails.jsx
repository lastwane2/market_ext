import { useState } from 'react';
import { ExternalLink, Copy } from 'lucide-react';
import { Toast } from './Toast';

export function AuditDetails({ audit }) {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  if (!audit) return null;

  const formatUrl = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const openSourcePage = () => {
    if (audit.url) {
      chrome.tabs.create({ url: audit.url });
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type }), 3000);
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Audit Details</h2>
          {audit.url && (
            <button
              onClick={openSourcePage}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              {formatUrl(audit.url)}
            </button>
          )}
        </div>
        <button
          onClick={copyReport}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy Report
        </button>
      </div>

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

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-2">Target Audience</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{audit.targetAudience}</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-2">Core Offer</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{audit.coreOffer}</p>
      </div>

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
    </div>
  );
}

