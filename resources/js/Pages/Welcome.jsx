import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';
import {
    Sparkles,
    Shield,
    Clock,
    Layers,
    ArrowRight,
    CheckCircle2,
    Lock,
    Cpu,
    UserCheck,
    TrendingUp,
} from 'lucide-react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
            <Head title="SmartDesk - AI-Powered Service & Issue Workflow System" />

            {/* Glowing background orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

            {/* Header Navigation */}
            <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <ApplicationLogo showText={true} />

                    <div className="flex items-center space-x-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition active:scale-95"
                            >
                                <span>Go to Dashboard</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 transition active:scale-95"
                                >
                                    <span>Get Started</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
                <div className="mx-auto max-w-5xl text-center space-y-6">
                    <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20 backdrop-blur">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        <span>AI-Driven Service Desk & SLA Pipeline Engine</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                        Intelligent Issue Workflow with{' '}
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Automated SLA & AI Triage
                        </span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
                        SmartDesk transforms chaotic ticket management into a predictable, automated workflow.
                        Leverage automated SLA calculations, strict lifecycle transitions, and intelligent AI summarization with resilient local heuristic fallback.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95"
                            >
                                <span>Access Live System</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95"
                            >
                                <span>Sign In to Demo System</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                        <a
                            href="#features"
                            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                        >
                            <span>Explore Architecture</span>
                        </a>
                    </div>

                    {/* Demo Accounts Quick-Access Card */}
                    <div className="pt-8 max-w-xl mx-auto">
                        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-5 text-left backdrop-blur shadow-2xl">
                            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3 mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                                    <Lock className="h-3.5 w-3.5" />
                                    <span>Pre-Seeded Demo Credentials</span>
                                </span>
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                                    Ready to Test
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800">
                                    <div className="flex items-center justify-between text-indigo-300 font-bold mb-1">
                                        <span>Administrator</span>
                                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                                            Full Control
                                        </span>
                                    </div>
                                    <p className="text-slate-400">Email: <span className="text-slate-200 font-mono">admin@demo.com</span></p>
                                    <p className="text-slate-400">Password: <span className="text-slate-200 font-mono">password</span></p>
                                </div>

                                <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800">
                                    <div className="flex items-center justify-between text-sky-300 font-bold mb-1">
                                        <span>Regular User</span>
                                        <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">
                                            Submit & Track
                                        </span>
                                    </div>
                                    <p className="text-slate-400">Email: <span className="text-slate-200 font-mono">user@demo.com</span></p>
                                    <p className="text-slate-400">Password: <span className="text-slate-200 font-mono">password</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Architecture Grid */}
            <section id="features" className="relative z-10 border-t border-slate-800/80 bg-slate-900/50 py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                            Core Architecture
                        </h2>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                            Engineered for Rigorous Production Standards
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {/* Feature 1: Automated SLA */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3 transition hover:border-indigo-500/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                                <Clock className="h-5 w-5" />
                            </div>
                            <h4 className="text-base font-bold text-white">Dynamic SLA Engine</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Calculates exact resolution deadlines based on Category baseline hours and Priority multipliers: Critical (-50%), High (-25%), Low (+50%).
                            </p>
                        </div>

                        {/* Feature 2: Strict Workflow */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3 transition hover:border-indigo-500/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                <Layers className="h-5 w-5" />
                            </div>
                            <h4 className="text-base font-bold text-white">Sequential Lifecycle</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Enforces strict state progression: Open &rarr; In Progress &rarr; Resolved &rarr; Closed. Prevents premature closure or invalid rollback of archived tickets.
                            </p>
                        </div>

                        {/* Feature 3: AI & Heuristic Fallback */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3 transition hover:border-indigo-500/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                                <Cpu className="h-5 w-5" />
                            </div>
                            <h4 className="text-base font-bold text-white">AI Triage + Offline Fallback</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Integrates Gemini 1.5 Flash with a keyword-based rule classifier fallback. Generates executive summaries, category predictions, and agent action steps.
                            </p>
                        </div>

                        {/* Feature 4: Role Authorization */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3 transition hover:border-indigo-500/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h4 className="text-base font-bold text-white">Security & Audit Policies</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Laravel Policies & Middleware enforce role-based access. Users inspect only their submissions; Administrators manage assignments and category SLA limits.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
                <p>
                    SmartDesk • AI-Powered Service & Issue Workflow System • Laravel {laravelVersion} (PHP v{phpVersion})
                </p>
            </footer>
        </div>
    );
}
