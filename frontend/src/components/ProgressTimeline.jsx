import { CheckCircle, Clock, XCircle } from 'lucide-react'

export function ProgressTimeline({ updates }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="card text-center py-12">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No schedule updates yet</p>
      </div>
    )
  }
  
  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Recent Schedule Updates</h3>
      </div>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        {updates.map((update, index) => (
          <div key={index} className="relative pl-16 py-4 px-4 border-b border-gray-100 last:border-0">
            <div className="absolute left-0 top-4">
              <div className={`w-3 h-3 rounded-full border-2 border-white ${
                update.status === 'Completed' ? 'bg-success-500' :
                update.status === 'In Progress' ? 'bg-warning-500' : 'bg-gray-300'
              }`} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{update.wbs_code}</p>
                <p className="text-sm text-gray-600">{update.activity_name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    {update.status === 'Completed' && <CheckCircle className="w-4 h-4 text-success-500" />}
                    {update.status === 'In Progress' && <Clock className="w-4 h-4 text-warning-500" />}
                    {update.status === 'Not Started' && <XCircle className="w-4 h-4 text-gray-400" />}
                    <span className={`font-medium ${
                      update.status === 'Completed' ? 'text-success-600' :
                      update.status === 'In Progress' ? 'text-warning-600' : 'text-gray-500'
                    }`}>
                      {update.status}
                    </span>
                  </span>
                  {update.actual_finish && (
                    <span>Completed: {new Date(update.actual_finish).toLocaleDateString()}</span>
                  )}
                  {update.approved_by && (
                    <span>By: {update.approved_by}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}