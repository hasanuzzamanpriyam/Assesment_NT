<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiTicketAnalyzerService
{
    /**
     * Categories supported by the heuristic classifier and analyzer.
     */
    public const KNOWN_CATEGORIES = [
        'Billing & Payments',
        'Account & Access',
        'Technical Support',
        'Network & Infrastructure',
        'General Inquiries',
    ];

    /**
     * Analyze ticket title and description using Gemini API or rule-based fallback.
     *
     * @return array{
     *     summary: string,
     *     suggested_category: string,
     *     suggested_priority: string,
     *     recommended_solution: string,
     *     source: string
     * }
     */
    public function analyze(string $title, string $description): array
    {
        $apiKey = (string) config('services.ai.api_key', '');

        if (! empty($apiKey)) {
            try {
                $aiResult = $this->callGeminiApi($title, $description, $apiKey);
                if ($aiResult !== null) {
                    return $aiResult;
                }
            } catch (Exception $e) {
                Log::warning('Gemini AI API call failed, switching to heuristic fallback classifier: '.$e->getMessage());
            }
        }

        return $this->fallbackAnalyze($title, $description);
    }

    /**
     * Call Google Gemini API to analyze the ticket content.
     *
     * @return array{
     *     summary: string,
     *     suggested_category: string,
     *     suggested_priority: string,
     *     recommended_solution: string,
     *     source: string
     * }|null
     */
    protected function callGeminiApi(string $title, string $description, string $apiKey): ?array
    {
        $model = (string) config('services.ai.model', 'gemini-1.5-flash');
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $systemPrompt = <<<PROMPT
You are SmartDesk AI, an expert IT service management analyzer.
Analyze the following support ticket and return STRICTLY a JSON object with exactly these four keys:
1. "summary": A concise 1-2 sentence summary of the core issue.
2. "suggested_category": Choose the most appropriate category from: ["Billing & Payments", "Account & Access", "Technical Support", "Network & Infrastructure", "General Inquiries"].
3. "suggested_priority": Choose one urgency level from: ["low", "medium", "high", "critical"].
4. "recommended_solution": 2-3 numbered concrete troubleshooting steps for the support agent to resolve this issue.

Ticket Title: {$title}
Ticket Description: {$description}
PROMPT;

        $response = Http::timeout(6)
            ->acceptJson()
            ->post($endpoint, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $systemPrompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => 0.2,
                ],
            ]);

        if (! $response->successful()) {
            Log::warning('Gemini API responded with status '.$response->status().': '.$response->body());

            return null;
        }

        $body = $response->json();
        $rawText = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if (! $rawText) {
            return null;
        }

        $decoded = json_decode($rawText, true);
        if (! is_array($decoded)) {
            return null;
        }

        $allowedPriorities = ['low', 'medium', 'high', 'critical'];
        $priority = strtolower(trim((string) ($decoded['suggested_priority'] ?? 'medium')));
        if (! in_array($priority, $allowedPriorities, true)) {
            $priority = 'medium';
        }

        return [
            'summary' => trim((string) ($decoded['summary'] ?? Str::limit($description, 160))),
            'suggested_category' => trim((string) ($decoded['suggested_category'] ?? 'Technical Support')),
            'suggested_priority' => $priority,
            'recommended_solution' => trim((string) ($decoded['recommended_solution'] ?? 'Investigate user ticket details.')),
            'source' => 'gemini_ai',
        ];
    }

    /**
     * Robust local rule-based heuristic ML fallback classifier.
     * Runs completely offline with zero external dependencies.
     *
     * @return array{
     *     summary: string,
     *     suggested_category: string,
     *     suggested_priority: string,
     *     recommended_solution: string,
     *     source: string
     * }
     */
    public function fallbackAnalyze(string $title, string $description): array
    {
        $text = strtolower($title.' '.$description);

        $priority = $this->classifyPriority($text);
        $category = $this->classifyCategory($text);
        $summary = $this->generateSummary($title, $description);
        $solution = $this->generateRecommendedSolution($category, $priority);

        return [
            'summary' => $summary,
            'suggested_category' => $category,
            'suggested_priority' => $priority,
            'recommended_solution' => $solution,
            'source' => 'heuristic_fallback',
        ];
    }

    /**
     * Classify priority based on urgency keywords.
     */
    protected function classifyPriority(string $text): string
    {
        $criticalKeywords = [
            'outage', 'downtime', 'server down', 'system down', 'production down',
            'breach', 'data loss', 'emergency', 'fatal error', 'security exploit',
            'hacked', 'catastrophic', 'ransomware', 'crash in prod',
        ];

        foreach ($criticalKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return 'critical';
            }
        }

        $highKeywords = [
            'urgent', 'error 500', 'cannot login', 'can\'t login', 'payment failed',
            'charged twice', 'blocked', 'broken feature', 'timeout', 'major failure',
            'cannot access', 'data corrupted', 'database error', 'failed transaction',
        ];

        foreach ($highKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return 'high';
            }
        }

        $lowKeywords = [
            'typo', 'cosmetic', 'suggestion', 'documentation', 'color', 'minor',
            'font', 'feedback', 'nice to have', 'feature request', 'enhancement',
            'spelling', 'dark mode request',
        ];

        foreach ($lowKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return 'low';
            }
        }

        return 'medium';
    }

    /**
     * Classify category based on domain keywords.
     */
    protected function classifyCategory(string $text): string
    {
        $categoryPatterns = [
            'Billing & Payments' => [
                'bill', 'billing', 'payment', 'invoice', 'charge', 'charged',
                'subscription', 'refund', 'stripe', 'paypal', 'credit card',
                'pricing', 'receipt', 'overcharged', 'transaction',
            ],
            'Account & Access' => [
                'login', 'password', 'account', '2fa', 'mfa', 'auth', 'permission',
                'sign in', 'reset password', 'access denied', 'locked out',
                'profile', 'verification', 'unauthorized', 'credentials',
            ],
            'Network & Infrastructure' => [
                'slow', 'latency', 'ping', 'server', 'dns', 'connection',
                'packet loss', 'timeout', '502', '504', 'bad gateway', 'cloud',
                'bandwidth', 'load balancer', 'firewall', 'ip address',
            ],
            'Technical Support' => [
                'bug', 'error', 'exception', 'crash', 'api', 'code', 'syntax',
                'broken', 'failed', 'issue', 'glitch', 'stack trace', '404',
                'unexpected response', 'database query', 'javascript',
            ],
        ];

        $scores = [];
        foreach ($categoryPatterns as $cat => $keywords) {
            $score = 0;
            foreach ($keywords as $kw) {
                if (str_contains($text, $kw)) {
                    $score += 2;
                }
            }
            $scores[$cat] = $score;
        }

        arsort($scores);
        $topCategory = array_key_first($scores);
        if ($topCategory && $scores[$topCategory] > 0) {
            return $topCategory;
        }

        return 'General Inquiries';
    }

    /**
     * Generate 1-2 sentence concise summary.
     */
    protected function generateSummary(string $title, string $description): string
    {
        $cleanDesc = trim(preg_replace('/\s+/', ' ', strip_tags($description)) ?? '');
        $sentences = preg_split('/(?<=[.?!])\s+/', $cleanDesc, 3, PREG_SPLIT_NO_EMPTY);

        if (! empty($sentences) && count($sentences) >= 2) {
            $combined = trim($sentences[0].' '.$sentences[1]);
            if (strlen($combined) <= 220) {
                return $combined;
            }
        }

        if (! empty($sentences) && count($sentences) >= 1) {
            return Str::limit(trim($sentences[0]), 180);
        }

        return "User filed issue '{$title}': ".Str::limit($cleanDesc, 140);
    }

    /**
     * Generate 2-3 step actionable troubleshooting recommendation.
     */
    protected function generateRecommendedSolution(string $category, string $priority): string
    {
        $urgencyPrefix = ($priority === 'critical' || $priority === 'high')
            ? "PRIORITY ACTION REQUIRED:\n"
            : '';

        return match ($category) {
            'Billing & Payments' => $urgencyPrefix.
                "1. Cross-check payment gateway transaction reference against the billing ledger.\n".
                "2. Verify user invoice status and test if refund/re-charge criteria are met.\n".
                '3. Adjust account balance or reissue receipt, and notify customer with confirmation ID.',

            'Account & Access' => $urgencyPrefix.
                "1. Check identity provider security audit logs for repeated failed logins or IP blocks.\n".
                "2. Verify account ownership via registered primary email or security verification.\n".
                '3. Reset temporary security token/credentials and send a verified one-time recovery link.',

            'Network & Infrastructure' => $urgencyPrefix.
                "1. Inspect edge proxy latency, regional CDN status, and live server resource utilization.\n".
                "2. Run traceroute and check DNS records or firewall rate-limiting policies for client IP.\n".
                '3. Restart degraded container/worker instance and monitor packet loss metrics.',

            'Technical Support' => $urgencyPrefix.
                "1. Examine recent application error logs in storage/logs for matching exception traces.\n".
                "2. Replicate incident in staging environment using the reported user payload and state.\n".
                '3. Deploy hotfix or apply configuration patch, followed by application cache purge.',

            default => $urgencyPrefix.
                "1. Review customer profile and review past related tickets in the system.\n".
                "2. Provide relevant standard operating procedure or knowledge base guidance.\n".
                '3. Check with the client to verify if the answer completely resolves their request.',
        };
    }
}
