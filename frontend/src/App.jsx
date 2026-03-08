import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardLayout from './pages/DashboardLayout'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Signup from './pages/Signup'
import BudgetsPage from './pages/dashboard/BudgetsPage'
import ExpensesPage from './pages/dashboard/ExpensesPage'
import InsightsPage from './pages/dashboard/InsightsPage'
import OverviewPage from './pages/dashboard/OverviewPage'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')

  const handleLogin = (jwt) => {
    localStorage.setItem('token', jwt)
    setToken(jwt)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? '/dashboard/overview' : '/login'} replace />} />
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard/overview" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route path="/signup" element={token ? <Navigate to="/dashboard/overview" replace /> : <Signup />} />
      <Route
        path="/dashboard"
        element={
          token ? (
            <DashboardLayout onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
      </Route>
      <Route
        path="/profile"
        element={
          token ? (
            <Profile onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={token ? '/dashboard/overview' : '/login'} replace />} />
    </Routes>
  )
}

export default App
