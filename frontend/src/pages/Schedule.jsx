import { useEffect, useState } from 'react'
import { Search, Filter, Download, Calendar, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import api from '../api/client'
import { ConfidenceBadge } from '../components/ConfidenceBadge'
import { ProgressTimeline } from '../components/ProgressTimeline'

export function Schedule() {
  const [schedule, setSchedule] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [disciplineFilter, setDisciplineFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadSchedule()
    loadSummary()
  }, [])

  const loadSchedule = async () => {
    try {
      const res = await api.get('/schedule')
      setSchedule(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const res = await api.get('/schedule/summary')
      setSummary(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadHistory = async (wbsCode) => {
    try {
      const res = await api.get(`/schedule/${wbsCode}/history`)
      setHistory(res.data)
      setSelectedActivity(wbsCode)
    } catch (err) {
      console.error(err)
    }
  }

  const disciplines = [...new Set(schedule.map(s => s.discipline))].sort()

  const filteredSchedule = schedule.filter(item => {
    const matchesSearch = item.wbs_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.activity_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDiscipline = disciplineFilter === 'all' || item.discipline === disciplineFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesDiscipline && matchesStatus
  })

  const getStatusBadge = (status) => {
    if (status === 'Completed') return <span className="badge-success">{status}</span>
    if (status === 'In Progress') return <span className="badge-warning">{status}</span>
    return <span className="badge">{status}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Schedule</h1>
          <p className="text-gray-500 mt-1">Track progress across all WBS activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" strokeWidth={2} />
            Export
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500">Total Activities</p>
            <p className="text-3xl font-bold text-gray-900">{summary.total_activities}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-success-600">{summary.completed}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-3xl font-bold text-warning-600">{summary.in_progress}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-3xl font-bold text-primary-600">{(summary.completion_rate * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search WBS code or activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="input w-48"
          >
            <option value="all">All Disciplines</option>
            {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Started">Not Started</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                <th className="pb-3 font-medium">WBS Code</th>
                <th className="pb-3 font-medium">Activity</th>
                <th className="pb-3 font-medium">Discipline</th>
                <th className="pb-3 font-medium">Planned</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actual Finish</th>
                <th className="pb-3 font-medium">Approved By</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" strokeWidth={2} />
                  </td>
                </tr>
              ) : filteredSchedule.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">No activities found</td>
                </tr>
              ) : (
                filteredSchedule.map((item, i) => (
                  <tr key={item.wbs_code} className={`hover:bg-gray-50 ${selectedActivity === item.wbs_code ? 'bg-primary-50' : ''}`}>
                    <td className="py-3 font-mono font-medium text-gray-900">{item.wbs_code}</td>
                    <td className="py-3 text-gray-700 max-w-xs truncate">{item.activity_name}</td>
                    <td className="py-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.discipline}</span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {item.planned_start && item.planned_finish ? (
                        <>
                          {new Date(item.planned_start).toLocaleDateString()} - {new Date(item.planned_finish).toLocaleDateString()}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3">{getStatusBadge(item.status)}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {item.actual_finish ? new Date(item.actual_finish).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 text-sm text-gray-500">{item.approved_by || '-'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => loadHistory(item.wbs_code)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedActivity && (
        <div className="card animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Activity History: {selectedActivity}</h3>
            <button onClick={() => { setSelectedActivity(null); setHistory([]) }} className="text-gray-500 hover:text-gray-700">
              <Calendar className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
          <ProgressTimeline updates={history} />
        </div>
      )}
    </div>
  )
}