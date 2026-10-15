<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use App\Services\AiTicketAnalyzerService;
use App\Services\TicketWorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class TicketWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /**
     * Test 1: Authenticated user can create a ticket.
     */
    public function test_authenticated_user_can_create_ticket(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $category = Category::create([
            'name' => 'Technical Support',
            'sla_hours' => 24,
            'description' => 'Technical issues',
        ]);

        $response = $this->actingAs($user)->post(route('tickets.store'), [
            'title' => 'Cannot upload profile picture',
            'category_id' => $category->id,
            'priority' => 'high',
            'description' => 'Getting an error whenever I upload a JPEG file above 1MB.',
        ]);

        $this->assertDatabaseHas('tickets', [
            'title' => 'Cannot upload profile picture',
            'user_id' => $user->id,
            'category_id' => $category->id,
            'priority' => 'high',
            'status' => 'open',
        ]);

        $ticket = Ticket::where('title', 'Cannot upload profile picture')->first();
        $this->assertNotNull($ticket);
        $this->assertStringStartsWith('TKT-', $ticket->ticket_number);
        $this->assertNotNull($ticket->sla_due_at);
        $this->assertNotNull($ticket->ai_summary);

        $response->assertRedirect(route('tickets.show', $ticket));
    }

    /**
     * Test 2: Invalid input returns validation error.
     */
    public function test_invalid_input_returns_validation_error(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('tickets.store'), [
            'title' => '',
            'category_id' => 9999, // Non-existent category
            'priority' => 'super_urgent', // Invalid priority
            'description' => 'short', // Min length is 10
        ]);

        $response->assertSessionHasErrors(['title', 'category_id', 'priority', 'description']);
    }

    /**
     * Test 3: SLA calculation works correctly based on category hours and priority multiplier.
     */
    public function test_sla_calculation_calculates_correct_due_timestamp(): void
    {
        $workflowService = app(TicketWorkflowService::class);
        $category = Category::create([
            'name' => 'Billing & Payments',
            'sla_hours' => 10,
        ]);

        $now = Carbon::parse('2026-05-01 10:00:00');

        // critical = 50% => 5 hours
        $criticalDue = $workflowService->calculateSlaDueAt($category, 'critical', $now);
        $this->assertEquals($now->copy()->addHours(5)->toDateTimeString(), $criticalDue->toDateTimeString());

        // high = 75% => 7.5 hours (7 hours 30 mins)
        $highDue = $workflowService->calculateSlaDueAt($category, 'high', $now);
        $this->assertEquals($now->copy()->addMinutes(450)->toDateTimeString(), $highDue->toDateTimeString());

        // medium = 100% => 10 hours
        $mediumDue = $workflowService->calculateSlaDueAt($category, 'medium', $now);
        $this->assertEquals($now->copy()->addHours(10)->toDateTimeString(), $mediumDue->toDateTimeString());

        // low = 150% => 15 hours
        $lowDue = $workflowService->calculateSlaDueAt($category, 'low', $now);
        $this->assertEquals($now->copy()->addHours(15)->toDateTimeString(), $lowDue->toDateTimeString());
    }

    /**
     * Test 4: Invalid status transition is blocked by workflow rules.
     */
    public function test_invalid_status_transition_is_blocked(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::create(['name' => 'General', 'sla_hours' => 24]);

        $ticket = Ticket::create([
            'ticket_number' => 'TKT-1001',
            'user_id' => $admin->id,
            'category_id' => $category->id,
            'title' => 'Test Workflow',
            'description' => 'Workflow status transitions test description.',
            'status' => 'open',
            'priority' => 'medium',
            'sla_due_at' => now()->addDay(),
        ]);

        // Attempting to jump directly from 'open' to 'resolved' is blocked
        $response = $this->actingAs($admin)->patch(route('tickets.status', $ticket), [
            'status' => 'resolved',
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals('open', $ticket->fresh()->status);

        // Valid transition from 'open' to 'in_progress' succeeds
        $validResponse = $this->actingAs($admin)->patch(route('tickets.status', $ticket), [
            'status' => 'in_progress',
        ]);
        $validResponse->assertSessionHas('success');
        $this->assertEquals('in_progress', $ticket->fresh()->status);

        // Transition to resolved sets resolved_at
        $this->actingAs($admin)->patch(route('tickets.status', $ticket), [
            'status' => 'resolved',
        ]);
        $ticket->refresh();
        $this->assertEquals('resolved', $ticket->status);
        $this->assertNotNull($ticket->resolved_at);

        // Transition to closed succeeds
        $this->actingAs($admin)->patch(route('tickets.status', $ticket), [
            'status' => 'closed',
        ]);
        $this->assertEquals('closed', $ticket->fresh()->status);

        // Closed ticket cannot transition back to in_progress
        $reopenResponse = $this->actingAs($admin)->patch(route('tickets.status', $ticket), [
            'status' => 'in_progress',
        ]);
        $reopenResponse->assertSessionHas('error');
        $this->assertEquals('closed', $ticket->fresh()->status);
    }

    /**
     * Test 5: AI analyzer service returns valid output structure with fallback classifier.
     */
    public function test_ai_analyzer_service_returns_valid_output_structure(): void
    {
        $aiService = app(AiTicketAnalyzerService::class);

        $result = $aiService->analyze(
            'Emergency database crash in production cluster',
            'Our main database crashed and went down after out of memory error. Total system downtime for all users.'
        );

        $this->assertIsArray($result);
        $this->assertArrayHasKey('summary', $result);
        $this->assertArrayHasKey('suggested_category', $result);
        $this->assertArrayHasKey('suggested_priority', $result);
        $this->assertArrayHasKey('recommended_solution', $result);
        $this->assertArrayHasKey('source', $result);

        $this->assertNotEmpty($result['summary']);
        $this->assertEquals('critical', $result['suggested_priority']);
        $this->assertStringContainsString('1.', $result['recommended_solution']);
    }
}
