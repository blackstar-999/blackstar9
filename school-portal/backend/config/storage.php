<?php

return [
    'gallery_max'     => env('STORAGE_GALLERY_MAX',     5 * 1024 * 1024),   // 5MB
    'chat_max'        => env('STORAGE_CHAT_MAX',        15 * 1024 * 1024),  // 15MB
    'library_max'     => env('STORAGE_LIBRARY_MAX',     50 * 1024 * 1024),  // 50MB
    'certificate_max' => env('STORAGE_CERTIFICATE_MAX', 5 * 1024 * 1024),   // 5MB
];
