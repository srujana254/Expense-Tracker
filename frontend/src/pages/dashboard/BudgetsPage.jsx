import { useEffect, useMemo, useState } from 'react'
import ToastContainer from '../../components/ToastContainer'
import { getExpenses } from '../../services/api'
import { amountFormatter, getMonthlyCategorySpend, getSummary } from './helpers'

function BudgetsPage() {
  const [expenses, setExpenses] = useState([])
  const [toasts, setToasts] = useState([])
  const [monthlyBudget, setMonthlyBudget] = useState(localStorage.getItem('budget.monthly') || '')
  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem('budget.categories')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    const load = async () => {
      setExpenses(await getExpenses())
    }

    load()
  }, [])

  useEffect(() => {
    localStorage.setItem('budget.monthly', monthlyBudget)
  }, [monthlyBudget])

  useEffect(() => {
    localStorage.setItem('budget.categories', JSON.stringify(categoryBudgets))
  }, [categoryBudgets])

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3500)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const categories = useMemo(() => {
    return [...new Set(expenses.map((expense) => expense.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    )
  }, [expenses])

  const summary = useMemo(() => getSummary(expenses), [expenses])
  const monthlyCategorySpend = useMemo(() => getMonthlyCategorySpend(expenses), [expenses])

  const budgetAlerts = useMemo(() => {
    const alerts = []
    const totalBudget = Number(monthlyBudget || 0)

    if (totalBudget > 0) {
      const ratio = summary.thisMonth / totalBudget
      if (ratio >= 1) {
        alerts.push({
          id: 'monthly-over',
          type: 'danger',
          message: `Monthly budget exceeded: ${amountFormatter.format(summary.thisMonth)} of ${amountFormatter.format(totalBudget)}.`,
        })
      } else if (ratio >= 0.9) {
        alerts.push({
          id: 'monthly-near',
          type: 'warning',
          message: `Monthly budget reached ${Math.round(ratio * 100)}%.`,
        })
      } else if (ratio >= 0.7) {
        alerts.push({
          id: 'monthly-safe',
          type: 'info',
          message: `Monthly spend is at ${Math.round(ratio * 100)}% of your budget.`,
        })
      }
    }

    Object.entries(categoryBudgets).forEach(([category, rawBudget]) => {
      const budget = Number(rawBudget || 0)
      if (budget <= 0) {
        return
      }

      const spent = Number(monthlyCategorySpend.get(category) || 0)
      const ratio = spent / budget
      if (ratio >= 1) {
        alerts.push({
          id: `cat-over-${category}`,
          type: 'danger',
          message: `${category}: exceeded budget (${amountFormatter.format(spent)} / ${amountFormatter.format(budget)}).`,
        })
      } else if (ratio >= 0.9) {
        alerts.push({
          id: `cat-near-${category}`,
          type: 'warning',
          message: `${category}: nearing limit (${Math.round(ratio * 100)}%).`,
        })
      }
    })

    return alerts
  }, [monthlyBudget, summary.thisMonth, categoryBudgets, monthlyCategorySpend])

  const handleCategoryBudgetChange = (category, value) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleClearBudgets = () => {
    setMonthlyBudget('')
    setCategoryBudgets({})
    pushToast('success', 'Budget goals cleared')
  }

  const monthlyBudgetNumber = Number(monthlyBudget || 0)
  const monthlyBudgetProgress =
    monthlyBudgetNumber > 0 ? Math.min((summary.thisMonth / monthlyBudgetNumber) * 100, 100) : 0

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <section className="card">
        <div className="list-head">
          <h2>Budget Goals</h2>
          <button type="button" className="secondary" onClick={handleClearBudgets}>
            Clear Goals
          </button>
        </div>

        <div className="budget-block top-gap">
          <label className="label" htmlFor="monthlyBudget">
            Monthly Budget
          </label>
          <input
            id="monthlyBudget"
            type="number"
            min="0"
            step="0.01"
            placeholder="Set monthly limit"
            value={monthlyBudget}
            onChange={(event) => setMonthlyBudget(event.target.value)}
          />
          {monthlyBudgetNumber > 0 && (
            <>
              <div className="progress-meta">
                <span>{amountFormatter.format(summary.thisMonth)}</span>
                <span>{amountFormatter.format(monthlyBudgetNumber)}</span>
              </div>
              <div className="bar-track budget">
                <div className="bar-fill budget" style={{ width: `${monthlyBudgetProgress}%` }} />
              </div>
            </>
          )}
        </div>

        <div className="budget-category-grid top-gap">
          {categories.length === 0 ? (
            <p className="muted">Add expenses to set category budgets.</p>
          ) : (
            categories.map((category) => (
              <div key={category} className="budget-row">
                <div>
                  <strong>{category}</strong>
                  <p className="muted">Spent this month: {amountFormatter.format(monthlyCategorySpend.get(category) || 0)}</p>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Category budget"
                  value={categoryBudgets[category] || ''}
                  onChange={(event) => handleCategoryBudgetChange(category, event.target.value)}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card top-gap">
        <h2>Budget Alerts</h2>
        {budgetAlerts.length === 0 ? (
          <p className="muted top-gap">No budget alerts right now.</p>
        ) : (
          <div className="alert-list top-gap">
            {budgetAlerts.map((alert) => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                {alert.message}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default BudgetsPage
