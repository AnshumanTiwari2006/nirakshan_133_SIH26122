import { Bell, User, Menu } from 'lucide-react'

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" strokeWidth={2} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-700" strokeWidth={2} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">Site Supervisor</p>
            <p className="text-xs text-gray-500">Ravi Kumar</p>
          </div>
        </div>
      </div>
    </header>
  )
}