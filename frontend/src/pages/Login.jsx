import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Client-side validation
    const clientErrors = {};
    if (!form.email.trim()) clientErrors.email = 'Email is required.';
    if (!form.password) clientErrors.password = 'Password is required.';
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        setErrors(Object.fromEntries(Object.entries(serverErrors).map(([k, v]) => [k, v[0]])));
      } else if (err.response?.status === 401) {
        setMessage(err.response.data.message);
      } else {
        setMessage('Cannot reach the server. Is the API running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <h1>Medicine Monitor</h1>
        <p className="subtitle">Barangay Health Center</p>

        {message && <div className="alert-error">{message}</div>}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        {errors.email && <small className="field-error">{errors.email}</small>}

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
        {errors.password && <small className="field-error">{errors.password}</small>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}