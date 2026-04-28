<?php


namespace App\Http\Controllers;


use App\Models\Sale;
use Illuminate\Http\Request;


class ReceiptController extends Controller
{
    // GET /api/sales/{id}/receipt
    // GET /api/sales/{id}/receipt?reprint=true
    public function show(Request $request, $id)
    {
        $sale = Sale::with([
            'items' => fn($q) => $q->where('is_voided', false)->with('product'),
            'cashier:id,name',
            'postVoidRecord.supervisor:id,name',
        ])->findOrFail($id);


        if (!in_array($sale->status, ['completed', 'voided'])) {
            return response()->json([
                'message' => 'Receipt is only available for completed or voided sales.',
            ], 422);
        }


        $isReprint = filter_var($request->get('reprint', false), FILTER_VALIDATE_BOOLEAN);


        return response()->json([
            'store_name'    => 'SariPh Retail Store',
            'store_address' => 'Majayjay, Laguna',
            'is_reprint'    => $isReprint,
            'printed_at'    => now()->toDateTimeString(),
            'sale'          => $sale,
        ]);
    }
}
