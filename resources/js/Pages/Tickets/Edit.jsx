import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export default function Edit({ ticket, categories, assignees }) {
    const { data, setData, put, processing, errors } = useForm({
        title: ticket.title || '',
        category_id: ticket.category_id || '',
        priority: ticket.priority || 'medium',
        description: ticket.description || '',
        assigned_to: ticket.assigned_to || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('tickets.update', ticket.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <Link
                        href={route('tickets.show', ticket.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Edit Ticket {ticket.ticket_number}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Update ticket metadata, severity, or description details.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${ticket.ticket_number} - SmartDesk`} />

            <div className="max-w-4xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl bg-white p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6"
                >
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">
                            Ticket Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 mt-1.5 ${
                                errors.title
                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                            }`}
                        />
                        {errors.title && (
                            <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.title}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-800">
                                Category <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 mt-1.5 ${
                                    errors.category_id
                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.sla_hours}h SLA)
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.category_id}</p>
                            )}
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-800">
                                Priority Level <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 mt-1.5 ${
                                    errors.priority
                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                            >
                                <option value="low">Low (150% time)</option>
                                <option value="medium">Medium (100% time)</option>
                                <option value="high">High (75% time)</option>
                                <option value="critical">Critical (50% emergency turnaround)</option>
                            </select>
                            {errors.priority && (
                                <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.priority}</p>
                            )}
                        </div>
                    </div>

                    {/* Assignee (If Admin) */}
                    {assignees && assignees.length > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-800">
                                Assigned Agent
                            </label>
                            <select
                                value={data.assigned_to || ''}
                                onChange={(e) => setData('assigned_to', e.target.value || null)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mt-1.5"
                            >
                                <option value="">Unassigned</option>
                                {assignees.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} ({a.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">
                            Description <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={6}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 mt-1.5 ${
                                errors.description
                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                            }`}
                        />
                        {errors.description && (
                            <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                        <Link
                            href={route('tickets.show', ticket.id)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
