import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";

const initialFormState = {
  name: "",
  sku: "",
  description: "",
  quantityOnHand: 0,
  costPrice: "",
  sellingPrice: "",
  lowStockThreshold: "",
};

export default function ProductFormPage({ mode }) {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !productId) {
      return undefined;
    }

    let isMounted = true;

    async function loadProduct() {
      try {
        const data = await apiRequest(`/products/${productId}`);

        if (isMounted) {
          setForm({
            name: data.name || "",
            sku: data.sku || "",
            description: data.description || "",
            quantityOnHand: data.quantityOnHand ?? 0,
            costPrice: data.costPrice ?? "",
            sellingPrice: data.sellingPrice ?? "",
            lowStockThreshold: data.lowStockThreshold ?? "",
          });
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

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [mode, productId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        quantityOnHand: Number(form.quantityOnHand),
      };

      if (mode === "edit") {
        await apiRequest(`/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      navigate("/products");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-muted">Loading product...</div>;
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">{mode === "edit" ? "Edit product" : "Add product"}</h1>
          <p className="text-muted mb-0">
            Capture inventory details, pricing, and low-stock rules for this item.
          </p>
        </div>
        <Link to="/products" className="btn btn-outline-secondary">
          Back to products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card border-0 shadow-sm">
        <div className="card-body">
          {error ? <div className="alert alert-danger">{error}</div> : null}

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Product name</label>
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={updateField}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">SKU</label>
              <input
                className="form-control"
                name="sku"
                value={form.sku}
                onChange={updateField}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                name="description"
                value={form.description}
                onChange={updateField}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Quantity on hand</label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="1"
                name="quantityOnHand"
                value={form.quantityOnHand}
                onChange={updateField}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Cost price</label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                name="costPrice"
                value={form.costPrice}
                onChange={updateField}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Selling price</label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                name="sellingPrice"
                value={form.sellingPrice}
                onChange={updateField}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Low stock threshold</label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="1"
                name="lowStockThreshold"
                value={form.lowStockThreshold}
                onChange={updateField}
                placeholder="Uses org default if blank"
              />
            </div>
          </div>
        </div>
        <div className="card-footer bg-white d-flex justify-content-end gap-2">
          <Link to="/products" className="btn btn-outline-secondary">
            Cancel
          </Link>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save product"}
          </button>
        </div>
      </form>
    </div>
  );
}
