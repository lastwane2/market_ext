import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from './components/Tabs';
import { AuditView } from './components/AuditView';
import { HistoryView } from './components/HistoryView';

function App() {
  const [activeTab, setActiveTab] = useState('audit');

  const handleAuditComplete = (audit) => {
    // Switch to history tab after audit completes
    setActiveTab('history');
  };

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-gray-50 overflow-hidden">
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              <AuditView onAuditComplete={handleAuditComplete} />
            </motion.div>
          )}
          
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-hidden"
            >
              <HistoryView onSelectAudit={handleAuditComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;

