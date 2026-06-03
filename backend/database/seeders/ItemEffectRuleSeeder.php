<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\ItemEffectRule;
use Illuminate\Database\Seeder;
use RuntimeException;

class ItemEffectRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            /*
            |--------------------------------------------------------------------------
            | 素早さ補正
            |--------------------------------------------------------------------------
            */
            [
                'item_key' => 'choice-scarf',
                'key' => 'choice-scarf-speed-multiplier',
                'effect_type' => 'speed_multiplier',
                'target_type' => null,
                'value' => 1.5,
                'condition' => null,
                'description' => '素早さを1.5倍として評価します。',
            ],

            /*
            |--------------------------------------------------------------------------
            | 効果抜群技を軽減するきのみ
            |--------------------------------------------------------------------------
            */
            [
                'item_key' => 'occa-berry',
                'key' => 'occa-berry-fire-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'ほのお',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のほのお技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'passho-berry',
                'key' => 'passho-berry-water-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'みず',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のみず技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'wacan-berry',
                'key' => 'wacan-berry-electric-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'でんき',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のでんき技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'rindo-berry',
                'key' => 'rindo-berry-grass-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'くさ',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のくさ技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'yache-berry',
                'key' => 'yache-berry-ice-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'こおり',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のこおり技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'chople-berry',
                'key' => 'chople-berry-fighting-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'かくとう',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のかくとう技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'kebia-berry',
                'key' => 'kebia-berry-poison-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'どく',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のどく技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'shuca-berry',
                'key' => 'shuca-berry-ground-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'じめん',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のじめん技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'coba-berry',
                'key' => 'coba-berry-flying-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'ひこう',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のひこう技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'payapa-berry',
                'key' => 'payapa-berry-psychic-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'エスパー',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のエスパー技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'tanga-berry',
                'key' => 'tanga-berry-bug-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'むし',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のむし技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'charti-berry',
                'key' => 'charti-berry-rock-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'いわ',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のいわ技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'kasib-berry',
                'key' => 'kasib-berry-ghost-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'ゴースト',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のゴースト技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'haban-berry',
                'key' => 'haban-berry-dragon-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'ドラゴン',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のドラゴン技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'colbur-berry',
                'key' => 'colbur-berry-dark-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'あく',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のあく技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'babiri-berry',
                'key' => 'babiri-berry-steel-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'はがね',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のはがね技を受ける時にダメージを半減します。',
            ],
            [
                'item_key' => 'roseli-berry',
                'key' => 'roseli-berry-fairy-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'フェアリー',
                'value' => 0.5,
                'condition' => 'super_effective_only',
                'description' => '効果抜群のフェアリー技を受ける時にダメージを半減します。',
            ],

            /*
            |--------------------------------------------------------------------------
            | ノーマル技を軽減するきのみ
            |--------------------------------------------------------------------------
            */
            [
                'item_key' => 'chilan-berry',
                'key' => 'chilan-berry-normal-reduction',
                'effect_type' => 'reduce_type_damage',
                'target_type' => 'ノーマル',
                'value' => 0.5,
                'condition' => 'always',
                'description' => 'ノーマルタイプの技を受ける時にダメージを半減します。',
            ],

            /*
            |--------------------------------------------------------------------------
            | 注意情報として扱う持ち物
            |--------------------------------------------------------------------------
            */
            [
                'item_key' => 'focus-sash',
                'key' => 'focus-sash-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'full_hp_only',
                'description' => 'HP満タン時は、一撃で倒せない可能性があります。',
            ],
            [
                'item_key' => 'leftovers',
                'key' => 'leftovers-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'end_of_turn',
                'description' => '毎ターンHPを回復する可能性があります。',
            ],
            [
                'item_key' => 'sitrus-berry',
                'key' => 'sitrus-berry-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'low_hp',
                'description' => 'HPが減った時に回復する可能性があります。',
            ],
            [
                'item_key' => 'lum-berry',
                'key' => 'lum-berry-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'status_condition',
                'description' => '状態異常を回復する可能性があります。',
            ],
            [
                'item_key' => 'white-herb',
                'key' => 'white-herb-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'stat_drop',
                'description' => '下がった能力を元に戻す可能性があります。',
            ],
        ];

        foreach ($rules as $rule) {
            $itemId = $this->findItemId($rule['item_key']);

            ItemEffectRule::updateOrCreate(
                [
                    'key' => $rule['key'],
                ],
                [
                    'item_id' => $itemId,
                    'effect_type' => $rule['effect_type'],
                    'target_type' => $rule['target_type'],
                    'value' => $rule['value'],
                    'condition' => $rule['condition'],
                    'description' => $rule['description'],
                ],
            );
        }
    }

    private function findItemId(string $itemKey): int
    {
        $item = Item::query()
            ->where('key', $itemKey)
            ->first();

        if (! $item) {
            throw new RuntimeException(
                "持ち物マスターが見つかりません: {$itemKey}",
            );
        }

        return $item->id;
    }
}
