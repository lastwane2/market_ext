import { motion } from 'framer-motion';
import { FileText, History } from 'lucide-react';

export function Tabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'audit', label: 'Audit', icon: FileText },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="flex border-b border-gray-200 bg-white">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                initial={false}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

