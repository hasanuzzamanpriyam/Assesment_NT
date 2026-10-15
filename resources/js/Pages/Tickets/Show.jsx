import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Clock,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    User,
    Send,
    ArrowLeft,
    Check,
    Shield,
    Trash2,
    Edit3,
    Calendar,
    MessageSquare,
    Loader2,
} from 'lucide-react';

export default function Show({ ticket, allowedTransitions, assignees, can }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        comment: '',
    });

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [selectedAssignee, setSelectedAssignee] = useState(ticket.assignee?.id || '');

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        post(route('tickets.comments.store', ticket.id), {
            onSuccess: () => reset('comment'),
        });
    };

    const handleStatusTransition = (targetStatus) => {
        if (!confirm(`Are you sure you want to transition this ticket to "${targetStatus.replace('_', ' ')}"?`)) {
            return;
        }

        setIsTransitioning(true);
        router.patch(
            route('tickets.status', ticket.id),
            { status: targetStatus },
            {
                onFinish: () => setIsTransitioning(false),
            }
        );
    };

    const handleAssignChange = (e) => {
        const newAssigneeId = e.target.value;
        setSelectedAssignee(newAssigneeId);

        router.patch(route('tickets.assign', ticket.id), {
            assigned_to: newAssigneeId || null,
        });
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to permanently delete ticket ${ticket.ticket_number}? This action cannot be undone.`)) {
            router.delete(route('tickets.destroy', ticket.id));
        }
    };

    const priorityBadge = (priority) => {
        const styles = {
            critical: 'bg-rose-50 text-rose-700 ring-rose-600/20 border-rose-200',
            high: 'bg-amber-50 text-amber-700 ring-amber-600/20 border-amber-200',
            medium: 'bg-blue-50 text-blue-700 ring-blue-700/10 border-blue-200',
            low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-200',
        };
        return (
            <span
                className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                    styles[priority] || styles.medium
                }`}
            >
                {priority} Priority
            </span>
        );
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const d = new Date(isoString);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const workflowSteps = [
        { key: 'open', label: 'Open' },
        { key: 'in_progress', label: 'In Progress' },
        { key: 'resolved', label: 'Resolved' },
        { key: 'closed', label: 'Closed' },
    ];

    const currentStepIndex = workflowSteps.findIndex((s) => s.key === ticket.status);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('tickets.index')}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-3">
                                <span className="font-mono text-sm font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                                    {ticket.ticket_number}
                                </span>
                                {priorityBadge(ticket.priority)}
                                {ticket.is_overdue && (
                                    <span className="inline-flex items-center space-x-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span>SLA Breached</span>
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                                {ticket.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {can.update && (
                            <Link
                                href={route('tickets.edit', ticket.id)}
                                className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                            </Link>
                        )}
                        {can.delete && (
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-xs"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${ticket.ticket_number} - ${ticket.title}`} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Column (8 cols): Workflow Stepper, Description, AI Insights, Comments */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Workflow Pipeline Stepper Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Issue Workflow Order
                            </h3>
                            <span className="text-xs font-semibold text-indigo-600">
                                Stage {currentStepIndex + 1} of 4
                            </span>
                        </div>

                        {/* Stepper Progress Bar */}
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            {workflowSteps.map((step, idx) => {
                                const isPassed = idx < currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                return (
                                    <div key={step.key} className="flex flex-col items-center">
                                        <div
                                            className={`h-2 w-full rounded-full mb-2 ${
                                                isPassed || isCurrent
                                                    ? 'bg-indigo-600'
                                                    : 'bg-slate-200'
                                            }`}
                                        />
                                        <div className="flex items-center space-x-1">
                                            {isPassed && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                                            {isCurrent && (
                                                <span className="h-2 w-2 rounded-full bg-indigo-600 mr-1 animate-ping" />
                                            )}
                                            <span
                                                className={`font-semibold ${
                                                    isCurrent
                                                        ? 'text-indigo-600 font-bold'
                                                        : isPassed
                                                        ? 'text-slate-800'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Transition Buttons */}
                        {can.changeStatus && allowedTransitions && allowedTransitions.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                    Next allowed transition in workflow:
                                </span>
                                <div className="flex items-center space-x-2">
                                    {allowedTransitions.map((nextStatus) => {
                                        const labels = {
                                            in_progress: 'Start Progress (Move to In Progress)',
                                            resolved: 'Mark as Resolved',
                                            closed: 'Close Ticket',
                                        };
                                        const colors = {
                                            in_progress: 'bg-indigo-600 hover:bg-indigo-500 text-white',
                                            resolved: 'bg-emerald-600 hover:bg-emerald-500 text-white',
                                            closed: 'bg-slate-900 hover:bg-slate-800 text-white',
                                        };
                                        return (
                                            <button
                                                key={nextStatus}
                                                type="button"
                                                disabled={isTransitioning}
                                                onClick={() => handleStatusTransition(nextStatus)}
                                                className={`inline-flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 ${
                                                    colors[nextStatus] || 'bg-indigo-600 text-white'
                                                }`}
                                            >
                                                {isTransitioning && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                <span>{labels[nextStatus] || `Move to ${nextStatus}`} &rarr;</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {ticket.status === 'closed' && (
                            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/60 flex items-center space-x-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span>This ticket is closed and archived according to workflow policy.</span>
                            </div>
                        )}
                    </div>

                    {/* AI Insights Panel */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 text-white shadow-md border border-indigo-800/50">
                        <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="h-5 w-5 text-amber-300" />
                                <h3 className="text-sm font-bold tracking-wide">
                                    SmartDesk AI Insights & Auto-Triage
                                </h3>
                            </div>
                            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300 ring-1 ring-inset ring-indigo-400/30">
                                ML Automated Analysis
                            </span>
                        </div>

                        {ticket.ai_summary && (
                            <div className="mt-4">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                                    Issue Executive Summary:
                                </span>
                                <p className="mt-1 text-sm text-slate-200 leading-relaxed font-normal bg-white/5 p-3.5 rounded-xl border border-white/10">
                                    {ticket.ai_summary}
                                </p>
                            </div>
                        )}

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-slate-400">AI Suggested Category:</span>
                                <p className="font-semibold text-white mt-0.5">
                                    {ticket.ai_suggested_category || ticket.category?.name || 'General'}
                                </p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-slate-400">AI Predicted Urgency:</span>
                                <p className="font-semibold text-amber-300 mt-0.5 uppercase">
                                    {ticket.ai_suggested_priority || ticket.priority}
                                </p>
                            </div>
                        </div>

                        {ticket.ai_recommended_solution && (
                            <div className="mt-4">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                                    Recommended Agent Resolution Steps:
                                </span>
                                <div className="mt-1.5 text-xs text-slate-200 bg-black/30 p-4 rounded-xl border border-white/10 whitespace-pre-line leading-relaxed">
                                    {ticket.ai_recommended_solution}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ticket Description Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                            Issue Description
                        </h3>
                        <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-line leading-relaxed">
                            {ticket.description}
                        </div>
                    </div>

                    {/* Comments & Discussion Thread */}
                    <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 space-y-6">
                        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
                            <MessageSquare className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-base font-bold text-slate-900">
                                Activity & Comments ({ticket.comments?.length || 0})
                            </h3>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {ticket.comments && ticket.comments.length > 0 ? (
                                ticket.comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="rounded-xl bg-slate-50 p-4 border border-slate-200/60 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                                                    {comment.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-slate-900">
                                                    {comment.user.name}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                    comment.user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {comment.user.role}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-slate-400">
                                                {formatDate(comment.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed pl-9">
                                            {comment.comment}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4">
                                    No comments yet. Start the conversation below.
                                </p>
                            )}
                        </div>

                        {/* Post Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-100 space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                Add an internal or customer response
                            </label>
                            <textarea
                                rows={3}
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                                placeholder="Type your comment, update, or troubleshooting note..."
                                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                                    errors.comment
                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                            />
                            {errors.comment && (
                                <p className="text-xs font-semibold text-rose-600">{errors.comment}</p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || !data.comment.trim()}
                                    className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Send className="h-3.5 w-3.5" />
                                    )}
                                    <span>Post Comment</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column (4 cols): Meta details, SLA Card, Assignee, Creator */}
                <div className="lg:col-span-4 space-y-6">
                    {/* SLA Monitor Card */}
                    <div className={`rounded-2xl p-6 shadow-xs border ${
                        ticket.is_overdue
                            ? 'bg-rose-50/70 border-rose-200'
                            : 'bg-white border-slate-200/80'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                                <Clock className="h-4 w-4 text-indigo-600" />
                                <span>SLA Commitment</span>
                            </h3>
                            {ticket.is_overdue ? (
                                <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                    Breached
                                </span>
                            ) : (
                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                                    On Track
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <span className="text-slate-400">Target Due Timestamp:</span>
                                <p className="font-bold text-slate-900 mt-0.5">
                                    {formatDate(ticket.sla_due_at)}
                                </p>
                            </div>

                            {ticket.resolved_at && (
                                <div>
                                    <span className="text-slate-400">Resolved Timestamp:</span>
                                    <p className="font-bold text-emerald-600 mt-0.5">
                                        {formatDate(ticket.resolved_at)}
                                    </p>
                                    {ticket.resolution_hours && (
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Turnaround: {ticket.resolution_hours} hours
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-200/60">
                                <div className="flex justify-between text-slate-600 mb-1">
                                    <span>Category Baseline:</span>
                                    <span className="font-semibold">{ticket.category?.sla_hours || 24} hours</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Priority Multiplier:</span>
                                    <span className="font-semibold uppercase">{ticket.priority}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assignment & Management Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Ticket Details
                        </h3>

                        {/* Assignee */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Assigned Agent
                            </label>
                            {can.assign ? (
                                <select
                                    value={selectedAssignee}
                                    onChange={handleAssignChange}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">Unassigned</option>
                                    {assignees.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} ({a.role})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex items-center space-x-2 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span>{ticket.assignee ? ticket.assignee.name : 'Unassigned'}</span>
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <span className="text-xs font-semibold text-slate-700">Category</span>
                            <div className="text-xs font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mt-1">
                                {ticket.category?.name || 'Unassigned'}
                            </div>
                        </div>

                        {/* Creator Info */}
                        <div>
                            <span className="text-xs font-semibold text-slate-700">Requester</span>
                            <div className="flex items-center space-x-2.5 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mt-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                                    {ticket.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900">{ticket.user.name}</span>
                                    <span className="text-[11px] text-slate-500">{ticket.user.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                            <div className="flex justify-between">
                                <span>Created:</span>
                                <span>{formatDate(ticket.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last Updated:</span>
                                <span>{formatDate(ticket.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
