export default function ApplicationLogo({
    className = 'h-9 w-auto',
    showText = true,
    isDark = false,
}) {
    return (
        <div className="flex items-center space-x-2.5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/25">
                <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                </span>
            </div>
            {showText && (
                <div className="flex flex-col">
                    <div className="flex items-center space-x-1.5">
                        <span className={`font-extrabold tracking-tight text-lg ${
                            isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                            Smart<span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>Desk</span>
                        </span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isDark
                                ? 'bg-indigo-500/25 text-indigo-300 ring-1 ring-inset ring-indigo-400/40'
                                : 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10'
                        }`}>
                            AI
                        </span>
                    </div>
                    <span className={`text-[10px] font-medium -mt-1 tracking-wide ${
                        isDark ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                        Issue &amp; Workflow System
                    </span>
                </div>
            )}
        </div>
    );
}
