<?php

return [
    'paths' => ['*'], // Izinkan SEMUA jalur, bukan cuma api/*
    'allowed_origins' => ['*'], // Izinkan semua domain
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // Set ke false dulu biar gak bentrok sama origin '*'
];
