import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { loginUser, registerUser } from './api/auth'
import { fetchVehicles } from './api/vehicles'
import { clearStoredToken, getStoredToken, isAuthenticated, setStoredToken } from './lib/auth'

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

function useAuthRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = getStoredToken()

    if (token && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/', { replace: true })
    }

    if (!token && location.pathname === '/') {
      navigate('/login', { replace: true })
    }
  }, [location.pathname, navigate])
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
  const navigate = useNavigate()
  const [token, setToken] = useState(getStoredToken())
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setToken(getStoredToken())
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadVehicles() {
      setLoading(true)
      setError('')

      try {
        const data = await fetchVehicles()
        if (isMounted) {
          setVehicles(data)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError?.response?.data?.detail || 'Unable to load vehicles right now.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (token) {
      loadVehicles()
    } else {
      setLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [token])

  const handleLogout = () => {
    clearStoredToken()
    setToken(null)
    navigate('/login', { replace: true })
  }

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

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">Session:</span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            {token ? 'Authenticated' : 'No token found'}
          </span>
          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              className="ml-auto rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Log out
            </button>
          ) : (
            <NavLink
              to="/login"
              className="ml-auto rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Sign in
            </NavLink>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ['Vehicles', String(vehicles.length), 'Ready to browse from the API'],
            ['In stock', String(vehicles.reduce((total, vehicle) => total + vehicle.quantity, 0)), 'Inventory quantity totals'],
            ['Admin tools', 'Locked', 'Create, edit, delete, and restock'],
          ].map(([label, value, hint]) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Vehicle inventory</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Current stock</h2>
            </div>
            <p className="text-sm text-slate-500">Purchase is disabled when quantity reaches zero.</p>
          </div>

          {loading ? <p className="mt-6 text-sm text-slate-500">Loading vehicles…</p> : null}
          {error ? <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p> : null}

          {!loading && !error && vehicles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <p className="text-lg font-semibold text-slate-900">No vehicles yet</p>
              <p className="mt-2 text-sm text-slate-500">Vehicles added through the API will appear here.</p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {vehicles.map((vehicle) => (
              <article key={vehicle.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">{vehicle.category}</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                      {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    Qty {vehicle.quantity}
                  </span>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Price</p>
                    <p className="text-2xl font-black text-slate-900">${vehicle.price.toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    disabled={vehicle.quantity === 0}
                    className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {vehicle.quantity === 0 ? 'Out of stock' : 'Purchase'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
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
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await loginUser(form)
      setStoredToken(response.access_token)
      navigate('/', { replace: true })
    } catch (submissionError) {
      setError(submissionError?.response?.data?.detail || 'Unable to sign in. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue managing your dealership inventory.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await registerUser(form)
      const response = await loginUser(form)
      setStoredToken(response.access_token)
      navigate('/', { replace: true })
    } catch (submissionError) {
      setError(submissionError?.response?.data?.detail || 'Unable to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Register to start using the DriveStock dashboard.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a secure password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate />
    </BrowserRouter>
  )
}

function AuthGate() {
  useAuthRedirect()

  return (
    <ShellLayout>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <DashboardPage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated() ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ShellLayout>
  )
}
