import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Ticket as TicketIcon,
    Clock,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    PlusCircle,
    ArrowUpRight,
    Sparkles,
    ShieldAlert,
    Activity,
    Layers,
    User,
} from 'lucide-react';

export default function Dashboard({ metrics, recentTickets, categories }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const priorityBadge = (priority) => {
        const styles = {
            critical: 'bg-rose-50 text-rose-700 ring-rose-600/20',
            high: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            medium: 'bg-blue-50 text-blue-700 ring-blue-700/10',
            low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        };
        return (
            <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset ${
                    styles[priority] || styles.medium
                }`}
            >
                {priority}
            </span>
        );
    };

    const statusBadge = (status) => {
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
                    styles[status] || styles.open
                }`}
            >
                <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                        status === 'open'
                            ? 'bg-sky-500'
                            : status === 'in_progress'
                            ? 'bg-indigo-500'
                            : status === 'resolved'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                    }`}
                />
                {labels[status] || status}
            </span>
        );
    };

    const formatRelativeTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
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
                            Workflow Intelligence Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Real-time metrics, automated SLA tracking, and AI-assisted issue routing.
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('tickets.create')}
                            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none transition active:scale-[0.98]"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Create Ticket</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard - SmartDesk" />

            <div className="space-y-6">
                {/* Hero Greeting Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
                    <div className="absolute right-0 top-0 -mt-6 -mr-6 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-400/30 mb-2">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>SmartDesk AI Engine v2.0 Active</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold">
                                Welcome back, {user.name}!
                            </h2>
                            <p className="text-sm text-slate-300 mt-1 max-w-xl">
                                You are signed in as an{' '}
                                <span className="font-semibold text-indigo-300 uppercase">
                                    {user.role}
                                </span>
                                . {user.role === 'admin'
                                    ? 'You have complete visibility over all system tickets, categories, and SLA dispatching.'
                                    : 'You can submit issues, track SLA countdowns, and review automated AI resolution recommendations.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('tickets.index')}
                                className="inline-flex items-center space-x-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition"
                            >
                                <span>Explore Tickets</span>
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 5 KPI Metric Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Total Tickets */}
                    <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Total Tickets
                            </p>
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                                <TicketIcon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                            {metrics.totalTickets}
                        </p>
                        <div className="mt-2 flex items-center text-xs text-slate-500">
                            <span className="font-medium text-slate-700">
                                {metrics.openTickets} open
                            </span>
                            <span className="mx-1.5">•</span>
                            <span>{metrics.inProgressTickets} in progress</span>
                        </div>
                    </div>

                    {/* Work in Progress */}
                    <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Active Queue
                            </p>
                            <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                            {metrics.openTickets + metrics.inProgressTickets}
                        </p>
                        <div className="mt-2 flex items-center text-xs text-sky-600 font-medium">
                            <span>Requires Attention</span>
                        </div>
                    </div>

                    {/* Resolution Rate */}
                    <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Resolution Rate
                            </p>
                            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600">
                            {metrics.openVsResolvedPercentage}%
                        </p>
                        <div className="mt-2 flex items-center text-xs text-slate-500">
                            <span className="font-medium text-emerald-700">
                                {metrics.resolvedTickets + metrics.closedTickets}
                            </span>
                            <span className="ml-1">completed of {metrics.totalTickets}</span>
                        </div>
                    </div>

                    {/* Average Resolution Time */}
                    <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Avg Resolution
                            </p>
                            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                                <Clock className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                            {metrics.avgResolutionTimeHours}
                            <span className="text-base font-normal text-slate-500 ml-1">hrs</span>
                        </p>
                        <div className="mt-2 flex items-center text-xs text-slate-500">
                            <span>From creation to resolution</span>
                        </div>
                    </div>

                    {/* SLA Breached Overdue */}
                    <div className={`overflow-hidden rounded-2xl p-5 shadow-xs border transition-all hover:shadow-md ${
                        metrics.slaBreachedCount > 0
                            ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                            : 'bg-white border-slate-200/80 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                                SLA Breached
                            </p>
                            <div className="rounded-xl bg-rose-100 p-2 text-rose-700">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold tracking-tight text-rose-700">
                            {metrics.slaBreachedCount}
                        </p>
                        <div className="mt-2 flex items-center text-xs text-rose-600 font-medium">
                            <span>{metrics.slaBreachedCount === 0 ? 'All tickets within SLA' : 'Requires immediate escalation'}</span>
                        </div>
                    </div>
                </div>

                {/* Status & Priority Distribution Bars */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Priority Breakdown Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80">
                        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-indigo-600" />
                            <span>Tickets by Priority</span>
                        </h3>
                        <div className="space-y-3">
                            {['critical', 'high', 'medium', 'low'].map((p) => {
                                const count = metrics.priorityBreakdown[p] || 0;
                                const pct = metrics.totalTickets > 0 ? (count / metrics.totalTickets) * 100 : 0;
                                const barColors = {
                                    critical: 'bg-rose-500',
                                    high: 'bg-amber-500',
                                    medium: 'bg-blue-500',
                                    low: 'bg-emerald-500',
                                };
                                return (
                                    <div key={p}>
                                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                                            <span className="capitalize">{p}</span>
                                            <span>{count} ({Math.round(pct)}%)</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${barColors[p]}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Workflow Order Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80">
                        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                            <Layers className="h-4 w-4 text-indigo-600" />
                            <span>Workflow Pipeline</span>
                        </h3>
                        <div className="space-y-3">
                            {[
                                { key: 'open', label: '1. Open', color: 'bg-sky-500', count: metrics.statusBreakdown.open },
                                { key: 'in_progress', label: '2. In Progress', color: 'bg-indigo-500', count: metrics.statusBreakdown.in_progress },
                                { key: 'resolved', label: '3. Resolved', color: 'bg-emerald-500', count: metrics.statusBreakdown.resolved },
                                { key: 'closed', label: '4. Closed', color: 'bg-slate-400', count: metrics.statusBreakdown.closed },
                            ].map((step) => {
                                const pct = metrics.totalTickets > 0 ? (step.count / metrics.totalTickets) * 100 : 0;
                                return (
                                    <div key={step.key}>
                                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                                            <span>{step.label}</span>
                                            <span>{step.count}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${step.color}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 border border-slate-100">
                            <span className="font-semibold text-slate-700">Strict Order:</span> Open &rarr; In Progress &rarr; Resolved &rarr; Closed.
                        </div>
                    </div>

                    {/* Categories & SLA Benchmark */}
                    <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-indigo-600" />
                                    <span>Category SLA Targets</span>
                                </h3>
                                {user.role === 'admin' && (
                                    <Link
                                        href={route('categories.index')}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        Manage
                                    </Link>
                                )}
                            </div>
                            <div className="divide-y divide-slate-100">
                                {categories && categories.slice(0, 4).map((cat) => (
                                    <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                                        <span className="font-medium text-slate-800">{cat.name}</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
                                                {cat.sla_hours}h SLA
                                            </span>
                                            <span className="text-slate-400">({cat.tickets_count || 0})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                            Priorities adjust SLA: Critical (-50%), High (-25%), Low (+50%).
                        </div>
                    </div>
                </div>

                {/* Recent Tickets Table */}
                <div className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Recent Support Tickets</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Showing latest tickets and automated SLA status.
                            </p>
                        </div>
                        <Link
                            href={route('tickets.index')}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                            <span>View All Tickets</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-6 py-3.5">Ticket</th>
                                    <th className="px-6 py-3.5">Category</th>
                                    <th className="px-6 py-3.5">Priority</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">SLA Due</th>
                                    <th className="px-6 py-3.5">Assigned To</th>
                                    <th className="px-6 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {recentTickets && recentTickets.length > 0 ? (
                                    recentTickets.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <Link
                                                        href={route('tickets.show', t.id)}
                                                        className="font-semibold text-slate-900 hover:text-indigo-600 line-clamp-1"
                                                    >
                                                        {t.title}
                                                    </Link>
                                                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                                                        <span className="font-mono font-semibold text-indigo-600">
                                                            {t.ticket_number}
                                                        </span>
                                                        <span>•</span>
                                                        <span>by {t.user.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                                                {t.category?.name || 'Unassigned'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {priorityBadge(t.priority)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {statusBadge(t.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {t.is_overdue ? (
                                                    <span className="inline-flex items-center space-x-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        <span>Overdue</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {formatRelativeTime(t.sla_due_at)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                                                {t.assignee ? (
                                                    <span className="inline-flex items-center space-x-1 font-medium text-slate-700">
                                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{t.assignee.name}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap text-xs">
                                                <Link
                                                    href={route('tickets.show', t.id)}
                                                    className="font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    View Details &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                                            No tickets found. Click "Create Ticket" to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
