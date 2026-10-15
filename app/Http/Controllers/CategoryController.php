<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount('tickets')
            ->orderBy('name')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $category = Category::create($request->validated());

        return redirect()->route('categories.index')
            ->with('success', "Category '{$category->name}' created successfully with {$category->sla_hours}h SLA.");
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return redirect()->route('categories.index')
            ->with('success', "Category '{$category->name}' updated successfully.");
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->tickets()->exists()) {
            return back()->with('error', "Cannot delete category '{$category->name}' because it contains {$category->tickets()->count()} existing tickets.");
        }

        $categoryName = $category->name;
        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', "Category '{$categoryName}' deleted successfully.");
    }
}
