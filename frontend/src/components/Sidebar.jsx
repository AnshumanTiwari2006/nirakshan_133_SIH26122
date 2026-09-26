import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, ClipboardList, Calendar, History, Settings } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Submit Report', href: '/submit', icon: FileText },
  { name: 'Review Queue', href: '/review', icon: ClipboardList },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'History', href: '/history', icon: History },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Nirikshan</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="w-5 h-5" strokeWidth={2} />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <Settings className="w-5 h-5" strokeWidth={2} />
          Settings
        </NavLink>
      </div>
    </aside>
  )
}