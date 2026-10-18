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
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load the dashboard. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <>
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <StatCard label="Total Medicines" value={data.total_medicines} />
        <StatCard label="Low Stock" value={data.low_stock_medicines} tone="warning" />
        <StatCard label="Expiring Soon" value={data.expiring_soon_batches} tone="warning" />
        <StatCard label="Expired (with stock)" value={data.expired_batches} tone="danger" />
        <StatCard label="Pending Requests" value={data.pending_requests} tone="info" />
      </div>

      <div className="panel">
        <h2>Recent Transactions</h2>
        {data.recent_transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.medicine}</td>
                  <td>{t.batch_number}</td>
                  <td>{t.type === 'stock_in' ? 'Stock In' : 'Stock Out'}</td>
                  <td className={t.type === 'stock_in' ? 'in' : 'out'}>
                    {t.type === 'stock_in' ? '+' : '-'}{t.quantity}
                  </td>
                  <td>{t.date}</td>
                  <td>{t.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}