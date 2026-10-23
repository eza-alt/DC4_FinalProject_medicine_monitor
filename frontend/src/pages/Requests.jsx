import { useEffect, useState } from 'react';
import api from '../api/axios';
import { firstErrors } from '../api/errors';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

const EMPTY_FORM = { medicine_id: '', quantity: '', reason: '' };

// which buttons the admin sees for each status
const ACTIONS = {
  pending: [
    { status: 'approved', label: 'Approve', style: 'btn-primary' },
    { status: 'rejected', label: 'Reject', style: 'btn-danger' },
  ],
  approved: [
    { status: 'completed', label: 'Complete', style: 'btn-primary' },
    { status: 'rejected', label: 'Reject', style: 'btn-danger' },
  ],
};

export default function Requests() {
  const { isAdmin } = useAuth();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [medicines, setMedicines] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [change, setChange] = useState(null); // admin: { request, status, label }
  const [cancelling, setCancelling] = useState(null); // staff: the request to cancel

  useEffect(() => {
    setLoading(true);
    api
      .get('/stock-requests', { params: { page, status } })
      .then((res) => {
        setRows(res.data.data);
        setMeta(res.data.meta);
        setError('');
      })
      .catch(() => setError('Could not load requests. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, status, reload]);

  // the medicine dropdown for staff, with available stock shown
  useEffect(() => {
    if (isAdmin) return;
    api
      .get('/medicines', { params: { all: 1 } })
      .then((res) => setMedicines(res.data.data))
      .catch(() => setError('Could not load the medicine list.'));
  }, [isAdmin]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSuccess('');
    setFormOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = {};
    if (!form.medicine_id) found.medicine_id = 'Select a medicine.';
    if (form.quantity === '' || Number(form.quantity) < 1) found.quantity = 'Quantity must be at least 1.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await api.post('/stock-requests', form);
      setFormOpen(false);
      setSuccess('Request submitted. The administrator will review it.');
      setPage(1);
      setReload((n) => n + 1);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(firstErrors(err.response.data.errors)); // e.g. not enough stock
      } else {
        setFormOpen(false);
        setError('Could not submit the request. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmChange = async () => {
    setSaving(true);
    try {
      await api.patch(`/stock-requests/${change.request.id}/status`, { status: change.status });
      setSuccess(`Request #${change.request.id} is now ${change.status}.`);
      setReload((n) => n + 1);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors?.status?.[0] || data?.message || 'Could not update the request.');
    } finally {
      setChange(null);
      setSaving(false);
    }
  };

  const confirmCancel = async () => {
    setSaving(true);
    try {
      await api.delete(`/stock-requests/${cancelling.id}`);
      setSuccess('Request cancelled.');
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else setReload((n) => n + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel the request.');
    } finally {
      setCancelling(null);
      setSaving(false);
    }
  };

  return (
    <>
      <div className='page-head'>
        <h1>{isAdmin ? 'Stock Requests' : 'My Stock Requests'}</h1>
        {!isAdmin && (
          <button className='btn btn-primary' onClick={openCreate}>+ New Request</button>
        )}
      </div>

      {success && <Alert type='success'>{success}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className='toolbar'>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value=''>All statuses</option>
          <option value='pending'>Pending</option>
          <option value='approved'>Approved</option>
          <option value='completed'>Completed</option>
          <option value='rejected'>Rejected</option>
        </select>
      </div>

      <div className='panel'>
        {loading && <Spinner />}
        {!loading && rows.length === 0 && <p className='empty'>No requests found.</p>}
        {!loading && rows.length > 0 && (
          <table className='table'>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Quantity</th>
                {isAdmin && <th>Requested by</th>}
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Reviewed by</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.medicine?.name}</td>
                  <td>{r.quantity} {r.medicine?.unit}</td>
                  {isAdmin && <td>{r.requested_by?.name}</td>}
                  <td>{r.reason || '-'}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.created_at?.slice(0, 10)}</td>
                  <td>{r.reviewed_by || '-'}</td>
                  <td>
                    <div className='row-actions'>
                      {isAdmin &&
                        (ACTIONS[r.status] || []).map((a) => (
                          <button
                            key={a.status}
                            className={`btn btn-sm ${a.style}`}
                            onClick={() => setChange({ request: r, status: a.status, label: a.label })}
                          >
                            {a.label}
                          </button>
                        ))}
                      {!isAdmin && r.status === 'pending' && (
                        <button className='btn btn-sm btn-danger' onClick={() => setCancelling(r)}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination meta={meta} onPage={setPage} />

      {formOpen && (
        <Modal title='New Stock Request' onClose={() => setFormOpen(false)}>
          <form onSubmit={handleSubmit} noValidate>
            <FormInput label='Medicine' name='medicine_id' as='select' value={form.medicine_id} onChange={handleChange} error={errors.medicine_id}>
              <option value=''>Select a medicine</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.total_stock} {m.unit} available)
                </option>
              ))}
            </FormInput>
            <FormInput label='Quantity' name='quantity' type='number' min='1' value={form.quantity} onChange={handleChange} error={errors.quantity} />
            <FormInput label='Reason' name='reason' as='textarea' rows='3' value={form.reason} onChange={handleChange} error={errors.reason} />
            <div className='modal-actions'>
              <button type='button' className='btn' onClick={() => setFormOpen(false)}>Cancel</button>
              <button type='submit' className='btn btn-primary' disabled={saving}>
                {saving ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {change && (
        <ConfirmDialog
          title={`${change.label} request`}
          message={`${change.label} request #${change.request.id} for ${change.request.quantity} ${change.request.medicine?.unit}(s) of ${change.request.medicine?.name}?`}
          confirmLabel={change.label}
          danger={change.status === 'rejected'}
          loading={saving}
          onConfirm={confirmChange}
          onCancel={() => setChange(null)}
        />
      )}

      {cancelling && (
        <ConfirmDialog
          title='Cancel request'
          message={`Cancel your request for ${cancelling.medicine?.name}?`}
          confirmLabel='Cancel request'
          danger
          loading={saving}
          onConfirm={confirmCancel}
          onCancel={() => setCancelling(null)}
        />
      )}
    </>
  );
}