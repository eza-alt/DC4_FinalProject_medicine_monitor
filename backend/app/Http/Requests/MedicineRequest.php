<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MedicineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
             'name' => ['required', 'string', 'max:255'],
        'generic_name' => ['nullable', 'string', 'max:255'],
        'category' => ['required', 'string', 'max:100'],
        'unit' => ['required', 'string', 'max:50'],
        'reorder_level' => ['required', 'integer', 'min:0'],
        'description' => ['nullable', 'string'],
        ];
    }
}
