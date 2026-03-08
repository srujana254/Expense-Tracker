import { NavLink, Outlet, useNavigate } from 'react-router-dom'

function DashboardLayout({ onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1>Expense Dashboard</h1>
          <p className="muted">Use pages to manage expenses, budgets, and analytics.</p>
        </div>
        <div className="actions-row">
          <button type="button" className="secondary" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button type="button" className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="dash-nav">
        <NavLink to="overview" className={({ isActive }) => `dash-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="expenses" className={({ isActive }) => `dash-link ${isActive ? 'active' : ''}`}>
          Expenses
        </NavLink>
        <NavLink to="insights" className={({ isActive }) => `dash-link ${isActive ? 'active' : ''}`}>
          Insights
        </NavLink>
        <NavLink to="budgets" className={({ isActive }) => `dash-link ${isActive ? 'active' : ''}`}>
          Budgets
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}

export default DashboardLayout
