import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ToastContainer from '../components/ToastContainer'
import { changePassword, getProfile } from '../services/api'

function Profile({ onLogout }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [toasts, setToasts] = useState([])

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3600)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await getProfile()
      setProfile(data)
    } catch (error) {
      pushToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    loadProfile()
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()

    try {
      const message = await changePassword(form)
      pushToast('success', typeof message === 'string' ? message : 'Password updated successfully')
      setForm({ currentPassword: '', newPassword: '' })
    } catch (error) {
      pushToast('error', error.message)
    }
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="dashboard-page">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="muted">View your account and update your password.</p>
        </div>
        <div className="actions-row">
          <button type="button" className="secondary" onClick={() => navigate('/dashboard/overview')}>
            Dashboard
          </button>
          <button type="button" className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Account Details</h2>
          {loading ? (
            <p className="muted">Loading profile...</p>
          ) : profile ? (
            <div className="profile-grid">
              <div>
                <span className="label">Name</span>
                <strong>{profile.name}</strong>
              </div>
              <div>
                <span className="label">Email</span>
                <strong>{profile.email}</strong>
              </div>
            </div>
          ) : (
            <p className="muted">No profile data available.</p>
          )}
        </section>

        <section className="card">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={form.currentPassword}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
            <button type="submit">Update Password</button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default Profile
