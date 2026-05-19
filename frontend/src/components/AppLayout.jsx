import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Products", path: "/products" },
  { label: "Settings", path: "/settings" },
];

export default function AppLayout() {
  const { logout, organization, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="bg-shell min-vh-100">
      <nav className="navbar navbar-expand-lg app-navbar border-bottom">
        <div className="container py-2">
          <div>
            <span className="navbar-brand fw-semibold mb-0">StockFlow</span>
            <div className="small text-muted">{organization?.name}</div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block">
              <div className="small fw-semibold">{user?.email}</div>
              <div className="small text-muted">User</div>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="card shadow-sm border-0">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex flex-wrap gap-2 mb-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `btn btn-sm ${isActive ? "btn-primary" : "btn-outline-primary"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
