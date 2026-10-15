<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Determine whether the user can view any tickets.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the specific ticket.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin() || $ticket->user_id === $user->id || $ticket->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can create tickets.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the ticket.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        if ($ticket->status === 'closed') {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $ticket->user_id === $user->id && $ticket->status === 'open';
    }

    /**
     * Determine whether the user can delete the ticket.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $ticket->user_id === $user->id && $ticket->status === 'open';
    }

    /**
     * Determine whether the user can change status of the ticket.
     */
    public function changeStatus(User $user, Ticket $ticket): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Assignee or owner can participate in workflow
        return $ticket->user_id === $user->id || $ticket->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can assign agent to the ticket.
     */
    public function assign(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin();
    }
}
