import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Ticket as TicketIcon,
    FolderKanban,
    PlusCircle,
    UserCircle,
    LogOut,
    CheckCircle2,
    AlertCircle,
    X,
    ChevronDown,
    ShieldAlert,
    Menu,
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [flashNotification, setFlashNotification] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setFlashNotification({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setFlashNotification({ type: 'error', message: flash.error });
        } else if (flash?.info) {
            setFlashNotification({ type: 'info', message: flash.info });
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center space-x-8">
                            <Link href={route('dashboard')} className="flex shrink-0 items-center">
                                <ApplicationLogo />
                            </Link>

                            <div className="hidden space-x-1 sm:flex sm:items-center">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </NavLink>

                                <NavLink
                                    href={route('tickets.index')}
                                    active={route().current('tickets.*')}
                                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                                >
                                    <TicketIcon className="h-4 w-4" />
                                    <span>Tickets</span>
                                </NavLink>

                                {user.role === 'admin' && (
                                    <NavLink
                                        href={route('categories.index')}
                                        active={route().current('categories.*')}
                                        className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        <FolderKanban className="h-4 w-4" />
                                        <span>Categories</span>
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* Right side nav items */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-4">
                            <Link
                                href={route('tickets.create')}
                                className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/20 transition-all active:scale-[0.98]"
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>Create Ticket</span>
                            </Link>

                            {/* User Menu Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-none transition-colors"
                                        >
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs font-semibold leading-tight text-slate-800">
                                                    {user.name}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-white rounded-xl shadow-lg border border-slate-100">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                                            <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                                            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                Role: {user.role.toUpperCase()}
                                            </span>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')} className="flex items-center space-x-2 text-sm text-slate-700 hover:bg-slate-50">
                                            <UserCircle className="h-4 w-4 text-slate-400" />
                                            <span>Profile Settings</span>
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center space-x-2 text-sm text-rose-600 hover:bg-rose-50"
                                        >
                                            <LogOut className="h-4 w-4 text-rose-500" />
                                            <span>Sign Out</span>
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Hamburger */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-b border-slate-200 bg-white'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('tickets.index')} active={route().current('tickets.*')}>
                            Tickets
                        </ResponsiveNavLink>
                        {user.role === 'admin' && (
                            <ResponsiveNavLink href={route('categories.index')} active={route().current('categories.*')}>
                                Categories
                            </ResponsiveNavLink>
                        )}
                        <ResponsiveNavLink href={route('tickets.create')} active={route().current('tickets.create')}>
                            + Create Ticket
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-slate-200 pb-3 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-slate-800">{user.name}</div>
                            <div className="text-sm font-medium text-slate-500">{user.email}</div>
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                                Role: {user.role}
                            </span>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Global Flash Alerts */}
            {flashNotification && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
                    <div
                        className={`flex items-center justify-between rounded-xl p-4 shadow-sm border ${
                            flashNotification.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : flashNotification.type === 'error'
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-sky-50 border-sky-200 text-sky-800'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            {flashNotification.type === 'success' ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                            ) : flashNotification.type === 'error' ? (
                                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-sky-600 shrink-0" />
                            )}
                            <p className="text-sm font-medium">{flashNotification.message}</p>
                        </div>
                        <button
                            onClick={() => setFlashNotification(null)}
                            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Optional Page Header */}
            {header && (
                <header className="border-b border-slate-200/60 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Page Body */}
            <main className="pb-16 pt-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
