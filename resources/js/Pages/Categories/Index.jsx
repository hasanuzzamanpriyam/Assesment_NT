import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FolderKanban,
    PlusCircle,
    Clock,
    Ticket,
    Edit2,
    Trash2,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

export default function Index({ categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        sla_hours: 24,
        description: '',
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (cat) => {
        setEditingCategory(cat);
        setData({
            name: cat.name,
            sla_hours: cat.sla_hours,
            description: cat.description || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (cat) => {
        if (cat.tickets_count > 0) {
            alert(`Cannot delete '${cat.name}' because it contains ${cat.tickets_count} tickets. Please reassign or delete the associated tickets first.`);
            return;
        }

        if (confirm(`Are you sure you want to delete the category '${cat.name}'?`)) {
            router.delete(route('categories.destroy', cat.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Service Categories & SLA Rules
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Define baseline SLA resolution targets and classify issue workflows.
                        </p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition active:scale-95"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Category</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Categories - SmartDesk" />

            <div className="space-y-6">
                {/* Categories Table Card */}
                <div className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-6 py-3.5">Category Name</th>
                                    <th className="px-6 py-3.5">Baseline SLA</th>
                                    <th className="px-6 py-3.5">Description</th>
                                    <th className="px-6 py-3.5">Active Tickets</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {categories && categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                                                        <FolderKanban className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-bold text-slate-900">
                                                        {cat.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center space-x-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                                    <Clock className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span>{cat.sla_hours} Hours Target</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600 max-w-md">
                                                {cat.description || (
                                                    <span className="text-slate-400 italic">No description provided</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                                                <span className="inline-flex items-center space-x-1 text-slate-600">
                                                    <Ticket className="h-3.5 w-3.5 text-slate-400" />
                                                    <span>{cat.tickets_count || 0} tickets</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap text-xs space-x-2">
                                                <button
                                                    onClick={() => openEditModal(cat)}
                                                    className="inline-flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat)}
                                                    className="inline-flex items-center space-x-1 font-semibold text-rose-600 hover:text-rose-900 ml-3"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span>Delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            No categories found. Click "Add Category" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editingCategory ? 'Edit Service Category' : 'Create New Service Category'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Category Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Database & Storage"
                                        className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-900 mt-1 focus:outline-none focus:ring-2 ${
                                            errors.name
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                        }`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs font-semibold text-rose-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* SLA Hours */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Baseline SLA Target (Hours) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="720"
                                        value={data.sla_hours}
                                        onChange={(e) => setData('sla_hours', e.target.value)}
                                        className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-900 mt-1 focus:outline-none focus:ring-2 ${
                                            errors.sla_hours
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                        }`}
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Standard resolution target in hours before priority multipliers are applied.
                                    </p>
                                    {errors.sla_hours && (
                                        <p className="mt-1 text-xs font-semibold text-rose-600">{errors.sla_hours}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Briefly describe what issues belong in this category..."
                                        className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-900 mt-1 focus:outline-none focus:ring-2 ${
                                            errors.description
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                        }`}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-xs font-semibold text-rose-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
                                    >
                                        {processing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                        <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
