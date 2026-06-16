import { BrowserRouter, Routes, Route, NavLink,} from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import SessionNew from "./pages/SessionNew"
import SessionAnswers from "./pages/SessionAnswers"
import SessionResults from "./pages/SessionResults"

const API = "http://localhost:8000"

function Sidebar() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    axios.get(`${API}/sessions/`).then(r => setSessions(r.data))
  }, [])

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-surface border-r border-border flex flex-col">
      <div className="px-5 py-4 border-b border-border">
        <span className="font-sora font-bold text-accent text-lg tracking-tight">MisconceptAI</span>
        <span className="block text-xs text-missing font-mono mt-0.5">diagnostic engine v0.1</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="text-xs text-missing font-mono uppercase tracking-widest px-2 mb-3">Sesi Aktif</p>
        {sessions.map(s => (
          <NavLink
            key={s.id}
            to={`/sessions/${s.id}/answers`}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded text-sm transition-colors ${
                isActive
                  ? "bg-accent-dim text-accent font-medium"
                  : "text-gray-400 hover:bg-surface2 hover:text-gray-200"
              }`
            }
          >
            <span className="font-mono text-xs text-missing mr-2">#{s.id}</span>
            {s.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <NavLink
          to="/sessions/new"
          className="flex items-center justify-center w-full px-3 py-2 bg-accent-dim text-accent border border-accent/30 rounded text-sm font-medium hover:bg-accent hover:text-white transition-colors"
        >
          + Sesi Baru
        </NavLink>
      </div>
    </aside>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1 min-h-screen p-8">
          <Routes>
            <Route path="/" element={
              <div className="flex items-center justify-center h-full text-missing font-mono text-sm mt-32">
                ← pilih sesi atau buat yang baru
              </div>
            } />
            <Route path="/sessions/new" element={<SessionNew />} />
            <Route path="/sessions/:id/answers" element={<SessionAnswers />} />
            <Route path="/sessions/:id/results" element={<SessionResults />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}