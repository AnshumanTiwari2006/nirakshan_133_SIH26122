import React from 'react'
import { ConfidenceBadge, ConfidenceBar } from './ConfidenceBadge'

export function ExtractionPanel({ extraction }) {
  if (!extraction) return null

  const fields = [
    {
      label: 'Discipline',
      value: extraction.discipline || 'Not extracted'
    },
    {
      label: 'Asset',
      value: extraction.asset || 'Not extracted'
    },
    {
      label: 'Action',
      value: extraction.action || 'Not extracted'
    },
    {
      label: 'Location',
      value: extraction.location || 'Not extracted'
    },
    {
      label: 'Start Time',
      value: extraction.start_time || 'Not extracted'
    },
    {
      label: 'End Time',
      value: extraction.end_time || 'Not extracted'
    },
    {
      label: 'Quantity',
      value: extraction.quantity
        ? `${extraction.quantity} ${extraction.unit || ''}`
        : 'Not extracted'
    },
    {
      label: 'Status',
      value: extraction.completion_status || 'Not extracted'
    },
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Extracted Information</h3>
        <ConfidenceBadge confidence={extraction.confidence} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, i) => (
          <div
            key={i}
            className="p-3 bg-gray-50 rounded-lg"
          >
            <p className="text-xs text-gray-500 mb-1">
              {field.label}
            </p>

            <p
              className={`font-medium ${field.value === 'Not extracted'
                  ? 'text-gray-400'
                  : 'text-gray-900'
                }`}
            >
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}