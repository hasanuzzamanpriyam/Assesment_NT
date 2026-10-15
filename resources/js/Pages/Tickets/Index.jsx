import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Filter,
    PlusCircle,
    AlertTriangle,
    Clock,
    User,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

export default function Index({ tickets, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [myAssigned, setMyAssigned] = useState(filters.my_assigned || false);

    const applyFilters = (newFilters = {}) => {
        const query = {
            search,
            status,
            priority,
            category_id: categoryId,
            my_assigned: myAssigned ? 1 : 0,
            ...newFilters,
        };

        // Remove empty or 'all' values
        Object.keys(query).forEach((key) => {
            if (query[key] === 'all' || query[key] === '' || query[key] === false || query[key] === 0) {
                delete query[key];
            }
        });

        router.get(route('tickets.index'), query, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setPriority('all');
        setCategoryId('all');
        setMyAssigned(false);
        router.get(route('tickets.index'));
    };

    const priorityBadge = (p) => {
        const styles = {
            critical: 'bg-rose-50 text-rose-700 ring-rose-600/20',
            high: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            medium: 'bg-blue-50 text-blue-700 ring-blue-700/10',
            low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        };
        return (
            <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset ${
                    styles[p] || styles.medium
                }`}
            >
                {p}
            </span>
        );
    };

    const statusBadge = (s) => {
        const styles = {
            open: 'bg-sky-50 text-sky-700 border-sky-200',
            in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            closed: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        const labels = {
            open: 'Open',
            in_progress: 'In Progress',
            resolved: 'Resolved',
            closed: 'Closed',
        };
        return (
            <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    styles[s] || styles.open
                }`}
            >
                <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                        s === 'open'
                            ? 'bg-sky-500'
                            : s === 'in_progress'
                            ? 'bg-indigo-500'
                            : s === 'resolved'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                    }`}
                />
                {labels[s] || s}
            </span>
        );
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const d = new Date(isoString);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Service & Issue Tickets
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Filter, monitor SLA commitments, and resolve internal or customer issues.
                        </p>
                    </div>
                    <div>
                        <Link
                            href={route('tickets.create')}
                            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition active:scale-[0.98]"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Create Ticket</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Tickets - SmartDesk" />

            <div className="space-y-6">
                {/* Search & Filters Card */}
                <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80">
                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                            {/* Search Input */}
                            <div className="md:col-span-5 relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by ticket number, title, or keywords..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="md:col-span-2">
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        applyFilters({ status: e.target.value });
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            {/* Priority Filter */}
                            <div className="md:col-span-2">
                                <select
                                    value={priority}
                                    onChange={(e) => {
                                        setPriority(e.target.value);
                                        applyFilters({ priority: e.target.value });
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div className="md:col-span-3">
                                <select
                                    value={categoryId}
                                    onChange={(e) => {
                                        setCategoryId(e.target.value);
                                        applyFilters({ category_id: e.target.value });
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name} ({cat.sla_hours}h SLA)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Secondary Filter Action Bar */}
                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-3">
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={myAssigned}
                                        onChange={(e) => {
                                            setMyAssigned(e.target.checked);
                                            applyFilters({ my_assigned: e.target.checked ? 1 : 0 });
                                        }}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Only Assigned to Me</span>
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Reset Filters</span>
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                                >
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Tickets Table Card */}
                <div className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-6 py-3.5">Ticket # & Title</th>
                                    <th className="px-6 py-3.5">Category</th>
                                    <th className="px-6 py-3.5">Priority</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">SLA Target</th>
                                    <th className="px-6 py-3.5">Assignee</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {tickets.data && tickets.data.length > 0 ? (
                                    tickets.data.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="hover:bg-slate-50/70 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-mono text-xs font-bold text-indigo-600">
                                                            {ticket.ticket_number}
                                                        </span>
                                                        <span className="text-xs text-slate-400">•</span>
                                                        <span className="text-xs text-slate-500">
                                                            by {ticket.user.name}
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href={route('tickets.show', ticket.id)}
                                                        className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5 line-clamp-1"
                                                    >
                                                        {ticket.title}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-700">
                                                {ticket.category ? ticket.category.name : 'General'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {priorityBadge(ticket.priority)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {statusBadge(ticket.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {ticket.is_overdue ? (
                                                    <span className="inline-flex items-center space-x-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        <span>SLA Breached</span>
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{formatDate(ticket.sla_due_at)}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                                                {ticket.assignee ? (
                                                    <span className="inline-flex items-center space-x-1.5 font-medium text-slate-700">
                                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{ticket.assignee.name}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap text-xs">
                                                <Link
                                                    href={route('tickets.show', ticket.id)}
                                                    className="inline-flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <span>View</span>
                                                    <span>&rarr;</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                                                    <Filter className="h-6 w-6" />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    No tickets match your filters
                                                </p>
                                                <p className="text-xs text-slate-500 max-w-sm">
                                                    Try resetting your search query or selecting a different status/priority filter.
                                                </p>
                                                <button
                                                    onClick={handleReset}
                                                    className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                                                >
                                                    Clear all filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {tickets.links && tickets.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                            <div className="text-xs text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{tickets.from || 0}</span> to{' '}
                                <span className="font-semibold text-slate-700">{tickets.to || 0}</span> of{' '}
                                <span className="font-semibold text-slate-700">{tickets.total}</span> tickets
                            </div>

                            <div className="flex items-center space-x-1">
                                {tickets.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="rounded-lg px-3 py-1.5 text-xs text-slate-300 font-medium select-none"
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white shadow-xs'
                                                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
