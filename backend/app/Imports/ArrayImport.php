<?php

namespace App\Imports;

class ArrayImport
{
    public array $rows = [];

    public function collection($rows): void
    {
        $this->rows = $rows->toArray();
    }
}
