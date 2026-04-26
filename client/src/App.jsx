import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'

import Landing       from './pages/Landing'
import Auth          from './pages/Auth'
import Dashboard     from './pages/Dashboard'
import Habits        from './pages/Habits'
import Progress      from './pages/Progress'
import Badges        from './pages/Badges'
import AISuggestions from './pages/AISuggestions'
import Settings      from './pages/Settings'
import XPStore       from './pages/XPStore'

const AppLayout = ({ children }) => (
  <div className="flex w-full overflow-x-hidden">
    <Sidebar />
    <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
  </div>
)

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: { borderRadius: '16px', fontFamily: 'Plus Jakarta Sans', fontSize: '14px', fontWeight: 600 },
        success: { iconTheme: { primary: '#4CAF50', secondary: '#fff' } }
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/habits"    element={<ProtectedRoute><AppLayout><Habits /></AppLayout></ProtectedRoute>} />
        <Route path="/progress"  element={<ProtectedRoute><AppLayout><Progress /></AppLayout></ProtectedRoute>} />
        <Route path="/badges"    element={<ProtectedRoute><AppLayout><Badges /></AppLayout></ProtectedRoute>} />
        <Route path="/ai"        element={<ProtectedRoute><AppLayout><AISuggestions /></AppLayout></ProtectedRoute>} />
        <Route path="/settings"  element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
        <Route path="/xp-store"  element={<ProtectedRoute><AppLayout><XPStore /></AppLayout></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
