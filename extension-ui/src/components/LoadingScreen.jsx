import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import './LoadingScreen.css'

const loadingSteps = [
  'Scanning page...',
  'Analyzing headlines...',
  'Checking CTA elements...',
  'Evaluating trust signals...',
  'Generating recommendations...'
]

function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % loadingSteps.length)
    }, 600)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-content">
        <motion.div
          className="loader"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="loader-ring">
            <svg viewBox="0 0 100 100">
              <circle
                className="loader-track"
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="6"
              />
              <motion.circle
                className="loader-progress"
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </svg>
          </div>
          <div className="loader-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.div>

        <motion.h2
          className="loading-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          AI is analyzing the page
        </motion.h2>

        <motion.div
          className="loading-step"
          key={currentStep}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {loadingSteps[currentStep]}
        </motion.div>

        <div className="loading-dots">
          {loadingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`dot ${index === currentStep ? 'active' : ''}`}
              animate={{
                scale: index === currentStep ? 1.2 : 1,
                opacity: index === currentStep ? 1 : 0.3
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default LoadingScreen
