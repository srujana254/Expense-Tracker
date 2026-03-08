import { useEffect, useMemo, useState } from 'react'
import { getExpenses } from '../../services/api'
import { amountFormatter, getMonthComparison, getSpendInsight, getSummary } from './helpers'

function OverviewPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        setExpenses(await getExpenses())
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const summary = useMemo(() => getSummary(expenses), [expenses])
  const comparison = useMemo(() => getMonthComparison(expenses), [expenses])
  const insight = useMemo(() => getSpendInsight(expenses, comparison), [expenses, comparison])

  return (
    <section className="card">
      <h2>Overview</h2>
      {loading ? <p className="muted top-gap">Loading data...</p> : null}

      <div className="comparison-grid comparison-grid-two top-gap">
        <article className="compare-card">
          <span>Total Spend</span>
          <strong>{amountFormatter.format(summary.total)}</strong>
        </article>
        <article className="compare-card">
          <span>Current Month ({comparison.currentMonthKey})</span>
          <strong>{amountFormatter.format(comparison.currentMonthTotal)}</strong>
        </article>
        <article className="compare-card">
          <span>Previous Month ({comparison.previousMonthKey})</span>
          <strong>{amountFormatter.format(comparison.previousMonthTotal)}</strong>
        </article>
        <article className="compare-card">
          <span>Difference</span>
          <strong>{amountFormatter.format(Math.abs(comparison.delta))}</strong>
          <p className={`trend-pill ${comparison.direction}`}>
            {comparison.direction === 'up' ? 'Higher than last month' : ''}
            {comparison.direction === 'down' ? 'Lower than last month' : ''}
            {comparison.direction === 'same' ? 'Same as last month' : ''}
            {comparison.direction !== 'same' ? ` (${Math.abs(comparison.deltaPercent).toFixed(1)}%)` : ''}
          </p>
        </article>
      </div>

      <div className="trend-note top-gap">
        <h3>Where Money Went Most</h3>
        <p>{insight.trendMessage}</p>
      </div>
    </section>
  )
}

export default OverviewPage
