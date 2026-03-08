import { useEffect, useState } from 'react'

const today = new Date().toISOString().slice(0, 10)

const emptyForm = {
  title: '',
  amount: '',
  category: '',
  date: today,
  description: '',
}

function ExpenseForm({ initialValues, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || '',
        amount: initialValues.amount || '',
        category: initialValues.category || '',
        date: initialValues.date || today,
        description: initialValues.description || '',
      })
      return
    }

    setForm(emptyForm)
  }, [initialValues])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    onSubmit({
      ...form,
      amount: Number(form.amount),
      category: form.category.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
    })

    if (!initialValues) {
      setForm(emptyForm)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <input
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        required
      />
      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        required
      />
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        max={today}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        rows="3"
      />

      <div className="actions-row">
        <button type="submit">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default ExpenseForm
