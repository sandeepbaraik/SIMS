export default function EmptyState({ title, description }) {
  return (
    <div className="border rounded-4 p-4 text-center bg-light-subtle">
      <h3 className="h5">{title}</h3>
      <p className="text-muted mb-0">{description}</p>
    </div>
  );
}
