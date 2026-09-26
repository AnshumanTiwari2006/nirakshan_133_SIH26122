import { useEffect, useState } from 'react'
import { Search, Filter, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { ExtractionPanel } from '../components/ExtractionPanel'
import { ReviewPanel } from '../components/ReviewPanel'
import { ConfidenceBadge } from '../components/ConfidenceBadge'

export function ReviewQueue() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadQueue()
    if (searchParams.get('report')) {
      selectReport(searchParams.get('report'))
    }
  }, [searchParams.get('report')])

  const loadQueue = async () => {
    try {
      const res = await api.get('/review/queue')
      setQueue(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectReport = async (reportId) => {
    setSelectedReport(reportId)
    setReportData(null)

    try {
      const reportRes = await api.get(`/reports/${reportId}`)

      let extraction = null
      let matches = []

      try {
        const extractionRes = await api.get(`/reports/${reportId}/extraction`)
        extraction = extractionRes.data
      } catch (err) {
        console.warn('Extraction not available yet')
      }

      try {
        const matchesRes = await api.get(`/reports/${reportId}/matches`)
        matches = matchesRes.data || []
      } catch (err) {
        console.warn('Matches not available yet')
      }

      setReportData({
        report: reportRes.data,
        extraction,
        matches
      })

    } catch (err) {
      console.error('Failed to load report:', err)
    }
  }
  const handleApprove = async (wbsCode) => {
    setReviewLoading(true)
    try {
      await api.post('/review', {
        report_id: selectedReport,
        original_wbs: wbsCode,
        decision: 'approve',
        reviewer: 'Current User'
      })
      setSelectedReport(null)
      setReportData(null)
      loadQueue()
    } catch (err) {
      console.error(err)
    } finally {
      setReviewLoading(false)
    }
  }

  const handleCorrect = async (wbsCode) => {
    setReviewLoading(true)
    try {
      await api.post('/review', {
        report_id: selectedReport,
        original_wbs: reportData.matches[0]?.wbs_code,
        corrected_wbs: wbsCode,
        decision: 'correct',
        reviewer: 'Current User'
      })
      setSelectedReport(null)
      setReportData(null)
      loadQueue()
    } catch (err) {
      console.error(err)
    } finally {
      setReviewLoading(false)
    }
  }

  const handleReject = async () => {
    setReviewLoading(true)
    try {
      await api.post('/review', {
        report_id: selectedReport,
        original_wbs: reportData.matches[0]?.wbs_code,
        decision: 'reject',
        reviewer: 'Current User'
      })
      setSelectedReport(null)
      setReportData(null)
      loadQueue()
    } catch (err) {
      console.error(err)
    } finally {
      setReviewLoading(false)
    }
  }

  const filteredQueue = queue.filter(item =>
    item.source_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supervisor?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 flex">
      <div className="w-96 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Review Queue</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredQueue.length} reports pending</p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" strokeWidth={2} />
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p>No pending reviews</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredQueue.map(item => (
                <button
                  key={item.report_id}
                  onClick={() => selectReport(item.report_id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedReport === item.report_id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.source_id}</p>
                      <p className="text-sm text-gray-500">{item.supervisor}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(item.submitted_at).toLocaleString()}</p>
                    </div>
                    <ConfidenceBadge confidence={item.confidence} showLabel={false} />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Top match: <span className="font-mono font-medium">{item.top_match}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {selectedReport && reportData ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => { setSelectedReport(null); navigate('/review') }} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              </button>
              <h2 className="text-xl font-bold text-gray-900">Review Report</h2>
              <div className="w-10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-1">
                <ExtractionPanel extraction={reportData.extraction} />
                <div className="card border-warning-200 bg-warning-50">

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Review Required
                    </h3>

                    <span className="badge-warning">
                      {Math.round(
                        (reportData.matches?.[0]?.final_confidence || 0) * 100
                      )}%
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    This report requires human verification before the
                    schedule activity is updated.
                  </p>

                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Top WBS Candidate
                    </p>

                    <p className="font-mono font-medium text-gray-900 mt-1">
                      {reportData.matches?.[0]?.wbs_code || 'No match'}
                    </p>
                  </div>

                </div>
              </div>
              <div className="lg:col-span-1">
                <ReviewPanel
                  report={reportData.report}
                  matches={reportData.matches}
                  onApprove={handleApprove}
                  onCorrect={handleCorrect}
                  onReject={handleReject}
                  loading={reviewLoading}
                />
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">All Matches</h3>
              <div className="space-y-2">
                {reportData.matches?.map((match, i) => (
                  <div key={match.wbs_code} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-mono font-medium">{match.wbs_code}</p>
                      <p className="text-sm text-gray-600">{match.activity_name}</p>
                    </div>
                    <ConfidenceBadge confidence={match.final_confidence} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Select a report to review</h3>
              <p className="text-gray-500">Choose from the queue on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}