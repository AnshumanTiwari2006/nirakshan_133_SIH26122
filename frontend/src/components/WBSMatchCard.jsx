import { ConfidenceBadge, ConfidenceBar } from './ConfidenceBadge'
import { ChevronDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function WBSMatchCard({ match, index, isSelected, onSelect, showDetails = false }) {
  const [expanded, setExpanded] = useState(false)
  
  const getStatusIcon = () => {
    if (match.final_confidence >= 0.9) return <CheckCircle className="w-5 h-5 text-success-500" />
    if (match.final_confidence >= 0.7) return <AlertCircle className="w-5 h-5 text-warning-500" />
    return <XCircle className="w-5 h-5 text-danger-500" />
  }
  
  return (
    <div className={`card relative ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-bold text-primary-700">{index + 1}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 truncate">{match.wbs_code}</h4>
              <p className="text-sm text-gray-600 mt-0.5">{match.activity_name}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <ConfidenceBadge confidence={match.final_confidence} />
              {onSelect && (
                <button
                  onClick={() => onSelect(match.wbs_code)}
                  className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <CheckCircle className="w-5 h-5" fill="currentColor" />
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{match.discipline}</span>
            </span>
            <ConfidenceBar confidence={match.final_confidence} height={6} className="flex-1 max-w-xs" />
          </div>
          
          {showDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {expanded ? 'Hide details' : 'Show details'}
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
          
          {expanded && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Semantic Similarity</p>
                  <ConfidenceBar confidence={match.semantic_score} />
                  <p className="text-right text-xs text-gray-500 mt-1">{Math.round(match.semantic_score * 100)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Discipline Match</p>
                  <ConfidenceBar confidence={match.discipline_score} />
                  <p className="text-right text-xs text-gray-500 mt-1">{Math.round(match.discipline_score * 100)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Asset Match</p>
                  <ConfidenceBar confidence={match.asset_score} />
                  <p className="text-right text-xs text-gray-500 mt-1">{Math.round(match.asset_score * 100)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Action Match</p>
                  <ConfidenceBar confidence={match.action_score} />
                  <p className="text-right text-xs text-gray-500 mt-1">{Math.round(match.action_score * 100)}%</p>
                </div>
              </div>
              
              {match.explanation && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-500">AI Explanation:</p>
                  <p className="text-sm text-gray-700 mt-1">{match.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
      </div>
    </div>
  )
}