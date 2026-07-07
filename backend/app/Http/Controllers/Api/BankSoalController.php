<?php

namespace App\Http\Controllers\Api;

use App\Models\BankSoal;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;

class BankSoalController extends CrudController
{
    protected array $with = ['kompetensi', 'level', 'creator'];

    protected array $searchable = ['pertanyaan', 'pembahasan'];

    protected array $filterable = ['kompetensi_id', 'level_id', 'jenis', 'is_active', 'created_by'];

    protected array $sortable = ['id', 'bobot', 'created_at', 'updated_at'];

    protected function modelClass(): string
    {
        return BankSoal::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['kompetensi_id' => ['required', 'exists:kompetensis,id'], 'level_id' => ['nullable', 'exists:levels,id'], 'jenis' => ['required', Rule::in(['pilihan_ganda', 'essay'])], 'pertanyaan' => ['required', 'string'], 'pilihan' => ['nullable', 'array'], 'jawaban_benar' => ['nullable', 'string'], 'pembahasan' => ['nullable', 'string'], 'bobot' => ['required', 'numeric', 'min:0'], 'is_active' => ['boolean']];
    }

    public function preview($id)
    {
        return response()->json(BankSoal::with($this->with)->findOrFail($id));
    }

    public function export(Request $request)
    {
        $data = BankSoal::query()->get();
        if ($request->query('format') === 'csv') {
            $csv = implode(',', ['id', 'kompetensi_id', 'level_id', 'jenis', 'pertanyaan', 'jawaban_benar', 'bobot'])."\n";
            foreach ($data as $row) {
                $csv .= implode(',', array_map(fn ($v) => '"'.str_replace('"', '""', (string) $v).'"', [$row->id, $row->kompetensi_id, $row->level_id, $row->jenis, $row->pertanyaan, $row->jawaban_benar, $row->bobot]))."\n";
            }

            return Response::make($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename=bank-soal.csv']);
        }

        return response()->json($data);
    }

    public function import(Request $request)
    {
        $rows = $request->validate(['items' => ['required', 'array'], 'items.*.kompetensi_id' => ['required', 'exists:kompetensis,id'], 'items.*.level_id' => ['required', 'exists:levels,id'], 'items.*.jenis' => ['required'], 'items.*.pertanyaan' => ['required'], 'items.*.bobot' => ['required', 'numeric']])['items'];
        foreach ($rows as $row) {
            BankSoal::create($row + ['created_by' => $request->user()?->id]);
        }

        return response()->json(['imported' => count($rows)]);
    }
}
