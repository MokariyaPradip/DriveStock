import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'

function ShellLayout({ children }) {
  const navLinkClass = ({ isActive }) =>
    [
      'rounded-full px-4 py-2 text-sm font-medium transition',
      isActive ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ')

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-black text-white shadow-glow">
              D
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">DriveStock</p>
              <p className="text-xs text-slate-500">Inventory control for dealerships</p>
            </div>
          </NavLink>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClass}>
              Register
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

function AuthCard({ title, subtitle, children }) {
  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">DriveStock</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function DashboardPage() {
  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Inventory dashboard</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Manage dealership stock from one place.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Browse vehicles, prepare purchases, and keep the inventory organized with role-based controls for admins.
            </p>
          </div>
          <div className="rounded-2xl bg-brand-50 px-5 py-4 text-sm font-medium text-brand-900 ring-1 ring-brand-100">
            Shell ready for API integration
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ['Vehicles', '0', 'Ready to load from the API'],
            ['In stock', '0', 'Purchase actions will update here'],
            ['Admin tools', 'Locked', 'Create, edit, delete, and restock'],
          ].map(([label, value, hint]) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 p-8 text-white shadow-glow">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-100">Workflow</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">A clean foundation for inventory operations.</h2>
        <ul className="mt-6 space-y-4 text-sm leading-6 text-brand-50/90">
          <li>• Login and register routes are in place</li>
          <li>• Dashboard layout is ready for live vehicle data</li>
          <li>• Navigation is shared across all screens</li>
          <li>• Tailwind utilities handle the full visual system</li>
        </ul>
      </aside>
    </div>
  )
}

function LoginPage() {
  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue managing your dealership inventory.">
      <form className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        <button
          type="button"
          className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700"
        >
          Sign in
        </button>
      </form>
    </AuthCard>
  )
}

function RegisterPage() {
  return (
    <AuthCard title="Create your account" subtitle="Register to start using the DriveStock dashboard.">
      <form className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            placeholder="Create a secure password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        <button
          type="button"
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Create account
        </button>
      </form>
    </AuthCard>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ShellLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ShellLayout>
    </BrowserRouter>
  )
}
