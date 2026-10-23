
const LABELS = {
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  pending: 'Pending',
  approved: 'Approved',
  completed: 'Completed',
  rejected: 'Rejected',
  low: 'Low stock',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status status-${status}`}>
      {LABELS[status] || status}
    </span>
  );
}
