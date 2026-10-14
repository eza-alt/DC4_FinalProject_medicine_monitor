<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('medicine_batches', function (Blueprint $table) {
    $table->id();
    $table->foreignId('medicine_id')->constrained()->cascadeOnDelete();
    $table->string('batch_number');
    $table->unsignedInteger('quantity')->default(0);
    $table->date('received_date');
    $table->date('expiration_date');
    $table->timestamps();
    $table->unique(['medicine_id', 'batch_number']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_batches');
    }
};
