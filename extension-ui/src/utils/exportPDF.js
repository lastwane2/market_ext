import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Colors
const COLORS = {
  primary: [99, 102, 241],      // Accent purple
  success: [34, 197, 94],       // Green
  warning: [245, 158, 11],      // Orange
  error: [239, 68, 68],         // Red
  dark: [26, 26, 36],           // Dark bg
  text: [255, 255, 255],        // White
  textMuted: [113, 113, 122],   // Gray
  border: [50, 50, 60]          // Border
}

function getScoreColor(score) {
  if (score >= 80) return COLORS.success
  if (score >= 60) return COLORS.warning
  return COLORS.error
}

function getStatusColor(status) {
  if (status === 'pass') return COLORS.success
  if (status === 'fail') return COLORS.error
  return COLORS.warning
}

export function exportAuditToPDF(data) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPos = margin

  // Helper to add new page if needed
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // ========== HEADER ==========
  doc.setFillColor(...COLORS.dark)
  doc.rect(0, 0, pageWidth, 45, 'F')

  doc.setTextColor(...COLORS.text)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('CRO Audit Report', margin, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.textMuted)
  doc.text(data.url || 'Unknown URL', margin, 28)

  const date = new Date(data.analyzedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Generated: ${date}`, margin, 35)

  // Overall Score (right side of header)
  const scoreX = pageWidth - margin - 25
  doc.setFillColor(...getScoreColor(data.overallScore))
  doc.circle(scoreX, 25, 15, 'F')
  doc.setTextColor(...COLORS.text)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(String(data.overallScore), scoreX, 27, { align: 'center' })
  doc.setFontSize(8)
  doc.text('SCORE', scoreX, 33, { align: 'center' })

  yPos = 55

  // ========== LIFT MODEL SCORES ==========
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('LIFT Model Breakdown', margin, yPos)
  yPos += 8

  const categories = Object.values(data.liftCategories || {})
  const barHeight = 6
  const barWidth = 80
  const labelWidth = 50

  categories.forEach((cat, index) => {
    checkPageBreak(15)

    const rowY = yPos + (index * 12)

    // Label
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.dark)
    const label = `${cat.shortName} - ${cat.name}${cat.isInhibitor ? ' (Inhibitor)' : ''}`
    doc.text(label, margin, rowY + 4)

    // Bar background
    doc.setFillColor(230, 230, 235)
    doc.roundedRect(margin + labelWidth, rowY, barWidth, barHeight, 1, 1, 'F')

    // Bar fill
    const fillWidth = (cat.score / 100) * barWidth
    doc.setFillColor(...getScoreColor(cat.score))
    doc.roundedRect(margin + labelWidth, rowY, fillWidth, barHeight, 1, 1, 'F')

    // Score
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(String(cat.score), margin + labelWidth + barWidth + 5, rowY + 4)
  })

  yPos += (categories.length * 12) + 15

  // ========== CRITICAL ISSUES ==========
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.error)
  doc.text('Critical Issues', margin, yPos)
  yPos += 8

  if (data.criticalIssues && data.criticalIssues.length > 0) {
    data.criticalIssues.forEach((issue, index) => {
      checkPageBreak(15)

      doc.setFillColor(255, 240, 240)
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 12, 2, 2, 'F')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.error)
      doc.text(issue.category.toUpperCase(), margin + 3, yPos + 4)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.dark)
      doc.text(issue.title, margin + 3, yPos + 9)

      yPos += 14
    })
  } else {
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.textMuted)
    doc.text('No critical issues found', margin, yPos)
    yPos += 10
  }

  yPos += 10

  // ========== QUICK WINS ==========
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.success)
  doc.text('Quick Wins', margin, yPos)
  yPos += 8

  if (data.quickWins && data.quickWins.length > 0) {
    data.quickWins.forEach((win, index) => {
      checkPageBreak(20)

      doc.setFillColor(240, 255, 245)
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 16, 2, 2, 'F')

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.dark)
      doc.text(win.title, margin + 3, yPos + 5)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.textMuted)
      doc.text(`Current: ${win.current}`, margin + 3, yPos + 10)

      doc.setTextColor(...COLORS.success)
      doc.text(`Suggested: ${win.suggested}`, margin + 3, yPos + 14)

      yPos += 18
    })
  }

  yPos += 10

  // ========== DETAILED FINDINGS ==========
  doc.addPage()
  yPos = margin

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.dark)
  doc.text('Detailed Findings by Category', margin, yPos)
  yPos += 12

  Object.entries(data.liftCategories || {}).forEach(([key, category]) => {
    checkPageBreak(30)

    // Category header
    doc.setFillColor(...getScoreColor(category.score))
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 10, 2, 2, 'F')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.text)
    doc.text(`${category.name} (${category.score}/100)`, margin + 3, yPos + 7)

    yPos += 14

    // Assertions
    if (category.assertions && category.assertions.length > 0) {
      category.assertions.forEach((assertion) => {
        checkPageBreak(25)

        // Status indicator
        const statusColor = getStatusColor(assertion.status)
        doc.setFillColor(...statusColor)
        doc.circle(margin + 3, yPos + 2, 2, 'F')

        // Assertion name
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...COLORS.dark)
        doc.text(assertion.name, margin + 8, yPos + 3)

        // Severity badge
        const severityX = pageWidth - margin - 15
        doc.setFontSize(7)
        doc.setTextColor(...COLORS.textMuted)
        doc.text(assertion.severity.toUpperCase(), severityX, yPos + 3)

        yPos += 6

        // Evidence
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...COLORS.textMuted)
        const evidenceLines = doc.splitTextToSize(assertion.evidence || 'No evidence', pageWidth - (margin * 2) - 10)
        doc.text(evidenceLines, margin + 8, yPos)
        yPos += (evidenceLines.length * 3.5) + 2

        // Recommendation (if failed)
        if (assertion.recommendation && assertion.status !== 'pass') {
          doc.setTextColor(...COLORS.primary)
          doc.setFont('helvetica', 'italic')
          const recLines = doc.splitTextToSize(`Recommendation: ${assertion.recommendation}`, pageWidth - (margin * 2) - 10)
          doc.text(recLines, margin + 8, yPos)
          yPos += (recLines.length * 3.5) + 2
        }

        yPos += 4
      })
    }

    yPos += 8
  })

  // ========== A/B TEST RECOMMENDATIONS ==========
  if (data.tests && data.tests.length > 0) {
    doc.addPage()
    yPos = margin

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.dark)
    doc.text('A/B Test Recommendations', margin, yPos)
    yPos += 5

    doc.setFontSize(9)
    doc.setTextColor(...COLORS.textMuted)
    doc.text('Prioritized by PXL Score (Evidence-Based Prioritization)', margin, yPos + 5)
    yPos += 15

    data.tests.forEach((test, index) => {
      checkPageBreak(50)

      // Test card
      const cardHeight = 40
      doc.setFillColor(250, 250, 255)
      doc.setDrawColor(...COLORS.border)
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), cardHeight, 2, 2, 'FD')

      // Priority indicator
      const priorityColor = test.priority === 'critical' ? COLORS.error :
                           test.priority === 'high' ? COLORS.warning : COLORS.textMuted
      doc.setFillColor(...priorityColor)
      doc.rect(margin, yPos, 3, cardHeight, 'F')

      // Rank
      doc.setFillColor(240, 240, 245)
      doc.circle(margin + 12, yPos + 10, 6, 'F')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.dark)
      doc.text(String(index + 1), margin + 12, yPos + 12, { align: 'center' })

      // Title
      doc.setFontSize(11)
      doc.text(test.title, margin + 22, yPos + 8)

      // Category & Priority
      doc.setFontSize(8)
      doc.setTextColor(...COLORS.textMuted)
      doc.text(`${test.category} • ${test.priority.toUpperCase()}`, margin + 22, yPos + 14)

      // PXL Score
      doc.setFillColor(...COLORS.primary)
      doc.roundedRect(pageWidth - margin - 25, yPos + 5, 20, 12, 2, 2, 'F')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.text)
      doc.text(String(test.pxlScore), pageWidth - margin - 15, yPos + 13, { align: 'center' })
      doc.setFontSize(6)
      doc.text('PXL', pageWidth - margin - 15, yPos + 18, { align: 'center' })

      // Hypothesis
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.dark)
      const hypLines = doc.splitTextToSize(test.hypothesis, pageWidth - (margin * 2) - 35)
      doc.text(hypLines.slice(0, 2), margin + 22, yPos + 22)

      // Variants preview
      if (test.variants && test.variants.length > 0) {
        doc.setFontSize(7)
        doc.setTextColor(...COLORS.textMuted)
        const variantText = test.variants.map(v => v.name).join(' vs ')
        doc.text(`Variants: ${variantText}`, margin + 22, yPos + 36)
      }

      yPos += cardHeight + 8
    })
  }

  // ========== FOOTER ON ALL PAGES ==========
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(
      `CRO Audit Report • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    )
  }

  // Save
  const filename = `cro-audit-${new URL(data.url || 'https://unknown.com').hostname}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)

  return filename
}
