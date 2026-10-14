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
         Schema::create('medicines', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('generic_name')->nullable();
        $table->string('category');
        $table->string('unit');
        $table->unsignedInteger('reorder_level')->default(0);
        $table->text('description')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
