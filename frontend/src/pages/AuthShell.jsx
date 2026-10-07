import { Link } from 'react-router-dom';

export default function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 top-24 h-96 w-96 rounded-full bg-teal-600/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500 text-lg">k</span> kinship.
        </Link>
        <div className="relative max-w-lg pb-10">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">A little closer, every day</p>
          <h2 className="text-5xl font-semibold leading-tight tracking-tight">Make room for what matters.</h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">A calm, private place for your family to stay connected, share a moment, and look out for each other.</p>
        </div>
        <p className="relative text-sm text-slate-400">Private by design · Built for your household</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-white">k</span> kinship.
          </Link>
          <p className="text-sm font-semibold text-teal-700">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-7 text-center text-sm text-slate-500">{footer}</p>}
        </div>
      </section>
    </main>
  );
}
