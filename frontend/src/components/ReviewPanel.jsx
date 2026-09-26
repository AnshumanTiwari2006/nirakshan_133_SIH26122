import { useState } from 'react'
import { WBSMatchCard } from './WBSMatchCard'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export function ReviewPanel({ report, matches, onApprove, onCorrect, onReject, loading }) {
  const [selectedWbs, setSelectedWbs] = useState(null)
  const [showCorrect, setShowCorrect] = useState(false)
  const [customWbs, setCustomWbs] = useState('')

  const topMatch = matches[0]
  const confidence = topMatch?.final_confidence || 0

  const getConfidenceClass = () => {
    if (confidence >= 0.9) return 'bg-success-50 border-success-200'
    if (confidence >= 0.7) return 'bg-warning-50 border-warning-200'
    return 'bg-danger-50 border-danger-200'
  }

  const getConfidenceText = () => {
    if (confidence >= 0.9) return 'HIGH CONFIDENCE - Auto-approval recommended'
    if (confidence >= 0.7) return 'MEDIUM CONFIDENCE - Human review required'
    return 'LOW CONFIDENCE - Manual verification needed'
  }

  const getConfidenceIcon = () => {
    if (confidence >= 0.9) return <CheckCircle className="w-5 h-5 text-success-500" />
    if (confidence >= 0.7) return <AlertCircle className="w-5 h-5 text-warning-500" />
    return <XCircle className="w-5 h-5 text-danger-500" />
  }

  return (
    <div className={`card border ${getConfidenceClass()}`}>
      <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg">
        {getConfidenceIcon()}
        <div>
          <p className="font-medium text-gray-900">{getConfidenceText()}</p>
          <p className="text-sm text-gray-500">Confidence: {Math.round(confidence * 100)}%</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {matches.map((match, i) => (
          <WBSMatchCard
            key={match.wbs_code}
            match={match}
            index={i}
            isSelected={selectedWbs === match.wbs_code}
            onSelect={setSelectedWbs}
            showDetails
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => onApprove(selectedWbs || topMatch?.wbs_code)}
          disabled={loading || !topMatch}
          className="btn-success flex-1 min-w-[120px]"
        >
          Approve
        </button>

        <button
          onClick={() => setShowCorrect(!showCorrect)}
          disabled={loading}
          className="btn-warning flex-1 min-w-[120px]"
        >
          Correct
        </button>

        <button
          onClick={() => onReject()}
          disabled={loading}
          className="btn-danger flex-1 min-w-[120px]"
        >
          Reject
        </button>
      </div>

      {showCorrect && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <p className="text-sm font-medium text-gray-700">Select correct WBS code:</p>
          <input
            type="text"
            value={customWbs}
            onChange={(e) => setCustomWbs(e.target.value)}
            placeholder="e.g., EL-PMP-0045"
            className="input font-mono"
          />
          <button
            onClick={() => onCorrect(customWbs)}
            disabled={loading || !customWbs}
            className="btn-primary w-full"
          >
            Confirm Correction
          </button>
        </div>
      )}
    </div>
  )
}