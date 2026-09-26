// import { Routes, Route, Navigate } from 'react-router-dom'
// import { Sidebar } from './components/Sidebar'
// import { Header } from './components/Header'
// import { Dashboard } from './pages/Dashboard'
// import { SubmitReport } from './pages/SubmitReport'
// import { ReviewQueue } from './pages/ReviewQueue'
// import { Schedule } from './pages/Schedule'
// import { ReportHistory } from './pages/ReportHistory'

// function Layout({ children }) {
//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       <Sidebar />
//       <div className="flex-1 flex flex-col min-w-0 ml-64">
//         <Header />
//         <main className="flex-1 p-6 lg:p-8 overflow-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   )
// }

// export function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Layout><Dashboard /></Layout>} />
//       <Route path="/submit" element={<Layout><SubmitReport /></Layout>} />
//       <Route path="/review" element={<Layout><ReviewQueue /></Layout>} />
//       <Route path="/schedule" element={<Layout><Schedule /></Layout>} />
//       <Route path="/history" element={<Layout><ReportHistory /></Layout>} />
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   )
// }





import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Dashboard } from './pages/Dashboard'
import { SubmitReport } from './pages/SubmitReport'
import { ReviewQueue } from './pages/ReviewQueue'
import { Schedule } from './pages/Schedule'
import { ReportHistory } from './pages/ReportHistory'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/submit" element={<Layout><SubmitReport /></Layout>} />
      <Route path="/review" element={<Layout><ReviewQueue /></Layout>} />
      <Route path="/schedule" element={<Layout><Schedule /></Layout>} />
      <Route path="/history" element={<Layout><ReportHistory /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App