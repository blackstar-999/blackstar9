<?php

declare(strict_types=1);

namespace Tests\Feature\Chat;

use App\Enums\ConversationType;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    private function makeConversation(User $a, User $b): Conversation
    {
        $conv = Conversation::create(['type' => ConversationType::Direct, 'created_by' => $a->id]);
        $conv->participants()->attach([$a->id, $b->id]);
        return $conv;
    }

    public function test_participant_can_send_message(): void
    {
        $sender = User::factory()->verified()->create();
        $recv   = User::factory()->verified()->create();
        $conv   = $this->makeConversation($sender, $recv);

        $this->actingAs($sender)
             ->postJson('/api/v1/chat/messages', ['conversation_id' => $conv->id, 'body' => 'Hello!'])
             ->assertCreated()->assertJsonPath('message.body', 'Hello!');
    }

    public function test_non_participant_cannot_send_message(): void
    {
        $a = User::factory()->verified()->create();
        $b = User::factory()->verified()->create();
        $outsider = User::factory()->verified()->create();
        $conv = $this->makeConversation($a, $b);

        $this->actingAs($outsider)
             ->postJson('/api/v1/chat/messages', ['conversation_id' => $conv->id, 'body' => 'Hack!'])
             ->assertForbidden();
    }

    public function test_sender_can_edit_own_message(): void
    {
        $sender = User::factory()->verified()->create();
        $recv   = User::factory()->verified()->create();
        $conv   = $this->makeConversation($sender, $recv);
        $msg    = Message::create(['conversation_id' => $conv->id, 'sender_id' => $sender->id, 'body' => 'Original', 'status' => 'sent']);

        $this->actingAs($sender)
             ->putJson("/api/v1/chat/messages/{$msg->id}", ['body' => 'Edited!'])
             ->assertOk()->assertJsonPath('message.body', 'Edited!');
    }

    public function test_other_user_cannot_edit_message(): void
    {
        $sender = User::factory()->verified()->create();
        $recv   = User::factory()->verified()->create();
        $conv   = $this->makeConversation($sender, $recv);
        $msg    = Message::create(['conversation_id' => $conv->id, 'sender_id' => $sender->id, 'body' => 'Original', 'status' => 'sent']);

        $this->actingAs($recv)
             ->putJson("/api/v1/chat/messages/{$msg->id}", ['body' => 'Hacked!'])
             ->assertForbidden();
    }

    public function test_sender_can_delete_own_message(): void
    {
        $sender = User::factory()->verified()->create();
        $recv   = User::factory()->verified()->create();
        $conv   = $this->makeConversation($sender, $recv);
        $msg    = Message::create(['conversation_id' => $conv->id, 'sender_id' => $sender->id, 'body' => 'Delete me', 'status' => 'sent']);

        $this->actingAs($sender)->deleteJson("/api/v1/chat/messages/{$msg->id}")->assertOk();
        $this->assertDatabaseHas('messages', ['id' => $msg->id, 'status' => 'deleted']);
    }
}
