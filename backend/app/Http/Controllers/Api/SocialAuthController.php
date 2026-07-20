<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    public function redirect($provider)
    {
        if (!in_array($provider, ['google', 'github'])) {
            return response()->json(['error' => 'Provider not supported'], 422);
        }

        try {
            $redirectUrl = \Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
            return response()->json(['redirect_url' => $redirectUrl]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Socialite not configured: ' . $e->getMessage()], 500);
        }
    }

    public function callback(Request $request, $provider)
    {
        if (!in_array($provider, ['google', 'github'])) {
            return response()->json(['error' => 'Provider not supported'], 422);
        }

        try {
            $socialUser = \Socialite::driver($provider)->stateless()->user();

            $user = User::updateOrCreate(
                ['email' => $socialUser->getEmail()],
                [
                    'name' => $socialUser->getName() ?: $socialUser->getNickname(),
                    'password' => Hash::make(Str::random(24)),
                    'is_active' => true,
                ]
            );

            if (!$user->hasAnyRole(['Walidata', 'Admin Diskominfo', 'Super Admin'])) {
                $user->syncRoles(['Walidata']);
            }

            $token = $user->createToken('social-login')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => $user->load('roles'),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Gagal login dengan ' . $provider . ': ' . $e->getMessage()], 500);
        }
    }
}
