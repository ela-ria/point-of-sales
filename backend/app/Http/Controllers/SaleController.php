<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\CancelSale;
use App\Models\PostVoidSale;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function index()
    {
        $sales = Sale::with(['cashier:id,name', 'activeItems.product'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($sales);
    }

    public function store(Request $request)
    {
        $sale = Sale::create([
            'cashier_id'      => $request->user()->id,
            'status'          => 'pending',
            'discount_type'   => 'none',
            'discount_amount' => 0,
            'subtotal'        => 0,
            'total'           => 0,
        ]);
        return response()->json($sale, 201);
    }

    public function show($id)
    {
        $sale = Sale::with([
            'cashier:id,name',
            'items.product',
            'cancelRecord.cashier:id,name',
            'postVoidRecord.supervisor:id,name',
        ])->findOrFail($id);
        return response()->json($sale);
    }

    public function addItem(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        if ($sale->status !== 'pending') {
            return response()->json(['message' => 'Cannot add items to a non-pending sale.'], 422);
        }
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);
        $product = Product::findOrFail($data['product_id']);
        if (!$product->is_active) {
            return response()->json(['message' => 'Product is deactivated.'], 422);
        }
        if ($product->stock_quantity < $data['quantity']) {
            return response()->json(['message' => 'Insufficient stock.'], 422);
        }
        $item = SaleItem::create([
            'sale_id'    => $sale->id,
            'product_id' => $product->id,
            'quantity'   => $data['quantity'],
            'unit_price' => $product->price,
            'subtotal'   => round($product->price * $data['quantity'], 2),
            'is_voided'  => false,
        ]);
        $sale->recalculate();
        return response()->json([
            'item' => $item->load('product'),
            'sale' => $sale->fresh(),
        ], 201);
    }

    public function voidItem(Request $request, $saleId, $itemId)
    {
        $sale = Sale::findOrFail($saleId);
        if ($sale->status !== 'pending') {
            return response()->json(['message' => 'Cannot void items on a non-pending sale.'], 422);
        }
        $item = SaleItem::where('sale_id', $saleId)->findOrFail($itemId);
        if ($item->is_voided) {
            return response()->json(['message' => 'Item is already voided.'], 422);
        }
        $item->update(['is_voided' => true]);
        $sale->recalculate();
        return response()->json([
            'message' => 'Item voided.',
            'sale'    => $sale->fresh()->load('items.product'),
        ]);
    }

    public function applyDiscount(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        if ($sale->status !== 'pending') {
            return response()->json(['message' => 'Sale is not active.'], 422);
        }
        $data = $request->validate([
            'discount_type' => 'required|in:none,senior_citizen,pwd,athlete,solo_parent',
        ]);
        $sale->update(['discount_type' => $data['discount_type']]);
        $sale->recalculate();
        return response()->json($sale->fresh()->load('items.product'));
    }

    public function complete(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        if ($sale->status !== 'pending') {
            return response()->json(['message' => 'Sale is not active.'], 422);
        }
        if ($sale->activeItems()->count() === 0) {
            return response()->json(['message' => 'Cannot complete a sale with no items.'], 422);
        }
        foreach ($sale->activeItems as $item) {
            $item->product->decrement('stock_quantity', $item->quantity);
        }
        $sale->update(['status' => 'completed']);
        return response()->json($sale->fresh()->load(['items.product', 'cashier:id,name']));
    }

    public function cancel(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        if ($sale->status !== 'pending') {
            return response()->json(['message' => 'Only pending sales can be cancelled.'], 422);
        }
        $sale->update(['status' => 'cancelled']);
        CancelSale::create([
            'sale_id'    => $sale->id,
            'cashier_id' => $request->user()->id,
            'reason'     => $request->get('reason'),
        ]);
        return response()->json(['message' => 'Sale cancelled and logged.']);
    }

    public function postVoid(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        if ($sale->status !== 'completed') {
            return response()->json(['message' => 'Only completed sales can be post-voided.'], 422);
        }
        $data = $request->validate([
            'reason' => 'required|string|max:500',
        ]);
        foreach ($sale->activeItems as $item) {
            $item->product->increment('stock_quantity', $item->quantity);
        }
        $sale->update(['status' => 'voided']);
        PostVoidSale::create([
            'sale_id'       => $sale->id,
            'supervisor_id' => $request->user()->id,
            'reason'        => $data['reason'],
        ]);
        return response()->json(['message' => 'Sale post-voided. Stock restored. Logged.']);
    }

    public function voidedSales()
    {
        $sales = Sale::with(['cashier:id,name', 'postVoidRecord.supervisor:id,name'])
            ->where('status', 'voided')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($sales);
    }

    public function cancelledSales()
    {
        $sales = Sale::with(['cashier:id,name', 'cancelRecord.cashier:id,name'])
            ->where('status', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($sales);
    }
}
