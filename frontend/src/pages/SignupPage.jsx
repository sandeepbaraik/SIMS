import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organizationName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signup(form);
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your StockFlow Workspace"
      subtitle="Set up your inventory account to create and manage products."
      alternateLabel="Already have an account? Log in"
      alternatePath="/login"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Organization name</label>
          <input
            className="form-control"
            name="organizationName"
            value={form.organizationName}
            onChange={updateField}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            minLength="6"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm password</label>
          <input
            className="form-control"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={updateField}
            minLength="6"
            required
          />
        </div>
        {error ? <div className="alert alert-danger py-2">{error}</div> : null}
        <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
          {submitting ? "Creating workspace..." : "Create workspace"}
        </button>
      </form>
    </AuthShell>
  );
}
