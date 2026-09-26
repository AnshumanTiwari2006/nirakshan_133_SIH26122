// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Upload, Mic, Send, FileText, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
// import api from '../api/client'
// import { ExtractionPanel } from '../components/ExtractionPanel'
// import { WBSMatchCard } from '../components/WBSMatchCard'
// import { ConfidenceBadge } from '../components/ConfidenceBadge'

// export function SubmitReport() {
//   const navigate = useNavigate()
//   const [activeTab, setActiveTab] = useState('chat')
//   const [chatMessage, setChatMessage] = useState('')
//   const [file, setFile] = useState(null)
//   const [processing, setProcessing] = useState(false)
//   const [result, setResult] = useState(null)
//   const [error, setError] = useState(null)

//   const handleChatSubmit = async (e) => {
//     e.preventDefault()
//     if (!chatMessage.trim()) return

//     setProcessing(true)
//     setError(null)
//     try {
//       const res = await api.post('/reports/chat', { message: chatMessage })
//       pollResult(res.data.id)
//       setChatMessage('')
//     } catch (err) {
//       setError('Failed to submit report')
//       setProcessing(false)
//     }
//   }

//   const handleFileUpload = async (e) => {
//     e.preventDefault()
//     if (!file) return

//     setProcessing(true)
//     setError(null)
//     const formData = new FormData()
//     formData.append('source_id', `FILE-${Date.now()}`)
//     formData.append('source_type', file.type || 'TXT')
//     formData.append('file', file)
//     formData.append('supervisor', 'Current User')

//     try {
//       const res = await api.post('/reports/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       })
//       pollResult(res.data.id)
//     } catch (err) {
//       setError('Failed to upload file')
//       setProcessing(false)
//     }
//   }

//   const pollResult = (reportId) => {
//     const interval = setInterval(async () => {
//       try {
//         const [extractionRes, matchesRes] = await Promise.all([
//           api.get(`/reports/${reportId}/extraction`),
//           api.get(`/reports/${reportId}/matches`)
//         ])

//         if (extractionRes.data) {
//           setResult({
//             reportId,
//             extraction: extractionRes.data,
//             matches: matchesRes.data
//           })
//           setProcessing(false)
//           clearInterval(interval)
//         }
//       } catch (err) {
//         // Still processing
//       }
//     }, 2000)

//     setTimeout(() => {
//       clearInterval(interval)
//       if (processing) {
//         setError('Processing taking longer than expected. Check history.')
//         setProcessing(false)
//       }
//     }, 60000)
//   }

//   const tabs = [
//     { id: 'chat', label: 'Chat Input', icon: FileText },
//     { id: 'upload', label: 'File Upload', icon: Upload },
//     { id: 'voice', label: 'Voice Input', icon: Mic },
//   ]

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Submit Progress Report</h1>
//         <p className="text-gray-500 mt-1">Tell the system what happened on site today</p>
//       </div>

