<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        return response()->json(Setting::pluck('value', 'key'));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'cert_verify_url' => ['required', 'url'],
        ]);

        Setting::updateOrCreate(['key' => 'cert_verify_url'], ['value' => $data['cert_verify_url']]);

        return response()->json(['message' => 'Pengaturan berhasil disimpan']);
    }
}
