# SmartDesk — AI-Powered Service & Issue Workflow System

[![Laravel Version](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel)](https://laravel.com)
[![PHP Version](https://img.shields.io/badge/PHP-8.3-777BB4?style=flat&logo=php)](https://php.net)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-React-9553E9?style=flat&logo=inertia)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-30%20Passed-emerald)](file:///c:/laragon/www/assesment_NT/tests/Feature/TicketWorkflowTest.php)

> **SmartDesk** is a production-ready, full-stack service desk and workflow orchestration platform built with **Laravel**, **Inertia.js**, **React**, **Tailwind CSS**, and **MySQL**. It features dynamic SLA tracking with priority-based multipliers, a strict status transition workflow engine, role-based authorization, and an **AI/ML Issue Analyzer** with an offline heuristic fallback classifier.

---

## Table of Contents
1. [System Architecture & Features](#system-architecture--features)
2. [AI/ML Feature Deep-Dive](#aiml-feature-deep-dive)
3. [Business Logic & Workflow Engine](#business-logic--workflow-engine)
4. [Database Schema & Relationships](#database-schema--relationships)
5. [Demo Credentials](#demo-credentials)
6. [Installation & Setup](#installation--setup)
7. [Automated Testing](#automated-testing)
8. [Live Interview Code Guide](#live-interview-code-guide)

---

## System Architecture & Features

### 1. Modern Full-Stack Stack
- **Backend**: Laravel 12 (PHP 8.3) utilizing strict types, constructor property promotion, dedicated FormRequests, and Eloquent model casting.
- **Frontend**: React 18 with Inertia.js (Single Page Application architecture without client-side routing headaches) styled with Tailwind CSS and Lucide icons.
- **Database**: MySQL with normalized relational tables, foreign key constraints, cascading deletes, and indexed columns.

### 2. Core Capabilities
- **KPI Metrics Dashboard**: Real-time calculations of Total Tickets, Active Queue, Resolution Percentage, Average Resolution Time (in hours), and SLA Breached (overdue) ticket count.
- **Interactive Issue Creation**: Live "Analyze with AI" feature previewing category suggestions, predicted urgency, issue summary, and support agent troubleshooting steps before submission.
- **Strict Workflow Lifecycle**: Enforces sequential stage transitions (`open` &rarr; `in_progress` &rarr; `resolved` &rarr; `closed`). Re-opening closed tickets is strictly prevented by business logic.
- **Dynamic SLA Timers**: Computes target deadlines automatically using category baseline hours combined with priority multipliers.
- **Role-Based Access Control (RBAC)**:
  - `admin`: Full visibility across all tickets, assignment controls, status escalation, and Category CRUD management.
  - `user`: Secure scoped access to personal tickets, status review, and response commenting.
- **Category Management**: Admin interface to configure baseline SLA turnaround targets and describe service level expectations.

---

## AI/ML Feature Deep-Dive

The AI subsystem is encapsulated inside [`App\Services\AiTicketAnalyzerService`](file:///c:/laragon/www/assesment_NT/app/Services/AiTicketAnalyzerService.php).

### 1. Model Pipeline & Architecture
```
                         +-----------------------------+
                         | User Submits Issue Content  |
                         |  (Title & Description)      |
                         +--------------+--------------+
                                        |
                         +--------------v--------------+
                         |   Is AI_API_KEY Configured? |
                         +-------+--------------+------+
                            Yes  |              | No
                                 |              |
                +----------------v---+          |
                | Call Gemini API    |          |
                | (gemini-1.5-flash) |          |
                +--------+-----------+          |
                   Success|      | Fails        |
                          |      +----+         |
                          |           |         |
                          |    +------v---------v------+
                          |    | Heuristic ML Fallback |
                          |    | Rule-Based Classifier |
                          |    +------+----------------+
                          |           |
                          +-----+-----+
                                |
               +----------------v----------------+
               | Structured JSON Intelligence:   |
               | • 1-2 sentence Summary          |
               | • Suggested Category            |
               | • Predicted Urgency (Priority)  |
               | • 3-Step Agent Troubleshooting  |
               +---------------------------------+
```

### 2. Inputs & Outputs Schema
- **Input**:
  - `title` (string, min: 3)
  - `description` (string, min: 10)
- **Output (JSON)**:
  ```json
  {
    "summary": "Core API cluster throwing 504 timeouts due to traffic spike.",
    "suggested_category": "Network & Infrastructure",
    "suggested_priority": "critical",
    "recommended_solution": "1. Inspect edge proxy latency and CDN status.\n2. Run traceroute and check DNS records.\n3. Restart degraded container instance and monitor packet loss.",
    "source": "gemini_ai" // or "heuristic_fallback"
  }
  ```

### 3. Resilient Fallback Mechanism (Zero Downtime)
If `.env` has no `AI_API_KEY`, if the external API exceeds rate limits, or if internet connectivity drops, **the application will never crash or hang**. The service seamlessly engages the local rule-based classifier:
- **Urgency Predictor**: Keyword scanning for critical indicators (`outage`, `downtime`, `fatal`, `breach`, `data loss`) &rarr; `critical`; high-severity indicators (`urgent`, `error 500`, `cannot login`, `payment failed`) &rarr; `high`; low-severity keywords (`typo`, `cosmetic`, `color`, `suggestion`) &rarr; `low`; otherwise default &rarr; `medium`.
- **Domain Classifier**: Multi-keyword weighted scoring for `Billing & Payments`, `Account & Access`, `Network & Infrastructure`, and `Technical Support`.
- **Contextual Summary & Solutions**: Generates clean, actionable 3-step technical triage plans tailored to the classified domain.

### 4. Limitations & Evaluation Method
- **Limitations**:
  - Cloud API calls introduce 400ms - 1200ms latency (mitigated by asynchronous background calls and instant preview endpoints).
  - External API depends on network quotas and valid credentials.
- **Evaluation Method**:
  - Precision of priority categorization is validated via unit and feature test assertions in [`tests/Feature/TicketWorkflowTest.php`](file:///c:/laragon/www/assesment_NT/tests/Feature/TicketWorkflowTest.php).
  - Test suites verify that both external and fallback paths return complete, well-formed schemas.

---

## Business Logic & Workflow Engine

The business rules are encapsulated in [`App\Services\TicketWorkflowService`](file:///c:/laragon/www/assesment_NT/app/Services/TicketWorkflowService.php).

### 1. Dynamic SLA Calculation Formula
$$\text{Effective SLA Hours} = \text{Category Baseline Hours} \times \text{Priority Multiplier}$$

| Priority Level | SLA Multiplier | Effective SLA for a 24h Category |
| :--- | :---: | :---: |
| **Critical** | `0.50` (50% time) | **12 Hours** |
| **High** | `0.75` (75% time) | **18 Hours** |
| **Medium** | `1.00` (100% time) | **24 Hours** |
| **Low** | `1.50` (150% time) | **36 Hours** |

Due timestamp is calculated at ticket creation:
$$\text{sla\_due\_at} = \text{created\_at} + \text{Effective SLA Minutes}$$

### 2. Strict Workflow Order
Tickets advance strictly through these ordered states:
$$\text{Open} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved} \longrightarrow \text{Closed}$$

- Jumping straight from `open` to `resolved` is blocked.
- Transitioning to `resolved` automatically timestamps `resolved_at = now()`.
- Once `closed`, state changes are permanently locked to preserve audit integrity.

---

## Database Schema & Relationships

```
+--------------------+        +---------------------+
|       users        |        |     categories      |
+--------------------+        +---------------------+
| id                 |        | id                  |
| name               |        | name                |
| email (unique)     |        | sla_hours (int)     |
| role (admin/user)  |        | description         |
| password           |        | timestamps          |
| timestamps         |        +----------+----------+
+---------+----------+                   |
          |                              |
          | 1:N                          | 1:N
          v                              v
+---------+------------------------------+----------+
|                      tickets                      |
+---------------------------------------------------+
| id                                                |
| ticket_number (unique: TKT-1001)                  |
| user_id (FK -> users.id)                          |
| assigned_to (FK -> users.id, nullable)            |
| category_id (FK -> categories.id)                 |
| title (string)                                    |
| description (text)                                |
| status (enum: open, in_progress, resolved, closed)|
| priority (enum: low, medium, high, critical)      |
| ai_summary (text, nullable)                       |
| ai_suggested_category (string, nullable)          |
| ai_suggested_priority (string, nullable)          |
| ai_recommended_solution (text, nullable)          |
| sla_due_at (timestamp)                            |
| resolved_at (timestamp, nullable)                 |
| timestamps                                        |
+-------------------------+-------------------------+
                          |
                          | 1:N
                          v
+-------------------------+-------------------------+
|                  ticket_comments                  |
+---------------------------------------------------+
| id                                                |
| ticket_id (FK -> tickets.id, cascade)             |
| user_id (FK -> users.id, cascade)                 |
| comment (text)                                    |
| timestamps                                        |
+---------------------------------------------------+
```

---

## Demo Credentials

The database seeder provisions pre-configured accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@demo.com` | `password` | Full system control, category CRUD, reassignment, status workflow |
| **Support Agent** | `agent@demo.com` | `password` | Triage, ticket updates, assignment, workflow progression |
| **Regular User** | `user@demo.com` | `password` | Submit issues, view own tickets, add thread comments |
| **Regular User** | `david@demo.com` | `password` | Submit issues, view own tickets |

---

## Installation & Setup

### Prerequisites
- **PHP**: `^8.3`
- **Composer**: `^2.x`
- **Node.js & NPM**: `^20.x` or `^22.x`
- **MySQL**: `^8.0` (Laragon / XAMPP / Native MySQL)

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/hasanuzzamanpriyam/Assesment_NT.git
cd Assesment_NT
cp .env.example .env
```

### Step 2: Configure Database Credentials in `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=Assignment_NT
DB_USERNAME=root
DB_PASSWORD=
```

*(Optional) Configure Google Gemini AI Key:*
```env
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
```
*(If left empty, SmartDesk automatically uses its offline rule-based heuristic ML engine!)*

### Step 3: Install Backend Dependencies & Run Migrations
```bash
composer install
php artisan key:generate
php artisan migrate:fresh --seed
```

### Step 4: Install Frontend Packages & Compile
```bash
npm install --legacy-peer-deps
npm run build
```

### Step 5: Start the Development Server
```bash
php artisan serve
```
Open **`http://127.0.0.1:8000`** in your browser.

---

## Automated Testing

Run the feature and unit test suite via PHPUnit:

```bash
# Run ticket workflow and AI analyzer tests
php artisan test --filter=TicketWorkflowTest

# Run all application tests
php artisan test
```

### Test Suite Coverage
1. `test_authenticated_user_can_create_ticket`: Validates authentication, SLA calculation, ticket number generation, and database persistence.
2. `test_invalid_input_returns_validation_error`: Asserts that FormRequest validation rules reject missing or malformed inputs.
3. `test_sla_calculation_calculates_correct_due_timestamp`: Validates exact minutes added across critical (0.5x), high (0.75x), medium (1.0x), and low (1.5x) multipliers.
4. `test_invalid_status_transition_is_blocked`: Verifies that invalid state changes (`open` &rarr; `resolved`) are rejected and that closed tickets cannot be reopened.
5. `test_ai_analyzer_service_returns_valid_output_structure`: Verifies structured schema, summary generation, and resolution advice.

---

## Live Interview Code Guide

When walking an interviewer through this codebase:

1. **Architecture & Clean Code**: Point to [`app/Services/TicketWorkflowService.php`](file:///c:/laragon/www/assesment_NT/app/Services/TicketWorkflowService.php) to demonstrate how business logic is cleanly extracted from controllers into testable services.
2. **AI & Heuristic Resilience**: Walk through [`app/Services/AiTicketAnalyzerService.php`](file:///c:/laragon/www/assesment_NT/app/Services/AiTicketAnalyzerService.php) to explain how external API calls gracefully fall back to local rule-based ML classification without throwing exceptions.
3. **Form Request Validation**: Highlight [`app/Http/Requests/StoreTicketRequest.php`](file:///c:/laragon/www/assesment_NT/app/Http/Requests/StoreTicketRequest.php) showing explicit validation rules and descriptive error messages.
4. **Security & Authorization**: Open [`app/Policies/TicketPolicy.php`](file:///c:/laragon/www/assesment_NT/app/Policies/TicketPolicy.php) and [`app/Http/Middleware/EnsureUserIsAdmin.php`](file:///c:/laragon/www/assesment_NT/app/Http/Middleware/EnsureUserIsAdmin.php) to discuss multi-tenant user scoping vs admin privileges.
5. **Interactive UI**: Show [`resources/js/Pages/Tickets/Create.jsx`](file:///c:/laragon/www/assesment_NT/resources/js/Pages/Tickets/Create.jsx) for the asynchronous "Analyze with AI" live assistant and [`resources/js/Pages/Tickets/Show.jsx`](file:///c:/laragon/www/assesment_NT/resources/js/Pages/Tickets/Show.jsx) for the workflow progression stepper and SLA countdown monitoring.