//       <div className="card">
//         <div className="flex border-b border-gray-200 mb-6">
//           {tabs.map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === tab.id
//                   ? 'border-primary-500 text-primary-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <tab.icon className="w-5 h-5 inline mr-2" strokeWidth={2} />
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {activeTab === 'chat' && (
//           <form onSubmit={handleChatSubmit} className="space-y-4">
//             <div>
//               <label className="label">What happened on site today?</label>
//               <textarea
//                 value={chatMessage}
//                 onChange={(e) => setChatMessage(e.target.value)}
//                 rows={4}
//                 placeholder="e.g., Finished the pump wiring around 4:30 and checked the terminations at Pump House P-01"
//                 className="input resize-none"
//                 disabled={processing}
//               />
//             </div>
//             <button type="submit" disabled={processing || !chatMessage.trim()} className="btn-primary w-full">
//               {processing ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Send className="w-5 h-5 mr-2" strokeWidth={2} />
//                   Process Update
//                 </>
//               )}
//             </button>
//           </form>
//         )}

//         {activeTab === 'upload' && (
//           <form onSubmit={handleFileUpload} className="space-y-4">
//             <div>
//               <label className="label">Upload Report File</label>
//               <div
//                 className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
//                   file ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
//                 }`}
//                 onClick={() => document.getElementById('file-input').click()}
//                 onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary-500') }}
//                 onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary-500') }}
//                 onDrop={(e) => {
//                   e.preventDefault()
//                   e.currentTarget.classList.remove('border-primary-500')
//                   if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0])
//                 }}
//               >
//                 <input
//                   id="file-input"
//                   type="file"
//                   accept=".txt,.docx,.xlsx,.pdf"
//                   onChange={(e) => e.target.files[0] && setFile(e.target.files[0])}
//                   className="hidden"
//                 />
//                 <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
//                 <p className="text-gray-600 mb-2">Drag & drop a file or click to browse</p>
//                 <p className="text-sm text-gray-500">Supports: TXT, DOCX, XLSX, PDF</p>
//                 {file && (
//                   <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <FileText className="w-6 h-6 text-primary-500" />
//                       <div>
//                         <p className="font-medium">{file.name}</p>
//                         <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
//                       </div>
//                     </div>
//                     <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600">
//                       <XCircle className="w-5 h-5" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <button type="submit" disabled={processing || !file} className="btn-primary w-full">
//               {processing ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="w-5 h-5 mr-2" strokeWidth={2} />
//                   Upload & Process
//                 </>
//               )}
//             </button>
//           </form>
//         )}

//         {activeTab === 'voice' && (
//           <div className="text-center py-12">
//             <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Voice Input (Coming Soon)</h3>
//             <p className="text-gray-500">Record your voice report for automatic transcription and processing</p>
//           </div>
//         )}
//       </div>

//       {error && (
//         <div className="card border-danger-200 bg-danger-50">
//           <div className="flex items-center gap-3 text-danger-700">
//             <AlertCircle className="w-5 h-5" />
//             <span>{error}</span>
//           </div>
//         </div>
//       )}

//       {result && (
//         <div className="space-y-6 animate-fade-in">
//           <div className="card border-success-200 bg-success-50">
//             <div className="flex items-center gap-3 text-success-700">
//               <CheckCircle className="w-5 h-5" />
//               <span className="font-medium">Report processed successfully!</span>
//             </div>
//           </div>

//           <ExtractionPanel extraction={result.extraction} />

//           <div className="card">
//             <h3 className="font-semibold text-gray-900 mb-4">Top WBS Matches</h3>
//             <div className="space-y-3">
//               {result.matches?.map((match, i) => (
//                 <WBSMatchCard key={match.wbs_code} match={match} index={i} showDetails />
//               ))}
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <button className="btn-primary flex-1" onClick={() => navigate(`/review?report=${result.reportId}`)}>
//               Review & Approve
//             </button>
//             <button className="btn-secondary flex-1" onClick={() => setResult(null)}>
//               Submit Another
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }



// import { useState, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Upload, Mic, Send, FileText, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
// import api from '../api/client'
// import { ExtractionPanel } from '../components/ExtractionPanel'
// import { WBSMatchCard } from '../components/WBSMatchCard'
// import { ConfidenceBadge } from '../components/ConfidenceBadge'

// const MAX_FILES = 100

// export function SubmitReport() {
//   const navigate = useNavigate()
//   const [activeTab, setActiveTab] = useState('chat')
//   const [chatMessage, setChatMessage] = useState('')
//   const [files, setFiles] = useState([])
//   const [processing, setProcessing] = useState(false)
//   const [result, setResult] = useState(null)
//   const [error, setError] = useState(null)
//   const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
//   const fileInputRef = useRef(null)

//   const handleChatSubmit = async (e) => {
//     e.preventDefault()
//     if (!chatMessage.trim()) return

//     setProcessing(true)
//     setError(null)
//     try {
//       const res = await api.post('/reports/chat', { message: chatMessage })
//       pollResult(res.data.id)
//       setChatMessage('')
//     } catch (err) {
//       setError('Failed to submit report')
//       setProcessing(false)
//     }
//   }

//   const applySelectedFiles = (incomingFiles) => {
//     const selected = Array.from(incomingFiles || [])
//     if (!selected.length) return

//     setError(null)
//     if (selected.length > MAX_FILES) {
//       setFiles(selected.slice(0, MAX_FILES))
//       setError(`You can select a maximum of ${MAX_FILES} files at a time. The first ${MAX_FILES} were selected.`)
//       return
//     }
//     setFiles(selected)
//   }

//   const handleFileUpload = async (e) => {
//     e.preventDefault()
//     if (processing) return

//     // If no files have been selected, the main button opens the native file picker.
//     if (!files.length) {
//       fileInputRef.current?.click()
//       return
//     }

//     if (files.length > MAX_FILES) {
//       setError(`You can upload a maximum of ${MAX_FILES} files at a time.`)
//       return
//     }

//     setProcessing(true)
//     setError(null)
//     setUploadProgress({ current: 0, total: files.length })
//     try {
//       // Backend expects the logical file type (TXT/DOCX/XLSX/PDF),
//       // not the browser MIME type (e.g. application/vnd.openxmlformats...).
//       // Upload each selected file as its own report because the API accepts one file per request.
//       const uploaded = []

//       for (const selectedFile of files) {
//         const extension = selectedFile.name.split('.').pop()?.toUpperCase()
//         if (!['TXT', 'DOCX', 'XLSX', 'PDF'].includes(extension)) {
//           throw new Error(`Unsupported file type: ${selectedFile.name}`)
//         }

//         const formData = new FormData()
//         formData.append('source_id', `FILE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`)
//         formData.append('source_type', extension)
//         formData.append('file', selectedFile)
//         formData.append('supervisor', 'Current User')

//         // Use native fetch for multipart upload. The axios client has a default
//         // application/json header, while FastAPI expects multipart/form-data.
//         // Do NOT set Content-Type manually; the browser adds the multipart boundary.
//         const response = await fetch('/api/reports/upload', {
//           method: 'POST',
//           body: formData,
//         })

//         let data = null
//         try {
//           data = await response.json()
//         } catch {
//           data = null
//         }

//         if (!response.ok) {
//           const detail = data?.detail
//           if (Array.isArray(detail)) {
//             const message = detail
//               .map(item => `${item.loc?.join?.('.') || 'field'}: ${item.msg}`)
//               .join('; ')
//             throw new Error(message || `Upload failed (${response.status})`)
//           }
//           throw new Error(detail || `Upload failed (${response.status})`)
//         }

//         uploaded.push(data)
//         setUploadProgress({ current: uploaded.length, total: files.length })
//       }

//       if (uploaded.length === 1) {
//         pollResult(uploaded[0].id)
//       } else {
//         setProcessing(false)
//         setFiles([])
//         setResult(null)
//         setError(null)
//         setUploadProgress({ current: 0, total: 0 })
//         alert(`${uploaded.length} reports uploaded successfully. Processing is running in the background. Check History for the results.`)
//       }
//     } catch (err) {
//       const detail = err?.response?.data?.detail || err?.message || 'Failed to upload file'
//       setError(detail)
//       setProcessing(false)
//       setUploadProgress({ current: 0, total: 0 })
//     }
//   }

//   const pollResult = (reportId) => {
//     const interval = setInterval(async () => {
//       try {
//         const [extractionRes, matchesRes] = await Promise.all([
//           api.get(`/reports/${reportId}/extraction`),
//           api.get(`/reports/${reportId}/matches`)
//         ])

//         if (extractionRes.data) {
//           setResult({
//             reportId,
//             extraction: extractionRes.data,
//             matches: matchesRes.data
//           })
//           setProcessing(false)
//           clearInterval(interval)
//         }
//       } catch (err) {
//         // Still processing
//       }
//     }, 2000)

//     setTimeout(() => {
//       clearInterval(interval)
//       if (processing) {
//         setError('Processing taking longer than expected. Check history.')
//         setProcessing(false)
//       }
//     }, 60000)
//   }

//   const tabs = [
//     { id: 'chat', label: 'Chat Input', icon: FileText },
//     { id: 'upload', label: 'File Upload', icon: Upload },
//     { id: 'voice', label: 'Voice Input', icon: Mic },
//   ]

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Submit Progress Report</h1>
//         <p className="text-gray-500 mt-1">Tell the system what happened on site today</p>
//       </div>

//       <div className="card">
//         <div className="flex border-b border-gray-200 mb-6">
//           {tabs.map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
//                   ? 'border-primary-500 text-primary-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//             >
//               <tab.icon className="w-5 h-5 inline mr-2" strokeWidth={2} />
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {activeTab === 'chat' && (
//           <form onSubmit={handleChatSubmit} className="space-y-4">
//             <div>
//               <label className="label">What happened on site today?</label>
//               <textarea
//                 value={chatMessage}
//                 onChange={(e) => setChatMessage(e.target.value)}
//                 rows={4}
//                 placeholder="e.g., Finished the pump wiring around 4:30 and checked the terminations at Pump House P-01"
//                 className="input resize-none"
//                 disabled={processing}
//               />
//             </div>
//             <button type="submit" disabled={processing || !chatMessage.trim()} className="btn-primary w-full">
//               {processing ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Send className="w-5 h-5 mr-2" strokeWidth={2} />
//                   Process Update
//                 </>
//               )}
//             </button>
//           </form>
//         )}

//         {activeTab === 'upload' && (
//           <form onSubmit={handleFileUpload} className="space-y-4">
//             <div>
//               <label className="label">Upload Report File</label>
//               <div
//                 className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${files.length ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
//                   }`}
//                 onClick={() => {
//                   if (!processing) fileInputRef.current?.click()
//                 }}
//                 onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary-500') }}
//                 onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary-500') }}
//                 onDrop={(e) => {
//                   e.preventDefault()
//                   e.currentTarget.classList.remove('border-primary-500')
//                   if (e.dataTransfer.files.length) applySelectedFiles(e.dataTransfer.files)
//                 }}
//               >
//                 <input
//                   ref={fileInputRef}
//                   id="file-input"
//                   type="file"
//                   multiple
//                   accept=".txt,.docx,.xlsx,.pdf"
//                   onChange={(e) => {
//                     applySelectedFiles(e.target.files)
//                     // Allows selecting the same file(s) again after clearing.
//                     e.target.value = ''
//                   }}
//                   className="hidden"
//                 />
//                 <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
//                 <p className="text-gray-600 mb-2">Drag & drop files or click to browse</p>
//                 <p className="text-sm text-gray-500">Supports: TXT, DOCX, XLSX, PDF · Maximum {MAX_FILES} files per upload</p>
//                 {files.length > 0 && (
//                   <div className="mt-4 space-y-2 text-left">
//                     {files.map((selectedFile) => (
//                       <div key={`${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}`} className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <FileText className="w-6 h-6 text-primary-500 shrink-0" />
//                           <div className="min-w-0">
//                             <p className="font-medium truncate">{selectedFile.name}</p>
//                             <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                     <button
//                       type="button"
//                       onClick={(e) => { e.stopPropagation(); setFiles([]); setError(null) }}
//                       className="text-sm text-gray-500 hover:text-gray-700"
//                     >
//                       Clear selected files
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {processing && uploadProgress.total > 1 && (
//               <div className="text-sm text-gray-600 text-center">
//                 Uploading {uploadProgress.current} of {uploadProgress.total} files...
//               </div>
//             )}
//             <button
//               type="submit"
//               disabled={processing}
//               className="btn-primary w-full"
//             >
//               {processing ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="w-5 h-5 mr-2" strokeWidth={2} />
//                   {files.length ? 'Upload & Process' : 'Choose Files to Upload'}
//                 </>
//               )}
//             </button>
//           </form>
//         )}

//         {activeTab === 'voice' && (
//           <div className="text-center py-12">
//             <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Voice Input (Coming Soon)</h3>
//             <p className="text-gray-500">Record your voice report for automatic transcription and processing</p>
//           </div>
//         )}
//       </div>

//       {error && (
//         <div className="card border-danger-200 bg-danger-50">
//           <div className="flex items-center gap-3 text-danger-700">
//             <AlertCircle className="w-5 h-5" />
//             <span>{error}</span>
//           </div>
//         </div>
//       )}

//       {result && (
//         <div className="space-y-6 animate-fade-in">
//           <div className="card border-success-200 bg-success-50">
//             <div className="flex items-center gap-3 text-success-700">
//               <CheckCircle className="w-5 h-5" />
//               <span className="font-medium">Report processed successfully!</span>
//             </div>
//           </div>

//           <ExtractionPanel extraction={result.extraction} />

//           <div className="card">
//             <h3 className="font-semibold text-gray-900 mb-4">Top WBS Matches</h3>
//             <div className="space-y-3">
//               {result.matches?.map((match, i) => (
//                 <WBSMatchCard key={match.wbs_code} match={match} index={i} showDetails />
//               ))}
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <button className="btn-primary flex-1" onClick={() => navigate(`/review?report=${result.reportId}`)}>
//               Review & Approve
//             </button>
//             <button className="btn-secondary flex-1" onClick={() => setResult(null)}>
//               Submit Another
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }












import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Mic, Send, FileText, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import api from '../api/client'
import { ExtractionPanel } from '../components/ExtractionPanel'
import { WBSMatchCard } from '../components/WBSMatchCard'
import { ConfidenceBadge } from '../components/ConfidenceBadge'

const MAX_FILES = 100

export function SubmitReport() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('chat')
  const [chatMessage, setChatMessage] = useState('')
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef(null)

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    setProcessing(true)
    setError(null)
    try {
      const res = await api.post('/reports/chat', { message: chatMessage })
      pollResult(res.data.id)
      setChatMessage('')
    } catch (err) {
      setError('Failed to submit report')
      setProcessing(false)
    }
  }

  const applySelectedFiles = (incomingFiles) => {
    const selected = Array.from(incomingFiles || [])
    if (!selected.length) return

    setError(null)
    if (selected.length > MAX_FILES) {
      setFiles(selected.slice(0, MAX_FILES))
      setError(`You can select a maximum of ${MAX_FILES} files at a time. The first ${MAX_FILES} were selected.`)
      return
    }
    setFiles(selected)
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (processing) return

    // If no files have been selected, the main button opens the native file picker.
    if (!files.length) {
      fileInputRef.current?.click()
      return
    }

    if (files.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} files at a time.`)
      return
    }

    setProcessing(true)
    setError(null)
    setUploadProgress({ current: 0, total: files.length })
    try {
      // Backend expects the logical file type (TXT/DOCX/XLSX/PDF),
      // not the browser MIME type (e.g. application/vnd.openxmlformats...).
      // Upload each selected file as its own report because the API accepts one file per request.
      const uploaded = []

      for (const selectedFile of files) {
        const extension = selectedFile.name.split('.').pop()?.toUpperCase()
        if (!['TXT', 'DOCX', 'XLSX', 'PDF'].includes(extension)) {
          throw new Error(`Unsupported file type: ${selectedFile.name}`)
        }

        const formData = new FormData()
        formData.append('source_id', `FILE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`)
        formData.append('source_type', extension)
        formData.append('file', selectedFile)
        formData.append('supervisor', 'Current User')

        // Use native fetch for multipart upload. The axios client has a default
        // application/json header, while FastAPI expects multipart/form-data.
        // Do NOT set Content-Type manually; the browser adds the multipart boundary.
        const response = await fetch('/api/reports/upload', {
          method: 'POST',
          body: formData,
        })

        let data = null
        try {
          data = await response.json()
        } catch {
          data = null
        }

        if (!response.ok) {
          const detail = data?.detail
          if (Array.isArray(detail)) {
            const message = detail
              .map(item => `${item.loc?.join?.('.') || 'field'}: ${item.msg}`)
              .join('; ')
            throw new Error(message || `Upload failed (${response.status})`)
          }
          throw new Error(detail || `Upload failed (${response.status})`)
        }

        uploaded.push(data)
        setUploadProgress({ current: uploaded.length, total: files.length })
      }

      if (uploaded.length === 1) {
        pollResult(uploaded[0].id)
      } else {
        setProcessing(false)
        setFiles([])
        setResult(null)
        setError(null)
        setUploadProgress({ current: 0, total: 0 })
        alert(`${uploaded.length} reports uploaded successfully. Processing is running in the background. Check History for the results.`)
      }
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to upload file'
      setError(detail)
      setProcessing(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }
  const pollResult = (reportId) => {
    const interval = setInterval(async () => {
      try {
        const extractionRes = await api.get(
          `/reports/${reportId}/extraction`
        )

        const matchesRes = await api.get(
          `/reports/${reportId}/matches`
        )

        console.log('Report ready:', {
          reportId,
          extraction: extractionRes.data,
          matches: matchesRes.data
        })

        setResult({
          reportId,
          extraction: extractionRes.data,
          matches: matchesRes.data || []
        })

        setProcessing(false)
        clearInterval(interval)

      } catch (err) {
        console.log(
          `Report ${reportId} still processing...`,
          err?.response?.status
        )
      }
    }, 2000)

    setTimeout(() => {
      clearInterval(interval)

      setProcessing(false)

      setError(
        'Processing is taking longer than expected. You can check this report in History.'
      )
    }, 120000)
  }

  const tabs = [
    { id: 'chat', label: 'Text Report', icon: FileText },
    { id: 'upload', label: 'File Upload', icon: Upload },
    { id: 'voice', label: 'Voice Report', icon: Mic },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submit Progress Report</h1>
        <p className="text-gray-500 mt-1">Tell the system what happened on site today</p>
      </div>

      <div className="card">
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <tab.icon className="w-5 h-5 inline mr-2" strokeWidth={2} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'chat' && (
          <form onSubmit={handleChatSubmit} className="space-y-4">
            <div>
              <label className="label">What happened on site today?</label>
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                rows={4}
                // placeholder="e.g., Finished the pump wiring around 4:30 and checked the terminations at Pump House P-01"
                placeholder="Example: Pump wiring completed at Pump House P-01. Terminations checked and area cleared."
                className="input resize-none"
                disabled={processing}
              />
            </div>
            <button
              type="submit"
              disabled={processing || !chatMessage.trim()}
              className="btn-primary w-full flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Process Update'
              )}
            </button>
          </form>
        )}

        {activeTab === 'upload' && (
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="label">Upload Site File</label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${files.length ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                  }`}
                onClick={() => {
                  if (!processing) fileInputRef.current?.click()
                }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary-500') }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary-500') }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove('border-primary-500')
                  if (e.dataTransfer.files.length) applySelectedFiles(e.dataTransfer.files)
                }}
              >
                <input
                  ref={fileInputRef}
                  id="file-input"
                  type="file"
                  multiple
                  accept=".txt,.docx,.xlsx,.pdf"
                  onChange={(e) => {
                    applySelectedFiles(e.target.files)
                    // Allows selecting the same file(s) again after clearing.
                    e.target.value = ''
                  }}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-gray-700 font-medium mb-2">
                  Drag and drop your report here
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400">
                  TXT · DOCX · XLSX · PDF
                </p>
                {files.length > 0 && (
                  <div className="mt-4 space-y-2 text-left">
                    {files.map((selectedFile) => (
                      <div key={`${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}`} className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-6 h-6 text-primary-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFiles([]); setError(null) }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear selected files
                    </button>
                  </div>
                )}
              </div>
            </div>
            {processing && uploadProgress.total > 1 && (
              <div className="text-sm text-gray-600 text-center">
                Uploading {uploadProgress.current} of {uploadProgress.total} files...
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" disabled={processing} onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full">
                <Upload className="w-5 h-5 mr-2" strokeWidth={2} />
                Add Files ({files.length}/{MAX_FILES})
              </button>
              <button type="submit" disabled={processing || !files.length} className="btn-primary w-full">
                {processing ? (<> <Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing... </>) : (<> <Upload className="w-5 h-5 mr-2" strokeWidth={2} /> Process Selected Files </>)}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">Select up to {MAX_FILES} reports first, then process them together.</p>
          </form>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-6">

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-primary-600" strokeWidth={1.5} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                Voice Progress Report
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Upload a supervisor voice recording for future transcription
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">

              <input
                id="voice-file-input"
                type="file"
                accept=".mp3,.wav,.m4a,.ogg"
                className="hidden"
              />

              <label
                htmlFor="voice-file-input"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50"
              >
                Select Audio File
              </label>

              <p className="text-xs text-gray-400 mt-3">
                Supported formats: MP3 · WAV · M4A · OGG
              </p>

            </div>

            <div className="card bg-gray-50 border-gray-200">

              <p className="text-sm font-medium text-gray-700">
                Transcription
              </p>

              <p className="text-sm text-gray-400 mt-2">
                Voice transcription will be enabled in a future version.
              </p>

            </div>

            <button
              type="button"
              disabled
              className="btn-primary w-full opacity-50 cursor-not-allowed"
            >
              Transcribe & Process
            </button>

          </div>
        )}
      </div>

      {error && (
        <div className="card border-danger-200 bg-danger-50">
          <div className="flex items-center gap-3 text-danger-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in">
          <div className="card border-success-200 bg-success-50">
            <div className="flex items-center gap-3 text-success-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Report processed successfully!</span>
            </div>
          </div>

          <ExtractionPanel extraction={result.extraction} />

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Top WBS Matches</h3>
            <div className="space-y-3">
              {result.matches?.map((match, i) => (
                <WBSMatchCard key={match.wbs_code} match={match} index={i} showDetails />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              className="btn-primary w-full"
              onClick={() => navigate(`/review?report=${result.reportId}`)}
            >
              Review & Approve
            </button>

            <button
              className="btn-secondary w-full"
              onClick={() => setResult(null)}
            >
              Submit Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}