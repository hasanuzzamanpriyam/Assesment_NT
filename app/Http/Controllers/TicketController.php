<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeTicketStatusRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use App\Services\AiTicketAnalyzerService;
use App\Services\TicketWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function __construct(
        protected TicketWorkflowService $workflowService,
        protected AiTicketAnalyzerService $aiAnalyzerService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Ticket::with(['category', 'user', 'assignee'])
            ->latest('id');

        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        } elseif ($request->boolean('my_assigned')) {
            $query->where('assigned_to', $user->id);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($priority = $request->input('priority')) {
            if ($priority !== 'all') {
                $query->where('priority', $priority);
            }
        }

        if ($categoryId = $request->input('category_id')) {
            if ($categoryId !== 'all') {
                $query->where('category_id', $categoryId);
            }
        }

        $tickets = $query->paginate(10)->withQueryString()->through(function (Ticket $ticket) {
            return [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'category' => $ticket->category ? [
                    'id' => $ticket->category->id,
                    'name' => $ticket->category->name,
                ] : null,
                'user' => [
                    'id' => $ticket->user->id,
                    'name' => $ticket->user->name,
                ],
                'assignee' => $ticket->assignee ? [
                    'id' => $ticket->assignee->id,
                    'name' => $ticket->assignee->name,
                ] : null,
                'sla_due_at' => $ticket->sla_due_at?->toISOString(),
                'is_overdue' => $ticket->isOverdue(),
                'created_at' => $ticket->created_at->toISOString(),
            ];
        });

        $categories = Category::orderBy('name')->get(['id', 'name', 'sla_hours']);

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'priority' => $request->input('priority', 'all'),
                'category_id' => $request->input('category_id', 'all'),
                'my_assigned' => $request->boolean('my_assigned'),
            ],
        ]);
    }

    public function create(): Response
    {
        $categories = Category::orderBy('name')->get(['id', 'name', 'sla_hours', 'description']);

        return Inertia::render('Tickets/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreTicketRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $category = Category::findOrFail($validated['category_id']);

        // 1. Automatic SLA calculation based on category hours & priority multiplier
        $slaDueAt = $this->workflowService->calculateSlaDueAt($category, $validated['priority']);

        // 2. Sequential unique ticket number (e.g. TKT-1001)
        $ticketNumber = $this->workflowService->generateTicketNumber();

        // 3. AI Analysis: summary, category classification, priority prediction, recommended solution
        $aiAnalysis = $this->aiAnalyzerService->analyze($validated['title'], $validated['description']);

        $ticket = Ticket::create([
            'ticket_number' => $ticketNumber,
            'user_id' => $request->user()->id,
            'category_id' => $category->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => 'open',
            'sla_due_at' => $slaDueAt,
            'ai_summary' => $aiAnalysis['summary'],
            'ai_suggested_category' => $aiAnalysis['suggested_category'],
            'ai_suggested_priority' => $aiAnalysis['suggested_priority'],
            'ai_recommended_solution' => $aiAnalysis['recommended_solution'],
        ]);

        return redirect()->route('tickets.show', $ticket)
            ->with('success', "Ticket {$ticket->ticket_number} created successfully with SLA tracking and AI insights.");
    }

    public function show(Ticket $ticket): Response
    {
        Gate::authorize('view', $ticket);

        $ticket->load([
            'category',
            'user',
            'assignee',
            'comments.user',
        ]);

        $allowedTransitions = $this->workflowService->getAllowedTransitions($ticket->status);

        $assignees = [];
        if (request()->user()->isAdmin()) {
            $assignees = User::orderBy('name')->get(['id', 'name', 'email', 'role']);
        }

        return Inertia::render('Tickets/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'ai_summary' => $ticket->ai_summary,
                'ai_suggested_category' => $ticket->ai_suggested_category,
                'ai_suggested_priority' => $ticket->ai_suggested_priority,
                'ai_recommended_solution' => $ticket->ai_recommended_solution,
                'sla_due_at' => $ticket->sla_due_at?->toISOString(),
                'resolved_at' => $ticket->resolved_at?->toISOString(),
                'is_overdue' => $ticket->isOverdue(),
                'resolution_hours' => $ticket->getResolutionTimeInHours(),
                'created_at' => $ticket->created_at->toISOString(),
                'updated_at' => $ticket->updated_at->toISOString(),
                'category' => $ticket->category ? [
                    'id' => $ticket->category->id,
                    'name' => $ticket->category->name,
                    'sla_hours' => $ticket->category->sla_hours,
                ] : null,
                'user' => [
                    'id' => $ticket->user->id,
                    'name' => $ticket->user->name,
                    'email' => $ticket->user->email,
                    'role' => $ticket->user->role,
                ],
                'assignee' => $ticket->assignee ? [
                    'id' => $ticket->assignee->id,
                    'name' => $ticket->assignee->name,
                    'email' => $ticket->assignee->email,
                ] : null,
                'comments' => $ticket->comments->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'comment' => $comment->comment,
                        'created_at' => $comment->created_at->toISOString(),
                        'user' => [
                            'id' => $comment->user->id,
                            'name' => $comment->user->name,
                            'role' => $comment->user->role,
                        ],
                    ];
                }),
            ],
            'allowedTransitions' => $allowedTransitions,
            'assignees' => $assignees,
            'can' => [
                'update' => request()->user()->can('update', $ticket),
                'delete' => request()->user()->can('delete', $ticket),
                'changeStatus' => request()->user()->can('changeStatus', $ticket),
                'assign' => request()->user()->can('assign', $ticket),
            ],
        ]);
    }

    public function edit(Ticket $ticket): Response
    {
        Gate::authorize('update', $ticket);

        $categories = Category::orderBy('name')->get(['id', 'name', 'sla_hours']);
        $assignees = request()->user()->isAdmin()
            ? User::orderBy('name')->get(['id', 'name', 'email'])
            : [];

        return Inertia::render('Tickets/Edit', [
            'ticket' => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'category_id' => $ticket->category_id,
                'priority' => $ticket->priority,
                'assigned_to' => $ticket->assigned_to,
                'status' => $ticket->status,
            ],
            'categories' => $categories,
            'assignees' => $assignees,
        ]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): RedirectResponse
    {
        Gate::authorize('update', $ticket);

        $validated = $request->validated();

        // If priority or category changed and ticket is still open, recalculate SLA
        if ($ticket->status === 'open' && ($ticket->priority !== $validated['priority'] || $ticket->category_id !== (int) $validated['category_id'])) {
            $category = Category::findOrFail($validated['category_id']);
            $ticket->sla_due_at = $this->workflowService->calculateSlaDueAt($category, $validated['priority'], $ticket->created_at);
        }

        $ticket->title = $validated['title'];
        $ticket->description = $validated['description'];
        $ticket->category_id = $validated['category_id'];
        $ticket->priority = $validated['priority'];

        if ($request->user()->isAdmin() && array_key_exists('assigned_to', $validated)) {
            $ticket->assigned_to = $validated['assigned_to'];
        }

        $ticket->save();

        return redirect()->route('tickets.show', $ticket)
            ->with('success', 'Ticket updated successfully.');
    }

    public function destroy(Ticket $ticket): RedirectResponse
    {
        Gate::authorize('delete', $ticket);

        $number = $ticket->ticket_number;
        $ticket->delete();

        return redirect()->route('tickets.index')
            ->with('success', "Ticket {$number} deleted successfully.");
    }

    public function changeStatus(ChangeTicketStatusRequest $request, Ticket $ticket): RedirectResponse
    {
        Gate::authorize('changeStatus', $ticket);

        $newStatus = $request->validated('status');

        try {
            $this->workflowService->transition($ticket, $newStatus, $request->user());
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Ticket status updated to '.ucfirst(str_replace('_', ' ', $newStatus)).'.');
    }

    public function assign(Request $request, Ticket $ticket): RedirectResponse
    {
        Gate::authorize('assign', $ticket);

        $validated = $request->validate([
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $ticket->assigned_to = $validated['assigned_to'];
        $ticket->save();

        $assigneeName = $ticket->assignee ? $ticket->assignee->name : 'Unassigned';

        return back()->with('success', "Ticket assignment updated to: {$assigneeName}.");
    }

    public function analyzeAi(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'min:3'],
            'description' => ['required', 'string', 'min:10'],
        ]);

        $analysis = $this->aiAnalyzerService->analyze($validated['title'], $validated['description']);

        return response()->json([
            'success' => true,
            'analysis' => $analysis,
        ]);
    }
}
