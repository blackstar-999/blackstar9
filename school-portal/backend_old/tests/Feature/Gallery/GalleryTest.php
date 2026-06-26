<?php

declare(strict_types=1);

namespace Tests\Feature\Gallery;

use App\Enums\GalleryStatus;
use App\Enums\Role;
use App\Models\GalleryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GalleryTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_sees_only_approved_items(): void
    {
        GalleryItem::factory(5)->create(['status' => GalleryStatus::Approved, 'uploaded_by' => User::factory()]);
        GalleryItem::factory(3)->create(['status' => GalleryStatus::Pending, 'uploaded_by' => User::factory()]);

        $this->getJson('/api/v1/public/gallery')
             ->assertOk()
             ->assertJsonCount(5, 'data');
    }

    public function test_authenticated_user_can_upload(): void
    {
        Storage::fake('local');
        $user = User::factory()->verified()->create();

        $this->actingAs($user)
             ->postJson('/api/v1/gallery', ['image' => UploadedFile::fake()->image('p.jpg'), 'caption' => 'Test'])
             ->assertCreated();

        $this->assertDatabaseHas('gallery_items', ['uploaded_by' => $user->id, 'status' => GalleryStatus::Pending->value]);
    }

    public function test_user_can_toggle_like(): void
    {
        $user = User::factory()->verified()->create();
        $item = GalleryItem::factory()->create(['status' => GalleryStatus::Approved, 'likes_count' => 0, 'uploaded_by' => User::factory()]);

        $this->actingAs($user)->postJson("/api/v1/gallery/{$item->id}/like")->assertJsonPath('liked', true);
        $this->actingAs($user)->postJson("/api/v1/gallery/{$item->id}/like")->assertJsonPath('liked', false);
    }

    public function test_admin_can_approve_item(): void
    {
        $admin = User::factory()->verified()->admin()->create();
        $item  = GalleryItem::factory()->create(['status' => GalleryStatus::Pending, 'uploaded_by' => User::factory()]);

        $this->actingAs($admin)
             ->postJson("/api/v1/admin/gallery/{$item->id}/approve")
             ->assertOk();

        $this->assertDatabaseHas('gallery_items', ['id' => $item->id, 'status' => GalleryStatus::Approved->value]);
    }
}
