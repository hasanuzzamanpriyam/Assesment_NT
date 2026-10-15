<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use App\Services\AiTicketAnalyzerService;
use App\Services\TicketWorkflowService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $workflowService = app(TicketWorkflowService::class);
        $aiService = app(AiTicketAnalyzerService::class);

        Schema::disableForeignKeyConstraints();
        TicketComment::truncate();
        Ticket::truncate();
        Category::truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Demo Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => Carbon::now(),
            ]
        );

        $agent = User::firstOrCreate(
            ['email' => 'agent@demo.com'],
            [
                'name' => 'Support Agent Alex',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => Carbon::now(),
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'user@demo.com'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => Carbon::now(),
            ]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'david@demo.com'],
            [
                'name' => 'David Miller',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => Carbon::now(),
            ]
        );

        // 2. Categories
        $categoriesData = [
            [
                'name' => 'Network & Infrastructure',
                'sla_hours' => 6,
                'description' => 'Server downtime, edge latency, DNS routing, and firewall connectivity issues.',
            ],
            [
                'name' => 'Account & Access',
                'sla_hours' => 8,
                'description' => 'Authentication failures, 2FA/MFA resets, access control, and credential issues.',
            ],
            [
                'name' => 'Billing & Payments',
                'sla_hours' => 12,
                'description' => 'Payment gateway errors, double charges, invoice requests, and subscription refunds.',
            ],
            [
                'name' => 'Technical Support',
                'sla_hours' => 24,
                'description' => 'Application bugs, API 500 errors, broken endpoints, and stack trace issues.',
            ],
            [
                'name' => 'General Inquiries',
                'sla_hours' => 48,
                'description' => 'Product feature requests, usage questions, and general feedback.',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $data) {
            $categories[$data['name']] = Category::firstOrCreate(
                ['name' => $data['name']],
                $data
            );
        }

        // 3. Realistic Seed Tickets
        $seedTickets = [
            [
                'title' => 'Production API Gateway Outage - 504 Gateway Timeouts',
                'description' => 'Our core mobile app and third-party webhooks are completely down with 504 Gateway Timeout errors. Traffic spiked and the load balancer is failing health checks. Production is down for all European customers.',
                'category' => 'Network & Infrastructure',
                'priority' => 'critical',
                'status' => 'in_progress',
                'user' => $user,
                'assignee' => $admin,
                'created_hours_ago' => 4,
                'comments' => [
                    ['user' => $admin, 'comment' => 'Investigating edge CDN proxies. Load balancer instance CPU reached 99%. Initiated autoscaling and restarted failed worker pods.'],
                    ['user' => $user, 'comment' => 'Thank you for the quick update. Still noticing errors on the checkout endpoint.'],
                ],
            ],
            [
                'title' => 'Customer Charged Twice for Annual Enterprise Subscription',
                'description' => 'We were double billed $2,400 on our corporate Visa credit card on yesterday\'s invoice renewal. Transaction IDs are TX-89021 and TX-89022. Please refund the duplicate immediately.',
                'category' => 'Billing & Payments',
                'priority' => 'high',
                'status' => 'open',
                'user' => $user2,
                'assignee' => $agent,
                'created_hours_ago' => 2,
                'comments' => [
                    ['user' => $agent, 'comment' => 'Confirmed the duplicate charge on Stripe. Routing to the finance team for instant void/refund.'],
                ],
            ],
            [
                'title' => 'Admin Locked Out - MFA Authenticator Phone Lost',
                'description' => 'I lost my mobile device containing the Google Authenticator app for my workspace account. I cannot log in with 2FA enabled. Need account recovery verification urgently.',
                'category' => 'Account & Access',
                'priority' => 'high',
                'status' => 'open',
                'user' => $user,
                'assignee' => null,
                'created_hours_ago' => 3,
                'comments' => [],
            ],
            [
                'title' => 'NullPointer Exception on User Export CSV button',
                'description' => 'When clicking Export Users to CSV from the reporting tab, the page crashes with a 500 error: Call to a member function format() on null. Stack trace points to line 84 in ExportReportService.',
                'category' => 'Technical Support',
                'priority' => 'medium',
                'status' => 'resolved',
                'user' => $user2,
                'assignee' => $admin,
                'created_hours_ago' => 18,
                'resolved_hours_ago' => 2,
                'comments' => [
                    ['user' => $admin, 'comment' => 'Reproduced bug: users without email_verified_at were breaking the date formatter. Deployed patch in v2.4.1.'],
                ],
            ],
            [
                'title' => 'Inquiry Regarding Custom Domain SSL Certificate Renewal',
                'description' => 'Could you clarify whether Let\'s Encrypt SSL certificates for custom domains are automatically renewed, or if we need to rotate DNS verification records manually every 90 days?',
                'category' => 'General Inquiries',
                'priority' => 'low',
                'status' => 'closed',
                'user' => $user,
                'assignee' => $agent,
                'created_hours_ago' => 60,
                'resolved_hours_ago' => 48,
                'comments' => [
                    ['user' => $agent, 'comment' => 'Our system automatically handles ACME challenge renewals 30 days before expiration via HTTP-01 challenge. Zero manual action is needed.'],
                    ['user' => $user, 'comment' => 'Perfect, that clarifies everything. Closing ticket.'],
                ],
            ],
            [
                'title' => 'Database Deadlock during Bulk Invoice Generation',
                'description' => 'During the midnight automated cron job, MySQL reported Deadlock found when trying to get lock; try restarting transaction in batch invoice queue. 14 invoices remained ungenerated.',
                'category' => 'Technical Support',
                'priority' => 'critical',
                'status' => 'in_progress',
                'user' => $admin,
                'assignee' => $admin,
                'created_hours_ago' => 5,
                'comments' => [
                    ['user' => $admin, 'comment' => 'Wrapped the sequential batch processor inside DB::transaction with retry(5). Testing on staging.'],
                ],
            ],
            [
                'title' => 'Dark Mode Color Contrast in Sidebar Nav',
                'description' => 'Minor visual feedback: in dark mode, the secondary navigation labels have low contrast ratio (around 3.2:1), making them difficult to read on lower brightness screens.',
                'category' => 'General Inquiries',
                'priority' => 'low',
                'status' => 'open',
                'user' => $user2,
                'assignee' => null,
                'created_hours_ago' => 10,
                'comments' => [],
            ],
            [
                'title' => 'Payment Gateway Webhook Signature Verification Failing',
                'description' => 'All incoming Stripe webhooks are returning 400 Bad Request signature verification failed after updating the webhook signing secret in production environment.',
                'category' => 'Billing & Payments',
                'priority' => 'high',
                'status' => 'resolved',
                'user' => $user,
                'assignee' => $agent,
                'created_hours_ago' => 14,
                'resolved_hours_ago' => 3,
                'comments' => [
                    ['user' => $agent, 'comment' => 'Found an extraneous newline character in the .env STRIPE_WEBHOOK_SECRET key. Cleared config cache and verified webhook events.'],
                ],
            ],
            [
                'title' => 'SLA Breached - High Packet Loss on Asia-East Database Replica',
                'description' => 'Our Tokyo read replica database is experiencing 35% packet loss and 2.4s replication lag. Queries to analytics dashboard are timing out.',
                'category' => 'Network & Infrastructure',
                'priority' => 'high',
                'status' => 'open',
                'user' => $admin,
                'assignee' => $agent,
                'created_hours_ago' => 12, // SLA was 6h * 0.75 = 4.5h, so this is overdue!
                'comments' => [
                    ['user' => $agent, 'comment' => 'Ticket is overdue. Coordinated with AWS regional support regarding underwater cable fiber maintenance.'],
                ],
            ],
            [
                'title' => 'User Role Permission Sync Not Reflecting in Admin Dashboard',
                'description' => 'When updating a team member from Viewer to Editor, the permissions cache takes up to 45 minutes to invalidate unless redis cache is flushed manually.',
                'category' => 'Account & Access',
                'priority' => 'medium',
                'status' => 'closed',
                'user' => $user,
                'assignee' => $admin,
                'created_hours_ago' => 30,
                'resolved_hours_ago' => 20,
                'comments' => [
                    ['user' => $admin, 'comment' => 'Added automatic Cache::forget("user_perms_{$id}") observer on UserRoleUpdated event.'],
                ],
            ],
        ];

        foreach ($seedTickets as $index => $item) {
            $cat = $categories[$item['category']];
            $createdAt = Carbon::now()->subHours($item['created_hours_ago']);
            $slaDueAt = $workflowService->calculateSlaDueAt($cat, $item['priority'], $createdAt);

            $resolvedAt = isset($item['resolved_hours_ago'])
                ? Carbon::now()->subHours($item['resolved_hours_ago'])
                : null;

            $aiAnalysis = $aiService->analyze($item['title'], $item['description']);

            $ticketNumber = sprintf('TKT-%04d', 1001 + $index);

            $ticket = Ticket::create([
                'ticket_number' => $ticketNumber,
                'user_id' => $item['user']->id,
                'assigned_to' => $item['assignee']?->id,
                'category_id' => $cat->id,
                'title' => $item['title'],
                'description' => $item['description'],
                'status' => $item['status'],
                'priority' => $item['priority'],
                'ai_summary' => $aiAnalysis['summary'],
                'ai_suggested_category' => $aiAnalysis['suggested_category'],
                'ai_suggested_priority' => $aiAnalysis['suggested_priority'],
                'ai_recommended_solution' => $aiAnalysis['recommended_solution'],
                'sla_due_at' => $slaDueAt,
                'resolved_at' => $resolvedAt,
                'created_at' => $createdAt,
                'updated_at' => $resolvedAt ?? $createdAt,
            ]);

            foreach ($item['comments'] as $c) {
                TicketComment::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $c['user']->id,
                    'comment' => $c['comment'],
                    'created_at' => $createdAt->copy()->addMinutes(rand(10, 60)),
                ]);
            }
        }
    }
}
