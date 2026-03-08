import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ToastContainer from '../components/ToastContainer'
import { login } from '../services/api'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3200)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const token = await login(form)
      onLogin(token)
      navigate('/dashboard')
    } catch (err) {
      pushToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <section className="card auth-card">
        <h1>Login</h1>
        <p className="muted">Access your expense dashboard.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="muted top-gap">
          No account? <Link to="/signup">Create one</Link>
        </p>
      </section>
    </div>
  )
}

export default Login
