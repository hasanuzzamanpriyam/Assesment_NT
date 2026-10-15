<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

class TicketWorkflowService
{
    /**
     * Priority multipliers for SLA calculations.
     * critical = 50% time, high = 75% time, medium = 100% time, low = 150% time.
     */
    public const PRIORITY_MULTIPLIERS = [
        'critical' => 0.50,
        'high' => 0.75,
        'medium' => 1.00,
        'low' => 1.50,
    ];

    /**
     * Allowed logical sequential transitions.
     * open -> in_progress -> resolved -> closed.
     */
    public const STATUS_TRANSITIONS = [
        'open' => ['in_progress'],
        'in_progress' => ['resolved'],
        'resolved' => ['closed'],
        'closed' => [],
    ];

    /**
     * Calculate automatic SLA due timestamp based on Category SLA hours and Priority multiplier.
     */
    public function calculateSlaDueAt(Category|int $category, string $priority, ?CarbonInterface $from = null): Carbon
    {
        if (is_int($category)) {
            $category = Category::findOrFail($category);
        }

        $baseHours = $category->sla_hours;
        $multiplier = self::PRIORITY_MULTIPLIERS[strtolower($priority)] ?? 1.00;
        $effectiveMinutes = (int) round($baseHours * $multiplier * 60);

        $startDate = $from ? Carbon::instance($from) : Carbon::now();

        return $startDate->addMinutes($effectiveMinutes);
    }

    /**
     * Get list of allowed next statuses from current status.
     *
     * @return list<string>
     */
    public function getAllowedTransitions(string $currentStatus): array
    {
        return self::STATUS_TRANSITIONS[strtolower($currentStatus)] ?? [];
    }

    /**
     * Check if a status transition is permitted.
     */
    public function canTransition(Ticket $ticket, string $newStatus): bool
    {
        $allowed = $this->getAllowedTransitions($ticket->status);

        return in_array($newStatus, $allowed, true);
    }

    /**
     * Transition ticket to a new status following strict workflow ordering.
     *
     * @throws InvalidArgumentException
     */
    public function transition(Ticket $ticket, string $newStatus, ?User $actor = null): Ticket
    {
        if (! $this->canTransition($ticket, $newStatus)) {
            throw new InvalidArgumentException(
                "Cannot transition ticket from [{$ticket->status}] to [{$newStatus}]. Allowed workflow: open -> in_progress -> resolved -> closed."
            );
        }

        $ticket->status = $newStatus;

        if ($newStatus === 'resolved' && ! $ticket->resolved_at) {
            $ticket->resolved_at = Carbon::now();
        }

        $ticket->save();

        return $ticket;
    }

    /**
     * Generate unique sequential ticket number (e.g. TKT-1001).
     */
    public function generateTicketNumber(): string
    {
        $latest = Ticket::query()->orderByDesc('id')->first();
        $nextSequential = $latest ? ($latest->id + 1) : 1;

        return sprintf('TKT-%04d', 1000 + $nextSequential);
    }

    /**
     * Calculate all dashboard KPI metrics.
     *
     * @return array{
     *     totalTickets: int,
     *     openTickets: int,
     *     inProgressTickets: int,
     *     resolvedTickets: int,
     *     closedTickets: int,
     *     openVsResolvedPercentage: float,
     *     avgResolutionTimeHours: float,
     *     slaBreachedCount: int,
     *     priorityBreakdown: array<string, int>,
     *     statusBreakdown: array<string, int>
     * }
     */
    public function getDashboardMetrics(?User $forUser = null): array
    {
        $query = Ticket::query();

        if ($forUser && ! $forUser->isAdmin()) {
            $query->where('user_id', $forUser->id);
        }

        $tickets = $query->get();

        $totalTickets = $tickets->count();
        $openCount = $tickets->where('status', 'open')->count();
        $inProgressCount = $tickets->where('status', 'in_progress')->count();
        $resolvedCount = $tickets->where('status', 'resolved')->count();
        $closedCount = $tickets->where('status', 'closed')->count();

        $totalResolvedOrClosed = $resolvedCount + $closedCount;
        $openVsResolvedPercentage = $totalTickets > 0
            ? round(($totalResolvedOrClosed / $totalTickets) * 100, 1)
            : 0.0;

        $resolvedTicketsWithDuration = $tickets->filter(function (Ticket $ticket): bool {
            return $ticket->resolved_at !== null && $ticket->created_at !== null;
        });

        $avgResolutionTimeHours = 0.0;
        if ($resolvedTicketsWithDuration->isNotEmpty()) {
            $totalMinutes = $resolvedTicketsWithDuration->sum(function (Ticket $ticket): int {
                return $ticket->created_at->diffInMinutes($ticket->resolved_at);
            });
            $avgResolutionTimeHours = round(($totalMinutes / $resolvedTicketsWithDuration->count()) / 60, 2);
        }

        $now = Carbon::now();
        $slaBreachedCount = $tickets->filter(function (Ticket $ticket): bool {
            if ($ticket->isOverdue()) {
                return true;
            }

            if ($ticket->resolved_at && $ticket->sla_due_at && $ticket->resolved_at->gt($ticket->sla_due_at)) {
                return true;
            }

            return false;
        })->count();

        $priorityBreakdown = [
            'critical' => $tickets->where('priority', 'critical')->count(),
            'high' => $tickets->where('priority', 'high')->count(),
            'medium' => $tickets->where('priority', 'medium')->count(),
            'low' => $tickets->where('priority', 'low')->count(),
        ];

        $statusBreakdown = [
            'open' => $openCount,
            'in_progress' => $inProgressCount,
            'resolved' => $resolvedCount,
            'closed' => $closedCount,
        ];

        return [
            'totalTickets' => $totalTickets,
            'openTickets' => $openCount,
            'inProgressTickets' => $inProgressCount,
            'resolvedTickets' => $resolvedCount,
            'closedTickets' => $closedCount,
            'openVsResolvedPercentage' => $openVsResolvedPercentage,
            'avgResolutionTimeHours' => $avgResolutionTimeHours,
            'slaBreachedCount' => $slaBreachedCount,
            'priorityBreakdown' => $priorityBreakdown,
            'statusBreakdown' => $statusBreakdown,
        ];
    }
}
