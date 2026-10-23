
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
  'Analgesic',
  'Antibiotic',
  'Antihistamine',
  'Antihypertensive',
  'Antidiabetic',
  'Respiratory',
  'Gastrointestinal',
  'Vitamin',
  'Supplement',
  'Cardiovascular',
  'Topical',
  'Antiseptic',
];

const EMPTY_FORM = {
  name: '',
  generic_name: '',
  category: '',
  unit: '',
  reorder_level: '',
  description: '',
};

export default function Medicines() {
  const { isAdmin } = useAuth();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadMedicines();
  }, [page, query, category]);

  async function loadMedicines() {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/medicines', {
        params: {
          page,
          search: query || undefined,
          category: category || undefined,
        },
      });

      setRows(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load medicines. Please check your API connection.'
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setError('');
    setSuccess('');
    setFormOpen(true);
  }

  function openEdit(medicine) {
    setEditingId(medicine.id);
    setForm({
      name: medicine.name || '',
      generic_name: medicine.generic_name || '',
      category: medicine.category || '',
      unit: medicine.unit || '',
      reorder_level: medicine.reorder_level ?? '',
      description: medicine.description || '',
    });
    setErrors({});
    setError('');
    setSuccess('');
    setFormOpen(true);
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  }

  async function saveMedicine(event) {
    event.preventDefault();

    setErrors({});
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.category || !form.unit.trim()) {
      setErrors({
        ...(!form.name.trim() && { name: 'Medicine name is required.' }),
        ...(!form.category && { category: 'Please select a category.' }),
        ...(!form.unit.trim() && { unit: 'Unit is required.' }),
      });
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      name: form.name.trim(),
      generic_name: form.generic_name.trim() || null,
      unit: form.unit.trim(),
      reorder_level:
        form.reorder_level === '' ? 0 : Number(form.reorder_level),
      description: form.description.trim() || null,
    };

    try {
      if (editingId) {
        await api.put(`/medicines/${editingId}`, payload);
        setSuccess('Medicine updated successfully.');
      } else {
        await api.post('/medicines', payload);
        setSuccess('Medicine added successfully.');
      }

      setFormOpen(false);
      await loadMedicines();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(firstErrors(err.response.data.errors || {}));
        setError('Please correct the highlighted fields.');
      } else {
        setError(
          err.response?.data?.message || 'Unable to save the medicine.'
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteMedicine() {
    if (!deleting) return;

    setError('');
    setSuccess('');

    try {
      await api.delete(`/medicines/${deleting.id}`);
      setDeleting(null);
      setSuccess('Medicine deleted successfully.');
      await loadMedicines();
    } catch (err) {
      setDeleting(null);
      setError(
        err.response?.data?.message || 'Unable to delete this medicine.'
      );
    }
  }

  async function viewDetails(medicine) {
    setError('');

    try {
      const res = await api.get(`/medicines/${medicine.id}`);
      setDetails(res.data.data || res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load medicine details.'
      );
    }
  }

  function changePage(nextPage) {
    setPage(nextPage);
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Medicines</h1>
          <p>Manage medicine information, stock levels, and expiry details.</p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Medicine
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search medicine name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <div className="empty">No medicines found.</div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Reorder Level</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((medicine) => (
                  <tr key={medicine.id}>
                    <td>
                      <strong>{medicine.name}</strong>
                    </td>
                    <td>{medicine.generic_name || '—'}</td>
                    <td>{medicine.category}</td>
                    <td>{medicine.unit}</td>
                    <td>{medicine.reorder_level}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-sm"
                          onClick={() => viewDetails(medicine)}
                        >
                          View
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              className="btn btn-sm"
                              onClick={() => openEdit(medicine)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setDeleting(medicine)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPage={changePage} />
        </>
      )}

      {formOpen && (
        <Modal
          title={editingId ? 'Edit Medicine' : 'Add Medicine'}
          onClose={() => {
            if (!saving) setFormOpen(false);
          }}
        >
          <form onSubmit={saveMedicine}>
            <FormInput
              label="Medicine Name *"
              name="name"
              value={form.name}
              onChange={updateField}
              error={errors.name}
              required
            />

            <FormInput
              label="Generic Name"
              name="generic_name"
              value={form.generic_name}
              onChange={updateField}
              error={errors.generic_name}
            />

            <FormInput
              as="select"
              label="Category *"
              name="category"
              value={form.category}
              onChange={updateField}
              error={errors.category}
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </FormInput>

            <FormInput
              label="Unit *"
              name="unit"
              value={form.unit}
              onChange={updateField}
              error={errors.unit}
              placeholder="e.g. tablet, capsule, bottle"
              required
            />

            <FormInput
              label="Reorder Level"
              name="reorder_level"
              type="number"
              min="0"
              value={form.reorder_level}
              onChange={updateField}
              error={errors.reorder_level}
            />

            <FormInput
              as="textarea"
              label="Description"
              name="description"
              rows={3}
              value={form.description}
              onChange={updateField}
              error={errors.description}
            />

            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : 'Add Medicine'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {details && (
        <Modal
          title={details.name || 'Medicine Details'}
          onClose={() => setDetails(null)}
        >
          <p>
            <strong>Generic name:</strong>{' '}
            {details.generic_name || '—'}
          </p>
          <p>
            <strong>Category:</strong> {details.category || '—'}
          </p>
          <p>
            <strong>Unit:</strong> {details.unit || '—'}
          </p>
          <p>
            <strong>Reorder level:</strong>{' '}
            {details.reorder_level ?? '—'}
          </p>
          <p>
            <strong>Total stock:</strong>{' '}
            {details.total_stock ?? 'Not available'}
          </p>
          <p>
            <strong>Stock status:</strong>{' '}
            {details.is_low_stock ? 'Low stock' : 'Normal'}
          </p>
          <p>
            <strong>Expiry status:</strong>{' '}
            {details.expiry_status || 'Not available'}
          </p>
          <p>
            <strong>Description:</strong>{' '}
            {details.description || '—'}
          </p>

          {Array.isArray(details.batches) && (
            <>
              <h3>Medicine Batches</h3>

              {details.batches.length === 0 ? (
                <p>No batches recorded.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Batch Number</th>
                        <th>Quantity</th>
                        <th>Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.batches.map((batch) => (
                        <tr key={batch.id}>
                          <td>{batch.batch_number || '—'}</td>
                          <td>{batch.quantity ?? '—'}</td>
                          <td>{batch.expiry_date || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Medicine"
          message={`Are you sure you want to delete "${deleting.name}"? The server may prevent deletion if related records exist.`}
          confirmLabel="Delete"
          danger
          onConfirm={deleteMedicine}
          onCancel={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
