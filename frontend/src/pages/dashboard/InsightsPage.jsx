import { useEffect, useMemo, useState } from 'react'
import { getExpenses } from '../../services/api'
import {
  amountFormatter,
  getCategoryChart,
  getMonthComparison,
  getMonthlyChart,
  getSpendInsight,
} from './helpers'

function InsightsPage() {
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    const load = async () => {
      setExpenses(await getExpenses())
    }

    load()
  }, [])

  const comparison = useMemo(() => getMonthComparison(expenses), [expenses])
  const insight = useMemo(() => getSpendInsight(expenses, comparison), [expenses, comparison])
  const categoryChart = useMemo(() => getCategoryChart(expenses), [expenses])
  const monthlyChart = useMemo(() => getMonthlyChart(expenses), [expenses])

  return (
    <section className="card">
      <h2>Insights</h2>

      <div className="trend-note top-gap">
        <h3>Where Money Went Most</h3>
        <p>{insight.trendMessage}</p>
        <div className="trend-meta">
          <span>
            Current top: {insight.currentTop ? `${insight.currentTop.category} (${amountFormatter.format(insight.currentTop.total)})` : 'N/A'}
          </span>
          <span>
            Previous top: {insight.previousTop ? `${insight.previousTop.category} (${amountFormatter.format(insight.previousTop.total)})` : 'N/A'}
          </span>
        </div>
      </div>

      <div className="charts-grid top-gap">
        <div className="chart-card">
          <h3>Category Spend</h3>
          {categoryChart.rows.length === 0 ? (
            <p className="muted">No data available for chart.</p>
          ) : (
            <div className="bars-wrap">
              {categoryChart.rows.map((row) => (
                <div key={row.name} className="bar-row">
                  <div className="bar-label">{row.name}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(row.total / (categoryChart.max || 1)) * 100}%` }} />
                  </div>
                  <div className="bar-value">{amountFormatter.format(row.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>Monthly Spend (Last 6 Months)</h3>
          {monthlyChart.rows.length === 0 ? (
            <p className="muted">No data available for chart.</p>
          ) : (
            <div className="bars-wrap">
              {monthlyChart.rows.map((row) => (
                <div key={row.month} className="bar-row">
                  <div className="bar-label">{row.month}</div>
                  <div className="bar-track">
                    <div className="bar-fill monthly" style={{ width: `${(row.total / (monthlyChart.max || 1)) * 100}%` }} />
                  </div>
                  <div className="bar-value">{amountFormatter.format(row.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default InsightsPage
