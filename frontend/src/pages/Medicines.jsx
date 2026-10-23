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

const CATEGORIES = [
  'Analgesic', 'Antibiotic', 'Antihistamine', 'Antihypertensive', 'Antidiabetic',
  'Respiratory', 'Gastrointestinal', 'Vitamin', 'Supplement', 'Cardiovascular',
  'Topical', 'Antiseptic',
];

const EMPTY_FORM = { name: '', generic_name: '', category: '', unit: '', reorder_level: '', description: '' };

export default function Medicines() {
  const { isAdmin } = useAuth();

  // list state
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // add / edit form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // delete and details state
  const [deleting, setDeleting] = useState(null);
  const [details, setDetails] = useState(null);

  // wait until the user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // load the list whenever the page, search, category or reload counter changes
  useEffect(() => {
    
    api
      .get('/medicines', { params: { page, search: query, category } })
      .then((res) => {
        setRows(res.data.data);
        setMeta(res.data.meta);
        setError('');
      })
      .catch(() => setError('Could not load medicines. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, query, category, reload]);

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
      name: row.name,
      generic_name: row.generic_name || '',
      category: row.category,
      unit: row.unit,
      reorder_level: row.reorder_level,
      description: row.description || '',
    });
    setErrors({});
    setSuccess('');
    setFormOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // client-side validation
  const validate = () => {
    const found = {};
    if (!form.name.trim()) found.name = 'Medicine name is required.';
    if (!form.category) found.category = 'Category is required.';
    if (!form.unit.trim()) found.unit = 'Unit is required.';
    if (form.reorder_level === '' || Number(form.reorder_level) < 0) {
      found.reorder_level = 'Reorder level must be 0 or more.';
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
        await api.put(`/medicines/${editingId}`, form);
      } else {
        await api.post('/medicines', form);
      }
      setFormOpen(false);
      setSuccess(editingId ? 'Medicine updated.' : 'Medicine added.');
      setReload((n) => n + 1);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(firstErrors(err.response.data.errors)); // errors from Laravel
      } else {
        setFormOpen(false);
        setError('Could not save the medicine. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/medicines/${deleting.id}`);
      setSuccess('Medicine deleted.');
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else setReload((n) => n + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the medicine.');
    } finally {
      setDeleting(null);
      setSaving(false);
    }
  };

  const showDetails = async (id) => {
    try {
      const res = await api.get(`/medicines/${id}`);
      setDetails(res.data.data);
    } catch {
      setError('Could not load the medicine details.');
    }
  };

  return (
    <>
      <div className='page-head'>
        <h1>Medicines</h1>
        {isAdmin && (
          <button className='btn btn-primary' onClick={openCreate}>+ Add Medicine</button>
        )}
      </div>

      {success && <Alert type='success'>{success}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className='toolbar'>
        <input
          type='search'
          placeholder='Search by name or generic name'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value=''>All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className='panel'>
        {loading && <Spinner />}
        {!loading && rows.length === 0 && <p className='empty'>No medicines found.</p>}
        {!loading && rows.length > 0 && (
          <table className='table'>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Reorder level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.name}
                    <br />
                    <small>{m.generic_name}</small>
                  </td>
                  <td>{m.category}</td>
                  <td>{m.unit}</td>
                  <td>
                    {m.total_stock} {m.is_low_stock && <StatusBadge status='low' />}
                  </td>
                  <td>{m.reorder_level}</td>
                  <td>
                    <div className='row-actions'>
                      <button className='btn btn-sm' onClick={() => showDetails(m.id)}>View</button>
                      {isAdmin && (
                        <>
                          <button className='btn btn-sm' onClick={() => openEdit(m)}>Edit</button>
                          <button className='btn btn-sm btn-danger' onClick={() => setDeleting(m)}>Delete</button>
                        </>
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
        <Modal title={editingId ? 'Edit Medicine' : 'Add Medicine'} onClose={() => setFormOpen(false)}>
          <form onSubmit={handleSubmit} noValidate>
            <FormInput label='Name' name='name' value={form.name} onChange={handleChange} error={errors.name} />
            <FormInput label='Generic name' name='generic_name' value={form.generic_name} onChange={handleChange} error={errors.generic_name} />
            <FormInput label='Category' name='category' as='select' value={form.category} onChange={handleChange} error={errors.category}>
              <option value=''>Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FormInput>
            <FormInput label='Unit (tablet, capsule, bottle...)' name='unit' value={form.unit} onChange={handleChange} error={errors.unit} />
            <FormInput label='Reorder level' name='reorder_level' type='number' min='0' value={form.reorder_level} onChange={handleChange} error={errors.reorder_level} />
            <FormInput label='Description' name='description' as='textarea' rows='3' value={form.description} onChange={handleChange} error={errors.description} />
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
          title='Delete medicine'
          message={`Delete ${deleting.name}? Its batches will be deleted too. This cannot be undone.`}
          confirmLabel='Delete'
          danger
          loading={saving}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {details && (
        <Modal title={details.name} onClose={() => setDetails(null)}>
          <p>{details.generic_name} - {details.category} - {details.unit}</p>
          <p>Total stock: <strong>{details.total_stock}</strong> (reorder level {details.reorder_level})</p>
          <h3>Batches</h3>
          {details.batches.length === 0 ? (
            <p className='empty'>No batches yet.</p>
          ) : (
            <table className='table'>
              <thead>
                <tr><th>Batch</th><th>Qty</th><th>Expires</th><th>Status</th></tr>
              </thead>
              <tbody>
                {details.batches.map((b) => (
                  <tr key={b.id}>
                    <td>{b.batch_number}</td>
                    <td>{b.quantity}</td>
                    <td>{b.expiration_date}</td>
                    <td><StatusBadge status={b.expiry_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </>
  );
}