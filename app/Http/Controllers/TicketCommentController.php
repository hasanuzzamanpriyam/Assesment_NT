<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class TicketCommentController extends Controller
{
    public function store(StoreCommentRequest $request, Ticket $ticket): RedirectResponse
    {
        Gate::authorize('view', $ticket);

        $ticket->comments()->create([
            'user_id' => $request->user()->id,
            'comment' => $request->validated('comment'),
        ]);

        return back()->with('success', 'Comment posted to ticket thread successfully.');
    }
}
