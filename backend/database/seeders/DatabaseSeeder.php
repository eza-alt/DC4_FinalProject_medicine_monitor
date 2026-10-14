<?php

namespace Database\Seeders;

use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockRequest;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Demo accounts (password is hashed automatically)
        $admin = User::factory()->create([
            'name' => 'Maria Santos',
            'email' => 'admin@healthcenter.test',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $staff = User::factory()->create([
            'name' => 'Jose Ramirez',
            'email' => 'staff@healthcenter.test',
            'password' => 'password123',
            'role' => 'staff',
        ]);

        User::factory()->create([
            'name' => 'Ana Dela Cruz',
            'email' => 'ana@healthcenter.test',
            'password' => 'password123',
            'role' => 'staff',
        ]);

        // [name, generic name, category, unit, reorder level]
        $list = [
            ['Paracetamol 500mg', 'Paracetamol', 'Analgesic', 'tablet', 100],
            ['Amoxicillin 500mg', 'Amoxicillin', 'Antibiotic', 'capsule', 80],
            ['Ibuprofen 400mg', 'Ibuprofen', 'Analgesic', 'tablet', 60],
            ['Cetirizine 10mg', 'Cetirizine', 'Antihistamine', 'tablet', 50],
            ['Losartan 50mg', 'Losartan', 'Antihypertensive', 'tablet', 80],
            ['Amlodipine 5mg', 'Amlodipine', 'Antihypertensive', 'tablet', 80],
            ['Metformin 500mg', 'Metformin', 'Antidiabetic', 'tablet', 100],
            ['Gliclazide 80mg', 'Gliclazide', 'Antidiabetic', 'tablet', 60],
            ['Salbutamol 2mg', 'Salbutamol', 'Respiratory', 'tablet', 50],
            ['Cotrimoxazole 400mg', 'Sulfamethoxazole-Trimethoprim', 'Antibiotic', 'tablet', 60],
            ['Omeprazole 20mg', 'Omeprazole', 'Gastrointestinal', 'capsule', 50],
            ['Loperamide 2mg', 'Loperamide', 'Gastrointestinal', 'capsule', 40],
            ['Oral Rehydration Salts', 'ORS', 'Gastrointestinal', 'sachet', 100],
            ['Ascorbic Acid 500mg', 'Vitamin C', 'Vitamin', 'tablet', 120],
            ['Vitamin B Complex', 'Vitamin B', 'Vitamin', 'tablet', 100],
            ['Ferrous Sulfate 325mg', 'Iron', 'Supplement', 'tablet', 80],
            ['Zinc Sulfate 20mg', 'Zinc', 'Supplement', 'tablet', 60],
            ['Mefenamic Acid 500mg', 'Mefenamic Acid', 'Analgesic', 'capsule', 60],
            ['Aspirin 80mg', 'Acetylsalicylic Acid', 'Cardiovascular', 'tablet', 50],
            ['Simvastatin 20mg', 'Simvastatin', 'Cardiovascular', 'tablet', 60],
            ['Hydrocortisone Cream 1%', 'Hydrocortisone', 'Topical', 'tube', 20],
            ['Povidone-Iodine 10%', 'Povidone-Iodine', 'Antiseptic', 'bottle', 15],
        ];

        // Days from today until expiry (negative = already expired)
        $offsets = [-40, 30, 75, 200, 400, 600];
        $medicines = [];

        foreach ($list as $i => $m) {
            $medicine = Medicine::create([
                'name' => $m[0],
                'generic_name' => $m[1],
                'category' => $m[2],
                'unit' => $m[3],
                'reorder_level' => $m[4],
                'description' => "{$m[2]} used at the health center.",
            ]);
            $medicines[] = $medicine;

            $prefix = strtoupper(substr($m[0], 0, 3));

            foreach ([1, 2] as $n) {
                // Every 5th medicine gets low quantities so it shows as low stock
                $qty = ($i % 5 === 0) ? rand(5, 15) : rand(60, 300);
                $received = now()->subDays(rand(30, 120));

                $batch = MedicineBatch::create([
                    'medicine_id' => $medicine->id,
                    'batch_number' => $prefix . '-' . str_pad($n, 3, '0', STR_PAD_LEFT),
                    'quantity' => $qty,
                    'received_date' => $received,
                    'expiration_date' => now()->addDays($offsets[($i + $n) % count($offsets)]),
                ]);

                StockTransaction::create([
                    'medicine_batch_id' => $batch->id,
                    'user_id' => $admin->id,
                    'transaction_type' => 'stock_in',
                    'quantity' => $qty,
                    'transaction_date' => $received,
                    'remarks' => 'Initial stock received',
                ]);
            }
        }

        // Stock requests in different statuses
        $requests = [
            [1, 'pending', 20, 'Needed for the weekly prenatal clinic'],
            [2, 'pending', 30, 'Running low in the treatment room'],
            [3, 'pending', 15, 'Allergy cases this week'],
            [6, 'pending', 40, 'Diabetic patients monthly checkup'],
            [4, 'rejected', 500, 'Quantity too large for current stock'],
            [7, 'rejected', 100, 'Requested twice already'],
            [8, 'completed', 10, 'Asthma patients'],
            [9, 'completed', 10, 'Diarrhea cases in the barangay'],
        ];

        foreach ($requests as [$index, $status, $qty, $reason]) {
            $medicine = $medicines[$index];
            $isReviewed = $status !== 'pending';

            $request = StockRequest::create([
                'user_id' => $staff->id,
                'medicine_id' => $medicine->id,
                'quantity' => $qty,
                'reason' => $reason,
                'status' => $status,
                'reviewed_by' => $isReviewed ? $admin->id : null,
                'reviewed_at' => $isReviewed ? now()->subDays(rand(1, 5)) : null,
            ]);

            if ($status === 'completed') {
                $batch = $medicine->batches()->first();
                $batch->decrement('quantity', $qty);

                StockTransaction::create([
                    'medicine_batch_id' => $batch->id,
                    'user_id' => $admin->id,
                    'stock_request_id' => $request->id,
                    'transaction_type' => 'stock_out',
                    'quantity' => $qty,
                    'transaction_date' => now()->subDays(rand(1, 5)),
                    'remarks' => 'Released for approved request',
                ]);
            }
        }
    }
}