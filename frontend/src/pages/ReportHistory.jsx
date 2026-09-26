// import { useEffect, useState } from 'react'
// import { Search, Filter, Download, Calendar, FileText, CheckCircle, Clock, XCircle, Eye, Loader2 } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'
// import api from '../api/client'
// import { ConfidenceBadge } from '../components/ConfidenceBadge'
// import { ExtractionPanel } from '../components/ExtractionPanel'
// import { WBSMatchCard } from '../components/WBSMatchCard'

// export function ReportHistory() {
//   const navigate = useNavigate()
//   const [reports, setReports] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [page, setPage] = useState(1)
//   const [total, setTotal] = useState(0)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [statusFilter, setStatusFilter] = useState('all')
//   const [selectedReport, setSelectedReport] = useState(null)
//   const [reportDetail, setReportDetail] = useState(null)

//   const pageSize = 20

//   useEffect(() => {
//     loadReports()
//   }, [page, statusFilter])

//   const loadReports = async () => {
//     setLoading(true)
//     try {
//       const res = await api.get('/reports', {
//         params: { page, page_size: pageSize, status: statusFilter !== 'all' ? statusFilter : undefined }
//       })
//       setReports(res.data.reports)
//       setTotal(res.data.total)
//     } catch (err) {
//       console.error(err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const viewReport = async (reportId) => {
//     try {
//       const [reportRes, extractionRes, matchesRes] = await Promise.all([
//         api.get(`/reports/${reportId}`),
//         api.get(`/reports/${reportId}/extraction`),
//         api.get(`/reports/${reportId}/matches`)
//       ])
//       setReportDetail({
//         report: reportRes.data,
//         extraction: extractionRes.data,
//         matches: matchesRes.data
//       })
//       setSelectedReport(reportId)
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   const getStatusBadge = (status) => {
//     const badges = {
//       completed: <CheckCircle className="w-4 h-4 text-success-500" />,
//       processing: <Clock className="w-4 h-4 text-warning-500" />,
//       failed: <XCircle className="w-4 h-4 text-danger-500" />,
//       pending: <Clock className="w-4 h-4 text-gray-400" />,
//     }
//     const labels = {
//       completed: 'Completed',
//       processing: 'Processing',
//       failed: 'Failed',
//       pending: 'Pending',
//     }
//     return (
//       <span className="inline-flex items-center gap-1 text-sm">
//         {badges[status]}
//         <span className={`font-medium ${
//           status === 'completed' ? 'text-success-700' :
//           status === 'processing' ? 'text-warning-700' :
//           status === 'failed' ? 'text-danger-700' : 'text-gray-600'
//         }`}>
//           {labels[status]}
//         </span>
//       </span>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Report History</h1>
//           <p className="text-gray-500 mt-1">View all submitted progress reports</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="btn-secondary">
//             <Download className="w-4 h-4 mr-2" strokeWidth={2} />
//             Export
//           </button>
//         </div>
//       </div>

//       <div className="card">
//         <div className="flex flex-col sm:flex-row gap-4 mb-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
//             <input
//               type="text"
//               placeholder="Search reports..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="input pl-10"
//             />
//           </div>
//           <select
//             value={statusFilter}
//             onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
//             className="input w-40"
//           >
//             <option value="all">All Status</option>
//             <option value="completed">Completed</option>
//             <option value="processing">Processing</option>
//             <option value="failed">Failed</option>
//             <option value="pending">Pending</option>
//           </select>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
//                 <th className="pb-3 font-medium">Source ID</th>
//                 <th className="pb-3 font-medium">Type</th>
//                 <th className="pb-3 font-medium">Supervisor</th>
//                 <th className="pb-3 font-medium">Submitted</th>
//                 <th className="pb-3 font-medium">Status</th>
//                 <th className="pb-3 font-medium"></th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {loading ? (
//                 <tr>
//                   <td colSpan={6} className="py-8 text-center">
//                     <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" strokeWidth={2} />
//                   </td>
//                 </tr>
//               ) : reports.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="py-8 text-center text-gray-500">No reports found</td>
//                 </tr>
//               ) : (
//                 reports.map((report, i) => (
//                   <tr key={report.id} className="hover:bg-gray-50">
//                     <td className="py-3 font-mono font-medium text-gray-900">{report.source_id}</td>
//                     <td className="py-3">
//                       <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{report.source_type}</span>
//                     </td>
//                     <td className="py-3 text-gray-700">{report.supervisor || '-'}</td>
//                     <td className="py-3 text-sm text-gray-500">
//                       {new Date(report.submitted_at).toLocaleString()}
//                     </td>
//                     <td className="py-3">{getStatusBadge(report.status)}</td>
//                     <td className="py-3">
//                       <button
//                         onClick={() => viewReport(report.id)}
//                         className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
//                       >
//                         <Eye className="w-4 h-4" strokeWidth={2} />
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
//           <p className="text-sm text-gray-500">
//             Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} reports
//           </p>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setPage(p => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="btn-secondary"
//             >
//               Previous
//             </button>
//             <button
//               onClick={() => setPage(p => p + 1)}
//               disabled={page * pageSize >= total}
//               className="btn-secondary"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {selectedReport && reportDetail && (
//         <div className="card animate-fade-in">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">{reportDetail.report.source_id}</h2>
//               <p className="text-gray-500">{reportDetail.report.source_type} • {reportDetail.report.supervisor} • {new Date(reportDetail.report.submitted_at).toLocaleString()}</p>
//             </div>
//             <button onClick={() => { setSelectedReport(null); setReportDetail(null) }} className="text-gray-500 hover:text-gray-700">
//               <XCircle className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <ExtractionPanel extraction={reportDetail.extraction} />

//             <div className="space-y-4">
//               <h3 className="font-semibold text-gray-900">WBS Matches</h3>
//               <div className="space-y-2">
//                 {reportDetail.matches?.map((match, i) => (
//                   <WBSMatchCard key={match.wbs_code} match={match} index={i} showDetails />
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-3">Raw Report Content</h3>
//             <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
//               {reportDetail.report.raw_content}
//             </pre>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }





import { useEffect, useState } from 'react'
import { Search, Filter, Download, Calendar, FileText, CheckCircle, Clock, XCircle, Eye, Loader2, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { ConfidenceBadge } from '../components/ConfidenceBadge'
import { ExtractionPanel } from '../components/ExtractionPanel'
import { WBSMatchCard } from '../components/WBSMatchCard'

export function ReportHistory() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportDetail, setReportDetail] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const pageSize = 20

  useEffect(() => {
    loadReports()
  }, [page, statusFilter])

  const loadReports = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports', {
        params: { page, page_size: pageSize, status: statusFilter !== 'all' ? statusFilter : undefined }
      })
      setReports(res.data.reports)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const viewReport = async (reportId) => {
    try {
      const reportRes = await api.get(`/reports/${reportId}`)
      let extraction = null
      let matches = []
      try { extraction = (await api.get(`/reports/${reportId}/extraction`)).data } catch (_) { }
      try { matches = (await api.get(`/reports/${reportId}/matches`)).data || [] } catch (_) { }
      setReportDetail({ report: reportRes.data, extraction, matches })
      setSelectedReport(reportId)
    } catch (err) {
      console.error(err)
    }
  }

  const openOriginal = (reportId) => {
    window.open(`/api/reports/${reportId}/file`, '_blank', 'noopener,noreferrer')
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: <CheckCircle className="w-4 h-4 text-success-500" />,
      processing: <Clock className="w-4 h-4 text-warning-500" />,
      failed: <XCircle className="w-4 h-4 text-danger-500" />,
      pending: <Clock className="w-4 h-4 text-gray-400" />,
    }
    const labels = {
      completed: 'Completed',
      processing: 'Processing',
      failed: 'Failed',
      pending: 'Pending',
    }
    return (
      <span className="inline-flex items-center gap-1 text-sm">
        {badges[status]}
        <span className={`font-medium ${status === 'completed' ? 'text-success-700' :
            status === 'processing' ? 'text-warning-700' :
              status === 'failed' ? 'text-danger-700' : 'text-gray-600'
          }`}>
          {labels[status]}
        </span>
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report History</h1>
          <p className="text-gray-500 mt-1">View all submitted progress reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" strokeWidth={2} />
            Export
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="input w-40"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                <th className="pb-3 font-medium">Source ID</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Supervisor</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" strokeWidth={2} />
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No reports found</td>
                </tr>
              ) : (
                reports.map((report, i) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono font-medium text-gray-900">{report.source_id}</td>
                    <td className="py-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{report.source_type}</span>
                    </td>
                    <td className="py-3 text-gray-700">{report.supervisor || '-'}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(report.submitted_at).toLocaleString()}
                    </td>
                    <td className="py-3">{getStatusBadge(report.status)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => viewReport(report.id)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" strokeWidth={2} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} reports
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= total}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedReport && reportDetail && (
        <div className="card animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{reportDetail.report.source_id}</h2>
              <p className="text-gray-500">{reportDetail.report.source_type} • {reportDetail.report.file_name || 'Text report'} • {reportDetail.report.supervisor || 'Unknown supervisor'}</p>
              <p className="text-sm text-gray-400 mt-1">{new Date(reportDetail.report.submitted_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              {reportDetail.report.file_name && <button onClick={() => openOriginal(selectedReport)} className="btn-secondary"><ExternalLink className="w-4 h-4 mr-2" />Open Original</button>}
              <button onClick={() => { setSelectedReport(null); setReportDetail(null); setPreviewOpen(false) }} className="text-gray-500 hover:text-gray-700"><XCircle className="w-5 h-5" /></button>
            </div>
          </div>

          {reportDetail.report.status === 'failed' && <div className="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger-700"><p className="font-medium">Processing failed for this report.</p><p className="text-sm mt-1">The original file and extracted document text are still available for inspection.</p></div>}

          {reportDetail.extraction ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExtractionPanel extraction={reportDetail.extraction} />
              <div className="space-y-4"><h3 className="font-semibold text-gray-900">WBS Matches</h3>{reportDetail.matches?.length ? <div className="space-y-2">{reportDetail.matches.map((match, i) => <WBSMatchCard key={match.wbs_code} match={match} index={i} showDetails />)}</div> : <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500">No WBS matches are available yet.</div>}</div>
            </div>
          ) : <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500">No structured extraction is available for this report yet.</div>}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-gray-900">Document Preview</h3><button onClick={() => setPreviewOpen(v => !v)} className="btn-secondary text-sm">{previewOpen ? 'Hide Preview' : 'View Extracted Content'}</button></div>
            {previewOpen && <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap overflow-auto max-h-96">{reportDetail.report.raw_content || 'No extracted text available.'}</pre>}
          </div>
        </div>
      )}
    </div>
  )
}