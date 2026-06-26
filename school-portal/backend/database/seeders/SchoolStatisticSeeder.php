<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SchoolStatistic;
use Illuminate\Database\Seeder;

class SchoolStatisticSeeder extends Seeder
{
    public function run(): void
    {
        $stats = [
            ['key' => 'students_count',   'label' => 'Students',          'value' => '1200', 'unit' => 'students',  'icon' => 'users',       'sort_order' => 1],
            ['key' => 'teachers_count',   'label' => 'Teachers',          'value' => '68',   'unit' => 'teachers',  'icon' => 'graduation',  'sort_order' => 2],
            ['key' => 'classes_count',    'label' => 'Classes',           'value' => '42',   'unit' => 'classes',   'icon' => 'building',    'sort_order' => 3],
            ['key' => 'years_operating',  'label' => 'Years of Excellence','value' => '59',  'unit' => 'years',     'icon' => 'calendar',    'sort_order' => 4],
            ['key' => 'olympiad_winners', 'label' => 'Olympiad Winners',  'value' => '340',  'unit' => 'awards',    'icon' => 'trophy',      'sort_order' => 5],
            ['key' => 'graduates',        'label' => 'Graduates',         'value' => '8500', 'unit' => 'graduates', 'icon' => 'diploma',     'sort_order' => 6],
        ];

        foreach ($stats as $stat) {
            SchoolStatistic::updateOrCreate(['key' => $stat['key']], array_merge($stat, ['is_visible' => true]));
        }
    }
}
