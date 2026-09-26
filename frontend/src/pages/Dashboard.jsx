import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, FileText, CheckCircle, Clock, XCircle, BarChart3, Users } from 'lucide-react'
import api from '../api/client'
import { ConfidenceBadge, ConfidenceBar } from '../components/ConfidenceBadge'
import { ProgressTimeline } from '../components/ProgressTimeline'

const statCards = [
  { name: 'Reports Today', value: '45', change: '+12%', trend: 'up', icon: FileText, color: 'primary' },
  { name: 'Processed', value: '41', change: '+8%', trend: 'up', icon: CheckCircle, color: 'success' },
  { name: 'Auto Approved', value: '29', change: '+5%', trend: 'up', icon: CheckCircle, color: 'primary' },
  { name: 'Human Review', value: '10', change: '-2%', trend: 'down', icon: Clock, color: 'warning' },
  { name: 'Rejected', value: '2', change: '0%', trend: 'flat', icon: XCircle, color: 'danger' },
]

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Site progress monitoring overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats?.stats && [
          { name: 'Reports Today', value: stats.stats.reports_today, icon: FileText, color: 'primary' },
          { name: 'Processed', value: stats.stats.processed, icon: CheckCircle, color: 'success' },
          { name: 'Auto Approved', value: stats.stats.auto_approved, icon: CheckCircle, color: 'primary' },
          { name: 'Human Review', value: stats.stats.human_review, icon: Clock, color: 'warning' },
          { name: 'Rejected', value: stats.stats.rejected, icon: XCircle, color: 'danger' },
        ].map((stat, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} strokeWidth={2} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Confidence Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Confidence</span>
                <span className="font-medium">{stats?.stats?.average_confidence || 91.4}%</span>
              </div>
              <ConfidenceBar confidence={(stats?.stats?.average_confidence || 91.4) / 100} height={8} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>WBS Match Accuracy</span>
                <span className="font-medium">{stats?.stats?.wbs_match_accuracy || 89.7}%</span>
              </div>
              <ConfidenceBar confidence={(stats?.stats?.wbs_match_accuracy || 89.7) / 100} height={8} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Confidence Distribution</h3>
          <div className="space-y-3">
            {stats?.confidence_distribution?.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-20 text-sm text-gray-600">{item.range}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.range.includes('90') ? 'bg-success-500' :
                      item.range.includes('80') || item.range.includes('70') ? 'bg-warning-500' : 'bg-danger-500'
                      }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-16 text-sm text-gray-500 text-right">{item.count} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Discipline Distribution</h3>
          <div className="space-y-3">
            {stats?.discipline_distribution?.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-32 text-sm text-gray-600 capitalize">{item.discipline}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full rounded-full transition-all duration-500" style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="w-16 text-sm text-gray-500 text-right">{item.count} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Processing Trend (7 days)</h3>
          <div className="space-y-3">
            {stats?.processing_trend?.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-24 text-sm text-gray-600">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(5, (item.processed / 50) * 100)}%` }} />
                </div>
                <span className="w-16 text-sm text-gray-500 text-right">{item.processed}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pending Reviews</h3>
            <span className="badge-warning">{stats?.pending_reviews?.length || 0} pending</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats?.pending_reviews?.map((review, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{review.source_id}</p>
                    <p className="text-sm text-gray-500">{review.supervisor} • {Math.round(review.confidence * 100)}% confidence</p>
                  </div>
                  <ConfidenceBadge confidence={review.confidence} />
                </div>
              </div>
            ))}
            {(!stats?.pending_reviews?.length) && (
              <div className="text-center py-8 text-gray-500">No pending reviews</div>
            )}
          </div>
        </div>

        <ProgressTimeline updates={stats?.recent_updates || []} />
      </div>
    </div>
  )
}