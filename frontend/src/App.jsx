import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { loginUser, registerUser } from './api/auth'
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  purchaseVehicle,
  restockVehicle,
  searchVehicles,
  updateVehicle,
} from './api/vehicles'
import {
  clearStoredToken,
  getStoredToken,
  getStoredTokenPayload,
  getUserRole,
  isAuthenticated,
  setStoredToken,
} from './lib/auth'

function ShellLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const [menuOpen, setMenuOpen] = useState(false)

  const payload = getStoredTokenPayload()
  const userEmail = payload?.sub || ''

  const handleLogout = () => {
    clearStoredToken()
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }) =>
    [
      'rounded-full px-4 py-2 text-sm font-medium transition',
      isActive ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ')

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] text-slate-900">
      {!isAuthPage && (
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex flex-col gap-4 py-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex w-full items-center justify-between md:w-auto">
              <NavLink to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-black text-white shadow-glow">
                  D
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">DriveStock</p>
                  <p className="text-xs text-slate-500">Inventory control for dealerships</p>
                </div>
              </NavLink>

              {/* Mobile menu trigger */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink to="/" className={navLinkClass}>
                Inventory
              </NavLink>
              {isAuthenticated() ? (
                <>
                  <div className="relative group flex items-center ml-2">
                    <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition">
                      <svg className="h-5.5 w-5.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                    
                    {/* User info popover on hover */}
                    <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-slate-250 bg-white p-4 shadow-xl ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                      <div className="text-left">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 truncate" title={userEmail}>
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ml-2 rounded-full bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition shadow-sm"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className={navLinkClass}>
                    Register
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* Mobile Drawer Sidebar */}
      {menuOpen && !isAuthPage && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Drawer content panel */}
          <div className="relative flex w-full max-w-xs flex-col bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out z-10 animate-slide-in">
            {/* Header / Close button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Navigation</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3">
              <NavLink 
                to="/" 
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    'flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold transition',
                    isActive ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')
                }
              >
                Inventory
              </NavLink>
              
              {isAuthenticated() ? (
                <>
                  {/* Divider */}
                  <hr className="my-2 border-slate-100" />
                  
                  {/* User Profile details */}
                  <div className="rounded-2xl bg-slate-50 p-4 mb-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 truncate" title={userEmail}>
                      {userEmail}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-850 px-4 py-3 text-sm font-semibold text-white transition shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink 
                    to="/login" 
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold transition',
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      ].join(' ')
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink 
                    to="/register" 
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold transition',
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      ].join(' ')
                    }
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
  const [isAdmin, setIsAdmin] = useState(getUserRole() === 'admin')

  // Search state
  const [searchParams, setSearchParams] = useState({
    make: '',
    model: '',
    category: '',
    min_price: '',
    max_price: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [modalForm, setModalForm] = useState({
    make: '',
    model: '',
    category: '',
    price: '',
    quantity: '',
  })

  const [actionLoading, setActionLoading] = useState({})
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  useEffect(() => {
    const currentToken = getStoredToken()
    setToken(currentToken)
    setIsAdmin(getUserRole() === 'admin')
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



  // Search logic
  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    setError('')

    const minPrice = searchParams.min_price ? parseInt(searchParams.min_price) : null
    const maxPrice = searchParams.max_price ? parseInt(searchParams.max_price) : null

    if (minPrice !== null && minPrice < 0) {
      setError('Minimum price cannot be negative.')
      return
    }
    if (maxPrice !== null && maxPrice < 0) {
      setError('Maximum price cannot be negative.')
      return
    }
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      setError('Minimum price cannot be greater than Maximum price.')
      return
    }

    setLoading(true)
    try {
      const params = {}
      if (searchParams.make.trim()) params.make = searchParams.make.trim()
      if (searchParams.model.trim()) params.model = searchParams.model.trim()
      if (searchParams.category.trim()) params.category = searchParams.category.trim()
      if (minPrice !== null) params.min_price = minPrice
      if (maxPrice !== null) params.max_price = maxPrice

      const data = await searchVehicles(params)
      setVehicles(data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to filter vehicles.')
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = async () => {
    setSearchParams({
      make: '',
      model: '',
      category: '',
      min_price: '',
      max_price: '',
    })
    setLoading(true)
    setError('')
    try {
      const data = await fetchVehicles()
      setVehicles(data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load vehicles.')
    } finally {
      setLoading(false)
    }
  }

  // Purchase logic
  const handlePurchase = async (vehicleId, vehicleName) => {
    setActionLoading((prev) => ({ ...prev, [`purchase-${vehicleId}`]: true }))
    setError('')
    setTimeout(async () => {
      try {
        const updated = await purchaseVehicle(vehicleId)
        setVehicles((current) =>
          current.map((v) => (v.id === vehicleId ? updated : v))
        )
        showToast(`Successfully purchased ${vehicleName}!`, 'success')
      } catch (err) {
        const errMsg = err?.response?.data?.detail || 'Purchase failed.'
        setError(errMsg)
        showToast(errMsg, 'error')
      } finally {
        setActionLoading((prev) => ({ ...prev, [`purchase-${vehicleId}`]: false }))
      }
    }, 1000)
  }

  // Restock logic (Admin only)
  const handleRestock = async (vehicleId, vehicleName) => {
    setActionLoading((prev) => ({ ...prev, [`restock-${vehicleId}`]: true }))
    setError('')
    setTimeout(async () => {
      try {
        const updated = await restockVehicle(vehicleId)
        setVehicles((current) =>
          current.map((v) => (v.id === vehicleId ? updated : v))
        )
        showToast(`Successfully restocked ${vehicleName} (+1)!`, 'success')
      } catch (err) {
        const errMsg = err?.response?.data?.detail || 'Restock failed.'
        setError(errMsg)
        showToast(errMsg, 'error')
      } finally {
        setActionLoading((prev) => ({ ...prev, [`restock-${vehicleId}`]: false }))
      }
    }, 1000)
  }

  // Delete logic (Admin only)
  const handleDelete = async (vehicleId, vehicleName) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return
    setActionLoading((prev) => ({ ...prev, [`delete-${vehicleId}`]: true }))
    setError('')
    setTimeout(async () => {
      try {
        await deleteVehicle(vehicleId)
        setVehicles((current) => current.filter((v) => v.id !== vehicleId))
        showToast(`Successfully deleted ${vehicleName}!`, 'success')
      } catch (err) {
        const errMsg = err?.response?.data?.detail || 'Delete failed.'
        setError(errMsg)
        showToast(errMsg, 'error')
      } finally {
        setActionLoading((prev) => ({ ...prev, [`delete-${vehicleId}`]: false }))
      }
    }, 1000)
  }

  // Modal Form helpers
  const openAddModal = () => {
    setEditingVehicle(null)
    setModalForm({
      make: '',
      model: '',
      category: '',
      price: '',
      quantity: '',
    })
    setModalOpen(true)
  }

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle)
    setModalForm({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: String(vehicle.price),
      quantity: String(vehicle.quantity),
    })
    setModalOpen(true)
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!modalForm.make.trim() || !modalForm.model.trim() || !modalForm.category.trim()) {
      setError('Please fill out all required fields.')
      return
    }

    const payload = {
      make: modalForm.make.trim(),
      model: modalForm.model.trim(),
      category: modalForm.category.trim(),
      price: parseInt(modalForm.price) || 0,
      quantity: parseInt(modalForm.quantity) || 0,
    }

    const actionKey = editingVehicle ? 'edit-modal' : 'add-modal'
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    setTimeout(async () => {
      try {
        if (editingVehicle) {
          const updated = await updateVehicle(editingVehicle.id, payload)
          setVehicles((current) =>
            current.map((v) => (v.id === editingVehicle.id ? updated : v))
          )
          showToast(`Successfully updated ${payload.make} ${payload.model}!`, 'success')
        } else {
          const created = await createVehicle(payload)
          setVehicles((current) => [...current, created])
          showToast(`Successfully added ${payload.make} ${payload.model}!`, 'success')
        }
        setModalOpen(false)
      } catch (err) {
        const errMsg = err?.response?.data?.detail || 'Failed to save vehicle details.'
        setError(errMsg)
        showToast(errMsg, 'error')
      } finally {
        setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
      }
    }, 1000)
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">
            {isAdmin ? 'Admin Control Center' : 'Dealership Showroom'}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
            {isAdmin ? 'Manage dealership stock & listings.' : 'Browse inventory & process purchases.'}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            {isAdmin
              ? 'Complete control over catalog: add new vehicles, edit specifications, delete listings, and restock.'
              : 'Browse active vehicle models, view live stock updates, and complete client purchases.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-full bg-brand-50/80 px-4 py-2 text-xs font-semibold text-brand-900 ring-1 ring-brand-100 shadow-sm backdrop-blur-sm self-start md:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
          </span>
          {isAdmin ? 'Admin Console Active' : 'Dealership Agent Active'}
        </div>
      </div>

      {/* Stats cards section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Vehicles */}
        <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group backdrop-blur">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-brand-50/70 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Models</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{vehicles.length}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-relaxed">Unique vehicle listings currently in the system catalog.</p>
        </article>

        {/* Card 2: In Stock */}
        <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group backdrop-blur">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-emerald-50/70 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inventory</p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {vehicles.reduce((total, vehicle) => total + vehicle.quantity, 0)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-relaxed">Aggregate number of vehicles currently physically in stock.</p>
        </article>

        {/* Card 3: Role Privileges */}
        <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group backdrop-blur">
          <div className={`absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full ${isAdmin ? 'bg-amber-50/70' : 'bg-slate-100/70'} group-hover:scale-110 transition-transform duration-300`}></div>
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'} shadow-sm`}>
              {isAdmin ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin Tools</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{isAdmin ? 'Unlocked' : 'Locked'}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-relaxed">
            {isAdmin ? 'Full management active. You can add, edit, delete and restock listings.' : 'View-only access active. Purchases enabled, write privileges locked.'}
          </p>
        </article>
      </div>

      {/* Main Inventory Card */}
      <section className="rounded-[2.5rem] border border-white/80 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Vehicle Inventory</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Current Stock</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={openAddModal}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-slate-800"
              >
                + Add Vehicle
              </button>
            )}
          </div>
        </div>

        {/* Search Panel */}
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by make..."
                value={searchParams.make}
                onChange={(e) => setSearchParams({ ...searchParams, make: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
              <span className="absolute left-3.5 top-3.5 text-slate-400">🔍</span>
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            {(searchParams.make || searchParams.model || searchParams.category || searchParams.min_price || searchParams.max_price) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-2xl border border-slate-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Model</span>
                <input
                  type="text"
                  placeholder="e.g. Civic"
                  value={searchParams.model}
                  onChange={(e) => setSearchParams({ ...searchParams, model: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Category</span>
                <input
                  type="text"
                  placeholder="e.g. Sedan"
                  value={searchParams.category}
                  onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Min Price (₹)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={searchParams.min_price}
                  onChange={(e) => setSearchParams({ ...searchParams, min_price: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Max Price (₹)</span>
                <input
                  type="number"
                  placeholder="10000000"
                  value={searchParams.max_price}
                  onChange={(e) => setSearchParams({ ...searchParams, max_price: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>
          )}
        </form>

        {loading ? <p className="mt-6 text-sm text-slate-500">Loading vehicles…</p> : null}
        {error ? <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p> : null}

        {!loading && !error && vehicles.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-slate-900">No vehicles found</p>
            <p className="mt-2 text-sm text-slate-500">Try adjusting your search filters.</p>
          </div>
        ) : null}

        <div className={isAdmin ? "mt-6 flex flex-col gap-4" : "mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
          {vehicles.map((vehicle) => {
            const isLowStock = vehicle.quantity > 0 && vehicle.quantity < 3
            const isOutOfStock = vehicle.quantity === 0

            if (isAdmin) {
              return (
                <article
                  key={vehicle.id}
                  className="flex flex-col md:flex-row md:items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 hover:shadow-md transition duration-300 gap-4"
                >
                  <div className="flex flex-1 items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div className="truncate">
                      <h3 className="text-base font-extrabold text-slate-800 truncate">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <span className="inline-flex mt-1 items-center rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                        {vehicle.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-row items-center justify-between md:justify-around gap-4 min-w-0">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</p>
                      <p className="text-base font-black text-slate-900 mt-0.5">₹{vehicle.price.toLocaleString('en-IN')}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Status</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          isOutOfStock ? 'bg-rose-500 animate-pulse' : isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                        }`} />
                        <span className="text-xs font-semibold text-slate-600">
                          {isOutOfStock ? 'Out of stock' : isLowStock ? `Low stock (${vehicle.quantity})` : `${vehicle.quantity} available`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-end self-end md:self-auto shrink-0">
                    <button
                      type="button"
                      disabled={actionLoading[`restock-${vehicle.id}`]}
                      onClick={() => handleRestock(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                      className="rounded-xl bg-slate-950 hover:bg-slate-800 text-white shadow-sm px-4 py-2 text-xs font-semibold transition duration-205 inline-flex items-center justify-center min-w-[90px] disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {actionLoading[`restock-${vehicle.id}`] ? (
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        'Restock (+1)'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(vehicle)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading[`delete-${vehicle.id}`]}
                      onClick={() => handleDelete(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                      className="rounded-xl border border-rose-105 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-75 disabled:cursor-not-allowed inline-flex items-center justify-center min-w-[60px]"
                    >
                      {actionLoading[`delete-${vehicle.id}`] ? (
                        <svg className="animate-spin h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </article>
              )
            }

            return (
              <article
                key={vehicle.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 tracking-wider uppercase">
                        {vehicle.category}
                      </span>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-800 leading-tight">
                        {vehicle.make} {vehicle.model}
                      </h3>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          isOutOfStock ? 'bg-rose-500 animate-pulse' : isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                        }`} />
                        <span className="text-xs font-semibold text-slate-600">
                          {isOutOfStock ? 'Out of stock' : isLowStock ? `Low stock (${vehicle.quantity})` : `${vehicle.quantity} available`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4 border-t border-slate-50 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</p>
                    <p className="text-2xl font-black text-slate-900">₹{vehicle.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {isAdmin ? (
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          type="button"
                          disabled={actionLoading[`restock-${vehicle.id}`]}
                          onClick={() => handleRestock(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                          className="rounded-2xl bg-slate-950 hover:bg-slate-800 text-white shadow-glow px-5 py-2.5 text-sm font-semibold transition duration-200 inline-flex items-center justify-center min-w-[110px] disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                          {actionLoading[`restock-${vehicle.id}`] ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            'Restock (+1)'
                          )}
                        </button>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(vehicle)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading[`delete-${vehicle.id}`]}
                            onClick={() => handleDelete(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                            className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-75 disabled:cursor-not-allowed inline-flex items-center justify-center min-w-[60px]"
                          >
                            {actionLoading[`delete-${vehicle.id}`] ? (
                              <svg className="animate-spin h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isOutOfStock || actionLoading[`purchase-${vehicle.id}`]}
                        onClick={() => handlePurchase(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                        className="rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-glow hover:shadow-brand px-6 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none inline-flex items-center justify-center min-w-[100px]"
                      >
                        {actionLoading[`purchase-${vehicle.id}`] ? (
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          isOutOfStock ? 'Sold Out' : 'Purchase'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Admin Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/85 bg-white/95 p-8 shadow-2xl backdrop-blur transition-all">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition text-lg"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-6">
              {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}
            </h3>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Make</span>
                  <input
                    type="text"
                    required
                    value={modalForm.make}
                    onChange={(e) => setModalForm({ ...modalForm, make: e.target.value })}
                    placeholder="e.g. Toyota"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Model</span>
                  <input
                    type="text"
                    required
                    value={modalForm.model}
                    onChange={(e) => setModalForm({ ...modalForm, model: e.target.value })}
                    placeholder="e.g. Camry"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
                <input
                  type="text"
                  required
                  value={modalForm.category}
                  onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                  placeholder="e.g. Sedan, SUV, Truck"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={modalForm.price}
                    onChange={(e) => setModalForm({ ...modalForm, price: e.target.value })}
                    placeholder="25000"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Quantity</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={modalForm.quantity}
                    onChange={(e) => setModalForm({ ...modalForm, quantity: e.target.value })}
                    placeholder="5"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </label>
              </div>
              {error && (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                  {error}
                </p>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading['edit-modal'] || actionLoading['add-modal']}
                  className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700 inline-flex items-center justify-center min-w-[120px] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {actionLoading['edit-modal'] || actionLoading['add-modal'] ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    editingVehicle ? 'Save Changes' : 'Add Vehicle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg animate-fade-in ${
              toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            {toast.type === 'error' ? (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="flex min-h-[calc(100vh-220px)] w-full items-center justify-center py-6 animate-fade-in">
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
        <div className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <NavLink to="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition">
            Register here
          </NavLink>
        </div>
      </AuthCard>
    </div>
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = { email: form.email, password: form.password }
      await registerUser(payload)
      const response = await loginUser(payload)
      setStoredToken(response.access_token)
      navigate('/', { replace: true })
    } catch (submissionError) {
      setError(submissionError?.response?.data?.detail || 'Unable to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-220px)] w-full items-center justify-center py-6 animate-fade-in">
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</span>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <NavLink to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition">
            Login here
          </NavLink>
        </div>
      </AuthCard>
    </div>
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
