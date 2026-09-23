import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import StudentDetail from './pages/StudentDetail'
import Sessions from './pages/Sessions'
import Materials from './pages/Materials'
import Progress from './pages/Progress'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
