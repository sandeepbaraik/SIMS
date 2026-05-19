import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import EmptyState from "../components/EmptyState";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts(searchValue = "") {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      }

      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiRequest(`/products${query}`);
      setProducts(data.items);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProducts(search);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  async function handleDelete(productId) {
    const confirmed = window.confirm("Delete this product? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/products/${productId}`, { method: "DELETE" });
      await loadProducts(search);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Products</h1>
          <p className="text-muted mb-0">Manage your inventory catalog and stock levels.</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          Add product
        </Link>
      </div>

      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-6 col-lg-4">
          <label className="form-label">Search by name or SKU</label>
          <input
            className="form-control"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
          />
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-muted">Loading products...</div>
          ) : products.length ? (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Low stock</th>
                    <th>Selling price</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>{product.quantityOnHand}</td>
                      <td>
                        {product.isLowStock ? (
                          <span className="badge text-bg-warning">Low</span>
                        ) : (
                          <span className="badge text-bg-success">Healthy</span>
                        )}
                      </td>
                      <td>
                        {product.sellingPrice !== null
                          ? `₹${Number(product.sellingPrice).toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No products yet"
              description="Create your first product to start tracking inventory."
            />
          )}
        </div>
      </div>
    </div>
  );
}
