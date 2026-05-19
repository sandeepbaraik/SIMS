import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { updateOrganization } = useAuth();
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const data = await apiRequest("/settings");
        if (isMounted) {
          setThreshold(data.defaultLowStockThreshold);
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

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = await apiRequest("/settings", {
        method: "PUT",
        body: JSON.stringify({ defaultLowStockThreshold: Number(threshold) }),
      });

      updateOrganization({ defaultLowStockThreshold: data.defaultLowStockThreshold });
      setSuccess("Default threshold updated.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-muted">Loading settings...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 mb-1">Settings</h1>
        <p className="text-muted mb-0">Define a fallback threshold used for low-stock detection.</p>
      </div>

      <form onSubmit={handleSubmit} className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Default low stock threshold</label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="1"
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                required
              />
            </div>
          </div>
          {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}
          {success ? <div className="alert alert-success mt-3 mb-0">{success}</div> : null}
        </div>
        <div className="card-footer bg-white d-flex justify-content-end">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
