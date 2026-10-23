import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        setError(
          'Could not load the dashboard. Please try again.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-panel">
        <Spinner />
        <p>Preparing your inventory overview…</p>
      </div>
    );
  }

  if (error) {
    return <Alert>{error}</Alert>;
  }

  if (!data) {
    return (
      <div className="empty">
        Dashboard information is not available.
      </div>
    );
  }

  const transactions = data.recent_transactions || [];

  return (
    <>
      {/* WELCOME BANNER */}
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow-pill">
            <span className="pulse-dot" />
            INVENTORY OVERVIEW
          </span>

          <h1>
            Good care starts with{' '}
            <span>well-managed stock.</span>
          </h1>

          <p>
            Monitor medicine availability, track expiry dates,
            and stay on top of stock requests from one place.
          </p>
        </div>

        <div className="welcome-art" aria-hidden="true">
          <div className="art-circle art-circle-one" />
          <div className="art-circle art-circle-two" />

          <div className="medical-cross">✚</div>

          <div className="art-pill">
            CARE · TRACK · PROTECT
          </div>
        </div>
      </section>

      {/* SUMMARY SECTION */}
      <div className="section-heading">
        <div>
          <span className="section-kicker">AT A GLANCE</span>

          <h2>Stock health summary</h2>
        </div>

        <span className="live-indicator">
          <span />
          Current overview
        </span>
      </div>

      {/* SUMMARY CARDS */}
      <div className="stats-grid">
        <StatCard
          label="Total Medicines"
          value={data.total_medicines}
          tone="default"
        />

        <StatCard
          label="Low Stock"
          value={data.low_stock_medicines}
          tone="warning"
        />

        <StatCard
          label="Expiring Soon"
          value={data.expiring_soon_batches}
          tone="warning"
        />

        <StatCard
          label="Expired (with stock)"
          value={data.expired_batches}
          tone="danger"
        />

        <StatCard
          label="Pending Requests"
          value={data.pending_requests}
          tone="info"
        />
      </div>

      {/* RECENT TRANSACTIONS */}
      <section className="panel transactions-panel">
        <div className="panel-heading">
          <div className="panel-heading-icon">↕</div>

          <div>
            <h2>Recent transactions</h2>

            <p>
              Latest stock movement recorded in the system
            </p>
          </div>

          <span className="table-count">
            {transactions.length} recent
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">▤</div>

            <strong>No transactions yet</strong>

            <p>
              Stock activity will appear here when it is recorded.
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>MEDICINE</th>
                <th>BATCH NUMBER</th>
                <th>MOVEMENT</th>
                <th>QUANTITY</th>
                <th>DATE</th>
                <th>RECORDED BY</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => {
                const isStockIn =
                  transaction.type === 'stock_in';

                return (
                  <tr key={transaction.id}>
                    <td>
                      <span className="medicine-cell-icon">
                        ✚
                      </span>

                      <strong className="table-primary-text">
                        {transaction.medicine}
                      </strong>
                    </td>

                    <td>
                      <span className="batch-code">
                        {transaction.batch_number}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`movement-tag ${
                          isStockIn
                            ? 'movement-in'
                            : 'movement-out'
                        }`}
                      >
                        <span>
                          {isStockIn ? '↙' : '↗'}
                        </span>

                        {isStockIn ? 'Stock In' : 'Stock Out'}
                      </span>
                    </td>

                    <td className={isStockIn ? 'in' : 'out'}>
                      {isStockIn ? '+' : '−'}
                      {transaction.quantity}
                    </td>

                    <td>{transaction.date}</td>

                    <td>{transaction.by}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}