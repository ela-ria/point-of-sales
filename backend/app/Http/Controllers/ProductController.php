<?php


namespace App\Http\Controllers;


use App\Models\Product;
use Illuminate\Http\Request;


class ProductController extends Controller
{
    // GET /api/products - admin sees all (including inactive), cashier sees only active
    public function index()
    {
        return response()->json(Product::orderBy('name')->get());
    }


    // GET /api/products/search?q=barcode_or_name
    public function search(Request $request)
    {
        $q = $request->get('q', '');


        $products = Product::active()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('barcode', $q);
            })
            ->get();


        return response()->json($products);
    }


    // GET /api/products/{id}
    public function show($id)
    {
        return response()->json(Product::findOrFail($id));
    }


    // POST /api/products
    public function store(Request $request)
    {
        $data = $request->validate([
    'name'           => 'required|string|max:255',
    'category'       => 'nullable|string|max:100',
    'barcode'        => 'required|string|unique:products',
    'price'          => 'required|numeric|min:0',
    'stock_quantity' => 'required|integer|min:0',
    'is_active'      => 'sometimes|boolean',
]);

        // Default to active if not specified
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $product = Product::create($data);
        return response()->json($product, 201);
    }


    // PUT /api/products/{id}
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);


       $data = $request->validate([
    'name'           => 'sometimes|string|max:255',
    'category'       => 'sometimes|nullable|string|max:100',
    'barcode'        => 'sometimes|string|unique:products,barcode,' . $id,
    'price'          => 'sometimes|numeric|min:0',
    'stock_quantity' => 'sometimes|integer|min:0',
    'is_active'      => 'sometimes|boolean',
]);


        $product->update($data);
        return response()->json($product);
    }


    // PATCH /api/products/{id}/deactivate
    public function deactivate($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => false]);
        return response()->json($product);
    }
}
