
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <>
      <header className="navbar">
        <span className="brand">Medicine Monitor</span>

        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/medicines">
            Medicines
          </NavLink>
        </nav>

        <div className="navbar-user">
          <span>{user.name}</span>

          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-staff'}`}>
            {user.role}
          </span>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
