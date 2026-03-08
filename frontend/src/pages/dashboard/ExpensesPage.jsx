import { useEffect, useMemo, useState } from 'react'
import ExpenseForm from '../../components/ExpenseForm'
import ExpenseList from '../../components/ExpenseList'
import ToastContainer from '../../components/ToastContainer'
import { addExpense, getExpenses, removeExpense, updateExpense } from '../../services/api'
import { getWeekEnd, getWeekStart } from './helpers'

function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [editingExpense, setEditingExpense] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [datePreset, setDatePreset] = useState('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [toasts, setToasts] = useState([])

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

  const loadExpenses = async () => {
    try {
      setLoading(true)
      setExpenses(await getExpenses())
    } catch (err) {
      pushToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  const categories = useMemo(() => {
    return [...new Set(expenses.map((expense) => expense.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    )
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const now = new Date()
    const weekStart = getWeekStart(now)
    const weekEnd = getWeekEnd(now)
    const monthKey = now.toISOString().slice(0, 7)

    const filtered = expenses.filter((expense) => {
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
      const title = expense.title?.toLowerCase() || ''
      const category = expense.category?.toLowerCase() || ''
      const description = expense.description?.toLowerCase() || ''
      const matchesSearch =
        query.length === 0 || title.includes(query) || category.includes(query) || description.includes(query)

      const expenseDate = expense.date ? new Date(expense.date) : null
      const matchesDate =
        datePreset === 'all' ||
        (datePreset === 'week' && expenseDate && expenseDate >= weekStart && expenseDate <= weekEnd) ||
        (datePreset === 'month' && (expense.date || '').startsWith(monthKey)) ||
        (datePreset === 'custom' &&
          expenseDate &&
          (!customStartDate || expenseDate >= new Date(customStartDate)) &&
          (!customEndDate || expenseDate <= new Date(`${customEndDate}T23:59:59`)))

      return matchesCategory && matchesSearch && matchesDate
    })

    filtered.sort((a, b) => {
      if (sortBy === 'amount-asc') {
        return Number(a.amount || 0) - Number(b.amount || 0)
      }
      if (sortBy === 'amount-desc') {
        return Number(b.amount || 0) - Number(a.amount || 0)
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
      }
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    })

    return filtered
  }, [expenses, categoryFilter, searchQuery, sortBy, datePreset, customStartDate, customEndDate])

  const handleAddExpense = async (payload) => {
    try {
      await addExpense(payload)
      pushToast('success', 'Expense added successfully')
      await loadExpenses()
    } catch (err) {
      pushToast('error', err.message)
    }
  }

  const handleUpdateExpense = async (payload) => {
    if (!editingExpense) {
      return
    }

    try {
      await updateExpense(editingExpense.id, payload)
      setEditingExpense(null)
      pushToast('success', 'Expense updated successfully')
      await loadExpenses()
    } catch (err) {
      pushToast('error', err.message)
    }
  }

  const handleDuplicateExpense = async (expense) => {
    try {
      await addExpense({
        title: `${expense.title} (copy)`,
        amount: Number(expense.amount),
        category: expense.category,
        date: new Date().toISOString().slice(0, 10),
        description: expense.description || '',
      })
      pushToast('success', 'Expense duplicated')
      await loadExpenses()
    } catch (err) {
      pushToast('error', err.message)
    }
  }

  const handleDeleteExpense = async (id) => {
    const shouldDelete = window.confirm('Delete this expense? This action cannot be undone.')
    if (!shouldDelete) {
      return
    }

    try {
      await removeExpense(id)
      pushToast('success', 'Expense deleted successfully')
      await loadExpenses()
    } catch (err) {
      pushToast('error', err.message)
    }
  }

  const handleExportCsv = () => {
    if (filteredExpenses.length === 0) {
      pushToast('error', 'No rows available to export')
      return
    }

    const headers = ['title', 'amount', 'category', 'date', 'description']
    const rows = filteredExpenses.map((expense) =>
      [expense.title, expense.amount, expense.category, expense.date, expense.description || '']
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(','),
    )

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    pushToast('success', 'CSV exported')
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <section className="card">
        <div className="list-head">
          <h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button type="button" className="secondary" onClick={handleExportCsv}>
            Export CSV
          </button>
        </div>
        <ExpenseForm
          initialValues={editingExpense}
          submitLabel={editingExpense ? 'Update Expense' : 'Add Expense'}
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          onCancel={editingExpense ? () => setEditingExpense(null) : undefined}
        />
      </section>

      <section className="card top-gap">
        <div className="list-head">
          <h2>All Expenses</h2>
          <span className="muted">Showing {filteredExpenses.length} result(s)</span>
        </div>

        <div className="toolbar-row">
          <input
            type="text"
            placeholder="Search title/category/description"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Amount high to low</option>
            <option value="amount-asc">Amount low to high</option>
          </select>
          <select value={datePreset} onChange={(event) => setDatePreset(event.target.value)}>
            <option value="all">All dates</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="custom">Custom range</option>
          </select>
        </div>

        {datePreset === 'custom' && (
          <div className="toolbar-row custom-row">
            <input
              type="date"
              value={customStartDate}
              onChange={(event) => setCustomStartDate(event.target.value)}
            />
            <input
              type="date"
              value={customEndDate}
              onChange={(event) => setCustomEndDate(event.target.value)}
            />
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setCustomStartDate('')
                setCustomEndDate('')
              }}
            >
              Clear dates
            </button>
          </div>
        )}

        <ExpenseList
          expenses={filteredExpenses}
          loading={loading}
          onEdit={setEditingExpense}
          onDelete={handleDeleteExpense}
          onDuplicate={handleDuplicateExpense}
        />
      </section>
    </>
  )
}

export default ExpensesPage
