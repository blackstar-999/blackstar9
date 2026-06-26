<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // School info (public)
            ['key' => 'school_name',       'value' => 'Maktab № 1',         'type' => 'string',  'group' => 'school',   'is_public' => true,  'description' => 'School name'],
            ['key' => 'school_founded',    'value' => '1965',               'type' => 'string',  'group' => 'school',   'is_public' => true,  'description' => 'Year founded'],
            ['key' => 'school_motto',      'value' => 'Bilim — kuch!',       'type' => 'string',  'group' => 'school',   'is_public' => true,  'description' => 'School motto'],
            ['key' => 'school_director',   'value' => 'Abdullayev Bobur',    'type' => 'string',  'group' => 'school',   'is_public' => true,  'description' => 'Director name'],
            // Contact (public)
            ['key' => 'contact_address',   'value' => "Toshkent, O'zbekiston",'type' => 'string', 'group' => 'contact',  'is_public' => true,  'description' => 'Address'],
            ['key' => 'contact_phone',     'value' => '+998 71 123 45 67',   'type' => 'string',  'group' => 'contact',  'is_public' => true,  'description' => 'Phone'],
            ['key' => 'contact_email',     'value' => 'info@maktab1.uz',     'type' => 'string',  'group' => 'contact',  'is_public' => true,  'description' => 'Email'],
            ['key' => 'contact_lat',       'value' => '41.2995',             'type' => 'string',  'group' => 'contact',  'is_public' => true,  'description' => 'Map latitude'],
            ['key' => 'contact_lng',       'value' => '69.2401',             'type' => 'string',  'group' => 'contact',  'is_public' => true,  'description' => 'Map longitude'],
            // System (private)
            ['key' => 'maintenance_mode',  'value' => 'false',              'type' => 'boolean', 'group' => 'system',   'is_public' => false, 'description' => 'Maintenance mode'],
            ['key' => 'registration_open', 'value' => 'false',              'type' => 'boolean', 'group' => 'system',   'is_public' => false, 'description' => 'Allow new registrations'],
            ['key' => 'academic_year',     'value' => '2024-2025',          'type' => 'string',  'group' => 'system',   'is_public' => true,  'description' => 'Current academic year'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
