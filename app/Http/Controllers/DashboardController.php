<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ticket;
use App\Services\TicketWorkflowService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected TicketWorkflowService $workflowService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $metrics = $this->workflowService->getDashboardMetrics($user);

        $recentTicketsQuery = Ticket::with(['category', 'user', 'assignee'])
            ->latest('id');

        if (! $user->isAdmin()) {
            $recentTicketsQuery->where('user_id', $user->id);
        }

        $recentTickets = $recentTicketsQuery->take(6)->get()->map(function (Ticket $ticket) {
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

        $categories = Category::withCount('tickets')->get();

        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'recentTickets' => $recentTickets,
            'categories' => $categories,
        ]);
    }
}
