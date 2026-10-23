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

const EMPTY_FORM = { medicine_id: '', batch_number: '', quantity: '', received_date: '', expiration_date: '' };

export default function Batches() {
  const { isAdmin } = useAuth();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [expiry, setExpiry] = useState('');
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [medicines, setMedicines] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/batches', { params: { page, search: query, expiry_status: expiry } })
      .then((res) => {
        setRows(res.data.data);
        setMeta(res.data.meta);
        setError('');
      })
      .catch(() => setError('Could not load batches. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, query, expiry, reload]);

  // the medicine dropdown in the form (admins only)
  useEffect(() => {
    if (!isAdmin) return;
    api
      .get('/medicines', { params: { all: 1 } })
      .then((res) => setMedicines(res.data.data))
      .catch(() => setError('Could not load the medicine list.'));
  }, [isAdmin]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSuccess('');
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      medicine_id: row.medicine_id,
      batch_number: row.batch_number,
      quantity: row.quantity,
      received_date: row.received_date,
      expiration_date: row.expiration_date,
    });
    setErrors({});
    setSuccess('');
    setFormOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const found = {};
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

    if (!form.medicine_id) found.medicine_id = 'Select a medicine.';
    if (!form.batch_number.trim()) found.batch_number = 'Batch number is required.';
    if (form.quantity === '' || Number(form.quantity) < (editingId ? 0 : 1)) {
      found.quantity = editingId ? 'Quantity must be 0 or more.' : 'Quantity must be greater than 0.';
    }
    if (!form.received_date) found.received_date = 'Date received is required.';
    else if (form.received_date > today) found.received_date = 'Date received cannot be in the future.';
    if (!form.expiration_date) found.expiration_date = 'Expiration date is required.';
    else if (form.received_date && form.expiration_date < form.received_date) {
      found.expiration_date = 'Expiration date cannot be before the date received.';
    }
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/batches/${editingId}`, form);
      } else {
        await api.post('/batches', form);
      }
      setFormOpen(false);
      setSuccess(editingId ? 'Batch updated.' : 'Batch added.');
      setReload((n) => n + 1);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(firstErrors(err.response.data.errors));
      } else {
        setFormOpen(false);
        setError('Could not save the batch. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/batches/${deleting.id}`);
      setSuccess('Batch deleted.');
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else setReload((n) => n + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the batch.');
    } finally {
      setDeleting(null);
      setSaving(false);
    }
  };

  return (
    <>
      <div className='page-head'>
        <h1>Medicine Batches</h1>
        {isAdmin && (
          <button className='btn btn-primary' onClick={openCreate}>+ Add Batch</button>
        )}
      </div>

      {success && <Alert type='success'>{success}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className='toolbar'>
        <input
          type='search'
          placeholder='Search by batch number or medicine'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={expiry}
          onChange={(e) => {
            setExpiry(e.target.value);
            setPage(1);
          }}
        >
          <option value=''>All expiry statuses</option>
          <option value='active'>Active</option>
          <option value='expiring_soon'>Expiring Soon</option>
          <option value='expired'>Expired</option>
        </select>
      </div>

      <div className='panel'>
        {loading && <Spinner />}
        {!loading && rows.length === 0 && <p className='empty'>No batches found.</p>}
        {!loading && rows.length > 0 && (
          <table className='table'>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch no.</th>
                <th>Quantity</th>
                <th>Received</th>
                <th>Expires</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>{b.medicine?.name}</td>
                  <td>{b.batch_number}</td>
                  <td>{b.quantity}</td>
                  <td>{b.received_date}</td>
                  <td>{b.expiration_date}</td>
                  <td><StatusBadge status={b.expiry_status} /></td>
                  {isAdmin && (
                    <td>
                      <div className='row-actions'>
                        <button className='btn btn-sm' onClick={() => openEdit(b)}>Edit</button>
                        <button className='btn btn-sm btn-danger' onClick={() => setDeleting(b)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination meta={meta} onPage={setPage} />

      {formOpen && (
        <Modal title={editingId ? 'Edit Batch' : 'Add Batch'} onClose={() => setFormOpen(false)}>
          <form onSubmit={handleSubmit} noValidate>
            <FormInput label='Medicine' name='medicine_id' as='select' value={form.medicine_id} onChange={handleChange} error={errors.medicine_id}>
              <option value=''>Select a medicine</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </FormInput>
            <FormInput label='Batch number' name='batch_number' value={form.batch_number} onChange={handleChange} error={errors.batch_number} />
            <FormInput label='Quantity' name='quantity' type='number' min='0' value={form.quantity} onChange={handleChange} error={errors.quantity} />
            <FormInput label='Date received' name='received_date' type='date' value={form.received_date} onChange={handleChange} error={errors.received_date} />
            <FormInput label='Expiration date' name='expiration_date' type='date' value={form.expiration_date} onChange={handleChange} error={errors.expiration_date} />
            <div className='modal-actions'>
              <button type='button' className='btn' onClick={() => setFormOpen(false)}>Cancel</button>
              <button type='submit' className='btn btn-primary' disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title='Delete batch'
          message={`Delete batch ${deleting.batch_number}? Its stock records will be deleted too. This cannot be undone.`}
          confirmLabel='Delete'
          danger
          loading={saving}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}