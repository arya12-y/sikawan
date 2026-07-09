<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bidang;
use App\Models\Jabatan;
use App\Models\Opd;
use App\Models\User;
use App\Models\Walidata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        if (! $user) {
            return response()->json(['message' => 'Email tidak terdaftar'], 422);
        }

        if (! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Password salah'], 422);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Akun belum aktif atau menunggu verifikasi admin'], 422);
        }

        return response()->json(['message' => 'Login berhasil', 'token' => $user->createToken($data['device_name'] ?? $request->userAgent() ?? 'api')->plainTextToken, 'user' => $this->userPayload($user)]);
    }

    public function register(Request $request)
    {
        $data = Validator::make($request->all(), [
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()->symbols()],
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['required', 'string', 'max:20'],
            'jabatan' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'tingkat_instansi' => ['required', 'string', 'max:100'],
            'nama_instansi' => ['required', 'string', 'max:255'],
            'nama_bidang' => ['required', 'string', 'max:255'],
            'alamat_kantor' => ['required', 'string'],
            'sk_walidata' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
        ])->validate();

        $skPath = $request->file('sk_walidata')->store('registrasi-walidata', 'public');

        $user = DB::transaction(function () use ($data, $skPath) {
            $opd = Opd::firstOrCreate(
                ['nama' => $data['nama_instansi']],
                ['kode' => 'REG'.str_pad((string) ((Opd::withTrashed()->count() ?? 0) + 1), 4, '0', STR_PAD_LEFT), 'singkatan' => null, 'alamat' => $data['alamat_kantor'], 'is_active' => true]
            );

            $bidang = Bidang::firstOrCreate(
                ['opd_id' => $opd->id, 'nama' => $data['nama_bidang']],
                ['deskripsi' => $data['tingkat_instansi'], 'is_active' => true]
            );

            $jabatan = Jabatan::firstOrCreate(
                ['nama' => $data['jabatan']],
                ['deskripsi' => null, 'level' => 0, 'is_active' => true]
            );

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'nip' => $data['nip'],
                'phone' => $data['phone'],
                'address' => $data['alamat_kantor']."\nSK Wali Data: ".$skPath,
                'password' => Hash::make($data['password']),
                'is_active' => false,
            ]);

            $user->assignRole('Walidata');

            Walidata::create([
                'user_id' => $user->id,
                'opd_id' => $opd->id,
                'bidang_id' => $bidang->id,
                'jabatan_id' => $jabatan->id,
                'nip' => $data['nip'],
                'nilai_kompetensi' => 0,
                'is_active' => false,
            ]);

            return $user;
        });

        return response()->json(['message' => 'Pendaftaran berhasil dikirim dan menunggu verifikasi admin', 'user' => $this->userPayload($user)], 201);
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
