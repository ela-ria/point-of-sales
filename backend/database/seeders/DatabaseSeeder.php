<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
    ['name' => 'Lucky Me Pancit Canton', 'category' => 'Groceries',      'barcode' => '001', 'price' => 14.00, 'stock_quantity' => 50],
    ['name' => 'San Miguel Beer',         'category' => 'Groceries',      'barcode' => '002', 'price' => 55.00, 'stock_quantity' => 30],
    ['name' => 'Monggo Seeds 500g',       'category' => 'Groceries',      'barcode' => '003', 'price' => 38.00, 'stock_quantity' => 40],
    ['name' => 'Ballpen Blue (Pcs)',       'category' => 'School Supplies','barcode' => '004', 'price' => 7.00,  'stock_quantity' => 100],
    ['name' => 'Intermediate Pad',        'category' => 'School Supplies','barcode' => '005', 'price' => 25.00, 'stock_quantity' => 60],
    ['name' => 'Tide Powder 500g',        'category' => 'Household',      'barcode' => '006', 'price' => 42.00, 'stock_quantity' => 35],
    ['name' => 'Colgate Toothpaste',      'category' => 'Household',      'barcode' => '007', 'price' => 59.00, 'stock_quantity' => 25],
    ['name' => 'Globe Prepaid Load 50',   'category' => 'Others',         'barcode' => '008', 'price' => 50.00, 'stock_quantity' => 200],
];

        foreach ($products as $p) {
            Product::create($p);
        }
    }
}
