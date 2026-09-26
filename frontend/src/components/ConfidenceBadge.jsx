import React from 'react'

export function ConfidenceBadge({ confidence, showLabel = true }) {
  const c = Math.round(confidence * 100)

  let variant, label
  if (confidence >= 0.9) {
    variant = 'badge-success'
    label = 'HIGH'
  } else if (confidence >= 0.7) {
    variant = 'badge-warning'
    label = 'MEDIUM'
  } else {
    variant = 'badge-danger'
    label = 'LOW'
  }

  return (
    <span className={`inline-flex items-center gap-1 ${variant}`}>
      <span className="font-mono font-bold">{c}%</span>
      {showLabel && <span>{label}</span>}
    </span>
  )
}

export function ConfidenceBar({ confidence, height = 8 }) {
  const percentage = Math.round(confidence * 100)

  let color
  if (confidence >= 0.9) color = 'bg-success-500'
  else if (confidence >= 0.7) color = 'bg-warning-500'
  else color = 'bg-danger-500'

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`${color} h-full rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}