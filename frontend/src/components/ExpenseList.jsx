const amountFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

function ExpenseList({ expenses, loading, onEdit, onDelete, onDuplicate }) {
  if (loading) {
    return <p className="muted">Loading expenses...</p>
  }

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <p>No expenses match your filters.</p>
        <span>Try clearing search/filter or add a new entry.</span>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.title}</td>
              <td>{amountFormatter.format(expense.amount || 0)}</td>
              <td>{expense.category}</td>
              <td>{expense.date ? new Date(expense.date).toLocaleDateString() : '-'}</td>
              <td>{expense.description || '-'}</td>
              <td>
                <div className="actions-row">
                  <button type="button" onClick={() => onEdit(expense)}>
                    Edit
                  </button>
                  <button type="button" className="secondary" onClick={() => onDuplicate(expense)}>
                    Duplicate
                  </button>
                  <button type="button" className="danger" onClick={() => onDelete(expense.id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ExpenseList
