<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_void_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales');
            $table->foreignId('supervisor_id')->constrained('users');
            $table->text('reason');
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('post_void_sales');
    }
};
