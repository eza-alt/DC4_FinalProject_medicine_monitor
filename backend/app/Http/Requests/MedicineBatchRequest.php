<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MedicineBatchRequest extends FormRequest
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
        'medicine_id' => ['required', 'exists:medicines,id'],
        'batch_number' => [
            'required', 'string', 'max:50',
            Rule::unique('medicine_batches', 'batch_number')
                ->where('medicine_id', $this->medicine_id)
                ->ignore($this->route('batch')),
        ],
        'quantity' => ['required', 'integer', $this->isMethod('post') ? 'min:1' : 'min:0'],
        'received_date' => ['required', 'date', 'before_or_equal:today'],
        'expiration_date' => ['required', 'date', 'after_or_equal:received_date'],
    ];
}
    }

