export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      {Icon && <Icon className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />}
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
