<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100', 'unique:categories,name'],
            'sla_hours' => ['required', 'integer', 'min:1', 'max:720'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required.',
            'name.unique' => 'A category with this name already exists.',
            'sla_hours.required' => 'Please provide the baseline SLA resolution hours.',
            'sla_hours.integer' => 'SLA hours must be an integer.',
            'sla_hours.min' => 'SLA hours must be at least 1 hour.',
            'sla_hours.max' => 'SLA hours cannot exceed 720 hours (30 days).',
        ];
    }
}
