import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, alternateLabel, alternatePath, children }) {
  return (
    <div className="min-vh-100 d-flex align-items-center auth-shell">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-7 col-xl-5">
            <div className="card border-0 shadow-lg auth-card">
              <div className="card-body p-4 p-md-5">
                <div className="mb-4">
                  <span className="badge text-bg-primary mb-3">StockFlow</span>
                  <h1 className="h3 mb-2">{title}</h1>
                  <p className="text-muted mb-0">{subtitle}</p>
                </div>
                {children}
                <div className="small text-muted mt-4">
                  <Link to={alternatePath} className="text-decoration-none">
                    {alternateLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
