import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const response = await apiRequest("/dashboard");
        if (isMounted) {
          setData(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-muted">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Dashboard</h1>
          <p className="text-muted mb-0">A quick snapshot of inventory health for your org.</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          Add product
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 dashboard-metric h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase mb-2">Total products</div>
              <div className="display-6 fw-semibold">{data?.totalProducts ?? 0}</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 dashboard-metric h-100">
            <div className="card-body">
              <div className="text-muted small text-uppercase mb-2">Units on hand</div>
              <div className="display-6 fw-semibold">{data?.totalQuantityOnHand ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h2 className="h5 mb-1">Low stock items</h2>
              <p className="text-muted mb-0">Products currently at or below their threshold.</p>
            </div>
            <Link to="/products" className="btn btn-outline-primary btn-sm">
              View all products
            </Link>
          </div>

          {data?.lowStockItems?.length ? (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.sku}</td>
                      <td>{item.quantityOnHand}</td>
                      <td>{item.lowStockThreshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No low stock items"
              description="Your current product list is above the defined thresholds."
            />
          )}
        </div>
      </div>
    </div>
  );
}
