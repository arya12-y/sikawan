<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = Validator::make($request->all(), ['email' => ['required', 'email'], 'password' => ['required'], 'device_name' => ['nullable', 'string']])->validate();
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password) || ! $user->is_active) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        return response()->json(['token' => $user->createToken($data['device_name'] ?? $request->userAgent() ?? 'api')->plainTextToken, 'user' => $this->userPayload($user)]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($this->userPayload($request->user()));
    }

    public function forgotPassword(Request $request)
    {
        $data = Validator::make($request->all(), ['email' => ['required', 'email']])->validate();
        $status = Password::sendResetLink($data);

        return response()->json(['message' => __($status)], $status === Password::RESET_LINK_SENT ? 200 : 422);
    }

    public function resetPassword(Request $request)
    {
        $data = Validator::make($request->all(), ['token' => ['required'], 'email' => ['required', 'email'], 'password' => ['required', 'confirmed', PasswordRule::defaults()]])->validate();
        $status = Password::reset($data, fn ($user, $password) => $user->forceFill(['password' => Hash::make($password)])->save());

        return response()->json(['message' => __($status)], $status === Password::PASSWORD_RESET ? 200 : 422);
    }

    public function changePassword(Request $request)
    {
        $data = Validator::make($request->all(), ['current_password' => ['required'], 'password' => ['required', 'confirmed', PasswordRule::defaults()]])->validate();
        abort_unless(Hash::check($data['current_password'], $request->user()->password), 422, 'Invalid current password');
        $request->user()->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Password changed']);
    }

    public function updateProfile(Request $request)
    {
        $data = Validator::make($request->all(), ['name' => ['sometimes', 'string', 'max:255'], 'email' => ['sometimes', 'email', 'unique:users,email,'.$request->user()->id], 'nip' => ['nullable', 'string'], 'phone' => ['nullable', 'string'], 'address' => ['nullable', 'string'], 'photo' => ['nullable', 'string']])->validate();
        $request->user()->update($data);

        return response()->json($this->userPayload($request->user()->fresh()));
    }

    public function sessions(Request $request)
    {
        return response()->json($request->user()->tokens()->latest()->get());
    }

    private function userPayload(User $user): array
    {
        $user->loadMissing('roles.permissions', 'permissions');

        return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'nip' => $user->nip, 'phone' => $user->phone, 'address' => $user->address, 'photo' => $user->photo, 'roles' => $user->getRoleNames(), 'permissions' => $user->getAllPermissions()->pluck('name')->values()];
    }
}
