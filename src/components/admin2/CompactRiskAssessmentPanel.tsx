'use client'

import React, { useState } from 'react'

interface RiskData {
  level: number
  notes: string
}

interface Risk {
  key: string
  name: string
  description: string
  color: string
}

interface CompactRiskAssessmentPanelProps {
  allAvailableRisks: Risk[]
  riskProfile: Record<string, RiskData>
  onRiskSelectionChange: (riskKey: string, isSelected: boolean) => void
  onRiskLevelChange: (riskKey: string, level: number) => void
  onNotesChange: (riskKey: string, notes: string) => void
  isRiskSelected: (riskKey: string) => boolean
}

export function CompactRiskAssessmentPanel({
  allAvailableRisks,
  riskProfile,
  onRiskSelectionChange,
  onRiskLevelChange,
  onNotesChange,
  isRiskSelected
}: CompactRiskAssessmentPanelProps) {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null)
  const [notesBeingEdited, setNotesBeingEdited] = useState<Record<string, string>>({})

  const getRiskColor = (level: number) => {
    if (level >= 8) return 'bg-red-500 text-white'
    if (level >= 6) return 'bg-yellow-500 text-white'
    if (level >= 4) return 'bg-blue-500 text-white'
    return 'bg-green-500 text-white'
  }

  const handleNotesEdit = (riskKey: string, notes: string) => {
    setNotesBeingEdited(prev => ({ ...prev, [riskKey]: notes }))
  }

  const handleNotesSave = (riskKey: string) => {
    const newNotes = notesBeingEdited[riskKey] || ''
    onNotesChange(riskKey, newNotes)
    setNotesBeingEdited(prev => {
      const updated = { ...prev }
      delete updated[riskKey]
      return updated
    })
  }

  const handleNotesCancel = (riskKey: string) => {
    setNotesBeingEdited(prev => {
      const updated = { ...prev }
      delete updated[riskKey]
      return updated
    })
  }

  const CompactRiskCard = ({ risk }: { risk: Risk }) => {
    const isSelected = isRiskSelected(risk.key)
    const riskData = isSelected ? riskProfile[risk.key] : null
    const isExpanded = expandedRisk === risk.key
    const isEditingNotes = notesBeingEdited[risk.key] !== undefined

    return (
      <div className={`border rounded-lg transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-sm' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}>
        {/* Compact Header */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button
                onClick={() => onRiskSelectionChange(risk.key, !isSelected)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {isSelected && <span className="text-white text-xs">✓</span>}
              </button>
              
              <div className={`w-3 h-3 rounded-full ${risk.color} flex-shrink-0`}></div>
              
              <div className="min-w-0 flex-1">
                <h4 className={`text-sm font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                  {risk.name}
                </h4>
                <p className={`text-xs mt-0.5 truncate ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                  {risk.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {isSelected && riskData && (
                <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(riskData.level)}`}>
                  {riskData.level}/10
                </div>
              )}
              
              {isSelected && (
                <button
                  onClick={() => setExpandedRisk(isExpanded ? null : risk.key)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className={`text-xs transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Inline Risk Level Slider - Only when selected */}
          {isSelected && riskData && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Risk Level</span>
                <span className="text-xs text-gray-500">{riskData.level}/10</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">1</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={riskData.level}
                  onChange={(e) => onRiskLevelChange(risk.key, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${riskData.level * 10}%, #e5e7eb ${riskData.level * 10}%, #e5e7eb 100%)`
                  }}
                />
                <span className="text-xs text-gray-400">10</span>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Notes Section */}
        {isSelected && isExpanded && (
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Notes</span>
                {!isEditingNotes && riskData?.notes && (
                  <button
                    onClick={() => handleNotesEdit(risk.key, riskData.notes)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notesBeingEdited[risk.key] || ''}
                    onChange={(e) => handleNotesEdit(risk.key, e.target.value)}
                    placeholder="Add notes about this risk..."
                    className="w-full text-xs border border-gray-300 rounded p-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleNotesSave(risk.key)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleNotesCancel(risk.key)}
                      className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => handleNotesEdit(risk.key, riskData?.notes || '')}
                  className="cursor-text"
                >
                  {riskData?.notes ? (
                    <p className="text-xs text-gray-600 bg-white border border-gray-200 rounded p-2 min-h-[3rem]">
                      {riskData.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 bg-white border border-dashed border-gray-300 rounded p-2 min-h-[3rem] flex items-center">
                      Click to add notes...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const selectedRisks = allAvailableRisks.filter(risk => isRiskSelected(risk.key))
  const unselectedRisks = allAvailableRisks.filter(risk => !isRiskSelected(risk.key))

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Risk Assessment</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            Select risks and set levels - changes are saved automatically
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {selectedRisks.length} of {allAvailableRisks.length} risks selected
        </div>
      </div>

      {/* Quick Action Bar */}
      {selectedRisks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">Quick Actions:</span>
              <button
                onClick={() => setExpandedRisk(expandedRisk ? null : selectedRisks[0]?.key)}
                className="text-xs text-blue-700 hover:text-blue-900 underline"
              >
                {expandedRisk ? 'Collapse All' : 'Expand First'}
              </button>
            </div>
            <div className="text-xs text-blue-700">
              Avg Risk: {(selectedRisks.reduce((sum, risk) => sum + (riskProfile[risk.key]?.level || 0), 0) / selectedRisks.length).toFixed(1)}/10
            </div>
          </div>
        </div>
      )}

      {/* Selected Risks */}
      {selectedRisks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Active Risk Assessments</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedRisks.map(risk => (
              <CompactRiskCard key={risk.key} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {/* Available Risks */}
      {unselectedRisks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Available Risks
            <span className="text-xs text-gray-500 ml-2">
              ({unselectedRisks.length} available)
            </span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {unselectedRisks.map(risk => (
              <CompactRiskCard key={risk.key} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <span className="text-sm">💡</span>
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Tips for efficient risk assessment:</p>
            <ul className="space-y-0.5">
              <li>• Click the checkbox to select/deselect risks</li>
              <li>• Use the slider to quickly adjust risk levels</li>
              <li>• Click the arrow to expand and add detailed notes</li>
              <li>• Changes are automatically saved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


