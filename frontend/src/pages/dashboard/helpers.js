export const amountFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export const getWeekStart = (date) => {
  const d = new Date(date)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

export const getWeekEnd = (date) => {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export const getSummary = (expenses) => {
  const monthKey = new Date().toISOString().slice(0, 7)
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  const thisMonth = expenses
    .filter((expense) => (expense.date || '').startsWith(monthKey))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

  return {
    total,
    thisMonth,
    records: expenses.length,
    categories: [...new Set(expenses.map((expense) => expense.category).filter(Boolean))].length,
  }
}

export const getMonthComparison = (expenses) => {
  const now = new Date()
  const currentMonthKey = now.toISOString().slice(0, 7)

  const prevDate = new Date(now)
  prevDate.setMonth(prevDate.getMonth() - 1)
  const previousMonthKey = prevDate.toISOString().slice(0, 7)

  const currentMonthTotal = expenses
    .filter((expense) => (expense.date || '').startsWith(currentMonthKey))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

  const previousMonthTotal = expenses
    .filter((expense) => (expense.date || '').startsWith(previousMonthKey))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

  const delta = currentMonthTotal - previousMonthTotal
  const deltaPercent = previousMonthTotal > 0 ? (delta / previousMonthTotal) * 100 : currentMonthTotal > 0 ? 100 : 0

  return {
    currentMonthKey,
    previousMonthKey,
    currentMonthTotal,
    previousMonthTotal,
    delta,
    deltaPercent,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'same',
  }
}

export const getSpendInsight = (expenses, comparison) => {
  const getTopCategoryForMonth = (monthKey) => {
    const monthMap = new Map()

    expenses
      .filter((expense) => (expense.date || '').startsWith(monthKey))
      .forEach((expense) => {
        const key = expense.category || 'Other'
        monthMap.set(key, Number(monthMap.get(key) || 0) + Number(expense.amount || 0))
      })

    const rows = [...monthMap.entries()].map(([category, total]) => ({ category, total }))
    rows.sort((a, b) => b.total - a.total)
    return rows[0] || null
  }

  const currentTop = getTopCategoryForMonth(comparison.currentMonthKey)
  const previousTop = getTopCategoryForMonth(comparison.previousMonthKey)

  let trendMessage = 'No trend available yet.'
  if (currentTop && previousTop) {
    if (currentTop.category === previousTop.category) {
      const gap = currentTop.total - previousTop.total
      if (gap > 0) {
        trendMessage = `${currentTop.category} remains #1 and increased by ${amountFormatter.format(gap)}.`
      } else if (gap < 0) {
        trendMessage = `${currentTop.category} remains #1 but dropped by ${amountFormatter.format(Math.abs(gap))}.`
      } else {
        trendMessage = `${currentTop.category} remains your top spend category.`
      }
    } else {
      trendMessage = `${currentTop.category} replaced ${previousTop.category} as your top spending category.`
    }
  } else if (currentTop) {
    trendMessage = `${currentTop.category} is currently your highest spending category.`
  }

  return {
    currentTop,
    previousTop,
    trendMessage,
  }
}

export const getCategoryChart = (expenses) => {
  const map = new Map()
  expenses.forEach((expense) => {
    const key = expense.category || 'Other'
    map.set(key, Number(map.get(key) || 0) + Number(expense.amount || 0))
  })

  const rows = [...map.entries()].map(([name, total]) => ({ name, total }))
  rows.sort((a, b) => b.total - a.total)
  return { rows, max: rows.length ? rows[0].total : 0 }
}

export const getMonthlyChart = (expenses) => {
  const map = new Map()

  expenses.forEach((expense) => {
    if (!expense.date) {
      return
    }
    const key = expense.date.slice(0, 7)
    map.set(key, Number(map.get(key) || 0) + Number(expense.amount || 0))
  })

  const rows = [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, total]) => ({ month, total }))

  return { rows, max: rows.reduce((m, row) => Math.max(m, row.total), 0) }
}

export const getMonthlyCategorySpend = (expenses) => {
  const monthKey = new Date().toISOString().slice(0, 7)
  const map = new Map()

  expenses
    .filter((expense) => (expense.date || '').startsWith(monthKey))
    .forEach((expense) => {
      const key = expense.category || 'Other'
      map.set(key, Number(map.get(key) || 0) + Number(expense.amount || 0))
    })

  return map
}
