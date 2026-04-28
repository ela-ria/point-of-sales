<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Default users
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@sariph.com',
            'password' => bcrypt('password'),
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Supervisor',
            'email'    => 'supervisor@sariph.com',
            'password' => bcrypt('password'),
            'role'     => 'supervisor',
        ]);

        User::create([
            'name'     => 'Cashier',
            'email'    => 'cashier@sariph.com',
            'password' => bcrypt('password'),
            'role'     => 'cashier',
        ]);

        // Sample products
        $products = [
            ['name' => 'Lucky Me Pancit Canton', 'barcode' => '4800016430604', 'price' => 15.00,  'stock_quantity' => 100],
            ['name' => 'Nestle Milo 300g',        'barcode' => '4800052111201', 'price' => 120.00, 'stock_quantity' => 50],
            ['name' => 'Palmolive Shampoo 90ml',  'barcode' => '6281006518000', 'price' => 35.00,  'stock_quantity' => 75],
            ['name' => 'Colgate Toothpaste 75ml', 'barcode' => '6281003601013', 'price' => 55.00,  'stock_quantity' => 60],
            ['name' => 'Monggo 250g',             'barcode' => '4800017780092', 'price' => 25.00,  'stock_quantity' => 80],
            ['name' => 'Tide Powder 66g',         'barcode' => '4902430077088', 'price' => 10.00,  'stock_quantity' => 120],
            ['name' => 'Century Tuna 155g',       'barcode' => '4800016535544', 'price' => 38.00,  'stock_quantity' => 90],
        ];

        foreach ($products as $p) {
            Product::create($p);
        }
    }
}