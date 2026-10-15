<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'priority' => ['required', 'string', 'in:low,medium,high,critical'],
            'description' => ['required', 'string', 'min:10'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Please provide a clear title for your ticket.',
            'category_id.required' => 'Please select a valid ticket category.',
            'category_id.exists' => 'The selected category does not exist.',
            'priority.required' => 'Please select a priority level.',
            'priority.in' => 'Priority must be one of: low, medium, high, critical.',
            'description.required' => 'Please provide detailed information about the issue.',
            'description.min' => 'Description must be at least 10 characters long.',
            'assigned_to.exists' => 'The selected assigned user does not exist.',
        ];
    }
}
