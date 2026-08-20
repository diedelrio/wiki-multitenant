import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import DocumentPage from './pages/DocumentPage'
import SearchPage from './pages/SearchPage'
import { loadIndex } from './lib/content'

export default function App() {
  const [docs, setDocs] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    loadIndex().then(data => { setDocs(data); setStatus('ready') }).catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return <div className="boot-screen">Cargando Development Wiki…</div>
  if (status === 'error') return <div className="boot-screen">No se pudo cargar el índice de contenidos.</div>

  return (
    <Routes>
      <Route element={<Layout docs={docs} query={query} setQuery={setQuery} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs/:slug" element={<DocumentPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
