<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class ArrayExport
{
    public function __construct(public Collection|array $rows) {}
}
