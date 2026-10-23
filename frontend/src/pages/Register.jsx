import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { firstErrors } from '../api/errors';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to='/' replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const found = {};
    if (!form.name.trim()) found.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = 'Enter a valid email address.';
    if (form.password.length < 8) found.password = 'Password must be at least 8 characters.';
    if (form.password !== form.password_confirmation) found.password_confirmation = 'Passwords do not match.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(firstErrors(err.response.data.errors)); // e.g. email already taken
      } else {
        setMessage('Cannot reach the server. Is the API running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <form className='login-card' onSubmit={handleSubmit} noValidate>
        <h1>Create an account</h1>
        <p className='subtitle'>Barangay Health Center staff</p>

        {message && <Alert>{message}</Alert>}

        <FormInput label='Name' name='name' value={form.name} onChange={handleChange} error={errors.name} />
        <FormInput label='Email' name='email' type='email' value={form.email} onChange={handleChange} error={errors.email} />
        <FormInput label='Password' name='password' type='password' value={form.password} onChange={handleChange} error={errors.password} />
        <FormInput label='Confirm password' name='password_confirmation' type='password' value={form.password_confirmation} onChange={handleChange} error={errors.password_confirmation} />

        <button type='submit' disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        <p className='subtitle'>Already have an account? <Link to='/login'>Login</Link></p>
      </form>
    </div>
  );
}