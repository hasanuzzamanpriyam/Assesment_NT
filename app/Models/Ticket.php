<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'ticket_number',
        'user_id',
        'assigned_to',
        'category_id',
        'title',
        'description',
        'status',
        'priority',
        'ai_summary',
        'ai_suggested_category',
        'ai_suggested_priority',
        'ai_recommended_solution',
        'sla_due_at',
        'resolved_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sla_due_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }

    public function isOverdue(): bool
    {
        if (in_array($this->status, ['resolved', 'closed'])) {
            return false;
        }

        return $this->sla_due_at ? $this->sla_due_at->isPast() : false;
    }

    public function getResolutionTimeInHours(): ?float
    {
        if (! $this->resolved_at) {
            return null;
        }

        return round($this->created_at->diffInMinutes($this->resolved_at) / 60, 2);
    }
}
