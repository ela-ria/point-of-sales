<?php


namespace App\Http\Controllers;


use App\Models\User;
use Illuminate\Http\Request;


class UserController extends Controller
{
    // GET /api/users
    public function index()
    {
        return response()->json(User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')->get());
    }


    // POST /api/users
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:cashier,supervisor,admin',
            'is_active' => 'sometimes|boolean',
        ]);

        // Default to active if not specified
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $data['password'] = bcrypt($data['password']);
        $user = User::create($data);


        return response()->json($user->only('id', 'name', 'email', 'role', 'is_active'), 201);
    }


    // PUT /api/users/{id}
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);


        $data = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|email|unique:users,email,' . $id,
            'password'  => 'sometimes|string|min:6',
            'role'      => 'sometimes|in:cashier,supervisor,admin',
            'is_active' => 'sometimes|boolean',
        ]);


        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }


        $user->update($data);
        return response()->json($user->only('id', 'name', 'email', 'role', 'is_active'));
    }


    // DELETE /api/users/{id} - soft delete by deactivating
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => false]);
        return response()->json(['message' => 'User deactivated successfully.']);
    }
}
