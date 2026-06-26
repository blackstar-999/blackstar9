<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\GalleryStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GalleryItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'uploaded_by'  => User::factory(),
            'image_path'   => 'public/gallery/' . $this->faker->uuid() . '.jpg',
            'thumbnail_path' => null,
            'caption'      => $this->faker->sentence(),
            'album_name'   => $this->faker->randomElement(['Sports', 'Events', 'Science', null]),
            'status'       => GalleryStatus::Approved,
            'likes_count'  => $this->faker->numberBetween(0, 100),
            'file_size'    => $this->faker->numberBetween(100000, 5000000),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => GalleryStatus::Pending]);
    }
}
