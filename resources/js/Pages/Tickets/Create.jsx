import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import {
    Sparkles,
    Loader2,
    Check,
    ArrowLeft,
    Clock,
    AlertCircle,
    Lightbulb,
    ShieldCheck,
} from 'lucide-react';

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        priority: 'medium',
        description: '',
    });

    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiError, setAiError] = useState(null);

    const handleAiAnalyze = async () => {
        if (!data.title || data.title.length < 3) {
            setAiError('Please enter a ticket title (at least 3 characters) before analyzing.');
            return;
        }
        if (!data.description || data.description.length < 10) {
            setAiError('Please write a brief description (at least 10 characters) so the AI can analyze context.');
            return;
        }

        setAiError(null);
        setIsAiAnalyzing(true);

        try {
            const response = await axios.post(route('tickets.analyze-ai'), {
                title: data.title,
                description: data.description,
            });

            if (response.data?.success && response.data?.analysis) {
                setAiResult(response.data.analysis);
            }
        } catch (err) {
            setAiError(
                err.response?.data?.message || 'Failed to complete AI analysis. Please verify your inputs.'
            );
        } finally {
            setIsAiAnalyzing(false);
        }
    };

    const applyAiSuggestions = () => {
        if (!aiResult) return;

        // Find matching category by name
        if (aiResult.suggested_category) {
            const matched = categories.find(
                (c) => c.name.toLowerCase() === aiResult.suggested_category.toLowerCase()
            );
            if (matched) {
                setData('category_id', matched.id);
            }
        }

        if (aiResult.suggested_priority) {
            setData('priority', aiResult.suggested_priority);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tickets.store'));
    };

    const selectedCategory = categories.find((c) => String(c.id) === String(data.category_id));

    // Dynamic SLA estimate calculation
    const getSlaEstimateHours = () => {
        if (!selectedCategory) return 24;
        const multipliers = {
            critical: 0.5,
            high: 0.75,
            medium: 1.0,
            low: 1.5,
        };
        const m = multipliers[data.priority] || 1.0;
        return selectedCategory.sla_hours * m;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('tickets.index')}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Submit a New Service Ticket
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Describe your issue. Our AI engine will automatically summarize and categorize your request.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Submit Ticket - SmartDesk" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* AI Interactive Assistant Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-5 text-white shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3">
                            <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur shrink-0">
                                <Sparkles className="h-5 w-5 text-amber-300" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold tracking-wide">
                                    SmartDesk AI Auto-Classification & Recommendation
                                </h3>
                                <p className="text-xs text-indigo-200 mt-0.5 max-w-xl">
                                    Fill in your title and description, then click "Analyze with AI" to generate an automatic summary, predicted priority, and preliminary agent troubleshooting steps.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAiAnalyze}
                            disabled={isAiAnalyzing}
                            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-900 shadow-sm hover:bg-indigo-50 transition active:scale-95 disabled:opacity-50 shrink-0"
                        >
                            {isAiAnalyzing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                    <span>Analyzing Content...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 text-indigo-600" />
                                    <span>Analyze with AI</span>
                                </>
                            )}
                        </button>
                    </div>

                    {aiError && (
                        <div className="mt-3 flex items-center space-x-2 rounded-xl bg-rose-500/20 border border-rose-400/30 px-3 py-2 text-xs text-rose-200">
                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-300" />
                            <span>{aiError}</span>
                        </div>
                    )}
                </div>

                {/* AI Insights Card (Visible if AI Result is present) */}
                {aiResult && (
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 p-6 border border-indigo-200/80 shadow-md">
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                            <div className="flex items-center space-x-2">
                                <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
                                <h4 className="text-sm font-bold text-indigo-950">
                                    AI Analysis Insights
                                </h4>
                                <span className="rounded-md bg-indigo-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                                    {aiResult.source === 'gemini_ai' ? 'Gemini 1.5 Flash' : 'Rule-Based Heuristic ML'}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={applyAiSuggestions}
                                className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                            >
                                <Check className="h-3.5 w-3.5" />
                                <span>Apply Suggestions to Form</span>
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                                <span className="font-semibold text-slate-500">Predicted Category:</span>
                                <div className="font-bold text-slate-900 bg-white p-2 rounded-xl border border-slate-200/80">
                                    {aiResult.suggested_category}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="font-semibold text-slate-500">Predicted Urgency / Priority:</span>
                                <div className="font-bold text-indigo-700 bg-white p-2 rounded-xl border border-slate-200/80 uppercase">
                                    {aiResult.suggested_priority}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 text-xs space-y-1">
                            <span className="font-semibold text-slate-500">Automated Summary:</span>
                            <p className="bg-white p-3 rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed">
                                {aiResult.summary}
                            </p>
                        </div>

                        <div className="mt-3 text-xs space-y-1">
                            <span className="font-semibold text-slate-500">Agent Recommended Action:</span>
                            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                                {aiResult.recommended_solution}
                            </div>
                        </div>
                    </div>
                )}

                {/* Ticket Form */}
                <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">
                            Ticket Title <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-xs text-slate-500 mb-1.5">
                            Summarize the core problem or request concisely.
                        </p>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Cannot process credit card payment on checkout page"
                            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
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
                            <p className="text-xs text-slate-500 mb-1.5">
                                Determines baseline SLA turnaround time.
                            </p>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                                    errors.category_id
                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} — Baseline {c.sla_hours}h SLA
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
                            <p className="text-xs text-slate-500 mb-1.5">
                                Adjusts automated SLA deadline multiplier.
                            </p>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                                    errors.priority
                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                            >
                                <option value="low">Low (150% standard time)</option>
                                <option value="medium">Medium (100% standard time)</option>
                                <option value="high">High (75% standard time)</option>
                                <option value="critical">Critical (50% emergency turnaround)</option>
                            </select>
                            {errors.priority && (
                                <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.priority}</p>
                            )}
                        </div>
                    </div>

                    {/* Calculated SLA Preview Notice */}
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-slate-600">
                            <Clock className="h-4 w-4 text-indigo-600" />
                            <span>
                                Estimated SLA Target Resolution Time:
                            </span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                            {getSlaEstimateHours()} hours
                        </span>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">
                            Detailed Description <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-xs text-slate-500 mb-1.5">
                            Please provide step-by-step replication details, error messages, and customer impact.
                        </p>
                        <textarea
                            rows={6}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Provide full details: when the issue began, steps to reproduce, error codes, and user impact..."
                            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                                errors.description
                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                            }`}
                        />
                        {errors.description && (
                            <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                        <Link
                            href={route('tickets.index')}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none transition active:scale-95 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Creating Ticket & Computing SLA...</span>
                                </>
                            ) : (
                                <span>Submit Ticket</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
