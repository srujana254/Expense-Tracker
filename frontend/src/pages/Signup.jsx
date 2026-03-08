import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ToastContainer from '../components/ToastContainer'
import { signup } from '../services/api'

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
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
      const result = await signup(form)
      pushToast('success', typeof result === 'string' ? result : 'Signup successful. Please login.')
      setTimeout(() => navigate('/login'), 700)
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
        <h1>Signup</h1>
        <p className="muted">Create your expense tracker account.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
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
            {loading ? 'Creating...' : 'Signup'}
          </button>
        </form>

        <p className="muted top-gap">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  )
}

export default Signup
