<?php

namespace Database\Seeders;

use App\Models\Ability;
use App\Models\AbilityEffectRule;
use Illuminate\Database\Seeder;
use RuntimeException;

class AbilityEffectRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            /*
            |--------------------------------------------------------------------------
            | タイプ無効特性
            |--------------------------------------------------------------------------
            */
            [
                'ability_key' => 'flash-fire',
                'key' => 'flash-fire-fire-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'ほのお',
                'value' => 0,
                'condition' => null,
                'description' => 'ほのおタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'well-baked-body',
                'key' => 'well-baked-body-fire-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'ほのお',
                'value' => 0,
                'condition' => null,
                'description' => 'ほのおタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'water-absorb',
                'key' => 'water-absorb-water-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'みず',
                'value' => 0,
                'condition' => null,
                'description' => 'みずタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'storm-drain',
                'key' => 'storm-drain-water-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'みず',
                'value' => 0,
                'condition' => null,
                'description' => 'みずタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'dry-skin',
                'key' => 'dry-skin-water-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'みず',
                'value' => 0,
                'condition' => null,
                'description' => 'みずタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'sap-sipper',
                'key' => 'sap-sipper-grass-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'くさ',
                'value' => 0,
                'condition' => null,
                'description' => 'くさタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'levitate',
                'key' => 'levitate-ground-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'じめん',
                'value' => 0,
                'condition' => null,
                'description' => 'じめんタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'earth-eater',
                'key' => 'earth-eater-ground-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'じめん',
                'value' => 0,
                'condition' => null,
                'description' => 'じめんタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'volt-absorb',
                'key' => 'volt-absorb-electric-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'でんき',
                'value' => 0,
                'condition' => null,
                'description' => 'でんきタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'lightning-rod',
                'key' => 'lightning-rod-electric-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'でんき',
                'value' => 0,
                'condition' => null,
                'description' => 'でんきタイプの技を無効にします。',
            ],
            [
                'ability_key' => 'motor-drive',
                'key' => 'motor-drive-electric-immunity',
                'effect_type' => 'type_immunity',
                'target_type' => 'でんき',
                'value' => 0,
                'condition' => null,
                'description' => 'でんきタイプの技を無効にします。',
            ],

            /*
            |--------------------------------------------------------------------------
            | タイプ耐性特性
            |--------------------------------------------------------------------------
            */
            [
                'ability_key' => 'thick-fat',
                'key' => 'thick-fat-fire-resistance',
                'effect_type' => 'type_resistance',
                'target_type' => 'ほのお',
                'value' => 0.5,
                'condition' => null,
                'description' => 'ほのおタイプの技によるダメージを半減します。',
            ],
            [
                'ability_key' => 'thick-fat',
                'key' => 'thick-fat-ice-resistance',
                'effect_type' => 'type_resistance',
                'target_type' => 'こおり',
                'value' => 0.5,
                'condition' => null,
                'description' => 'こおりタイプの技によるダメージを半減します。',
            ],
            [
                'ability_key' => 'heatproof',
                'key' => 'heatproof-fire-resistance',
                'effect_type' => 'type_resistance',
                'target_type' => 'ほのお',
                'value' => 0.5,
                'condition' => null,
                'description' => 'ほのおタイプの技によるダメージを半減します。',
            ],
            [
                'ability_key' => 'water-bubble',
                'key' => 'water-bubble-fire-resistance',
                'effect_type' => 'type_resistance',
                'target_type' => 'ほのお',
                'value' => 0.5,
                'condition' => null,
                'description' => 'ほのおタイプの技によるダメージを半減します。',
            ],
            [
                'ability_key' => 'purifying-salt',
                'key' => 'purifying-salt-ghost-resistance',
                'effect_type' => 'type_resistance',
                'target_type' => 'ゴースト',
                'value' => 0.5,
                'condition' => null,
                'description' => 'ゴーストタイプの技によるダメージを半減します。',
            ],

            /*
            |--------------------------------------------------------------------------
            | 効果抜群技の軽減
            |--------------------------------------------------------------------------
            */
            [
                'ability_key' => 'filter',
                'key' => 'filter-super-effective-reduction',
                'effect_type' => 'super_effective_damage_reduction',
                'target_type' => null,
                'value' => 0.75,
                'condition' => 'super_effective_only',
                'description' => '効果抜群の技によるダメージを4分の3にします。',
            ],
            [
                'ability_key' => 'solid-rock',
                'key' => 'solid-rock-super-effective-reduction',
                'effect_type' => 'super_effective_damage_reduction',
                'target_type' => null,
                'value' => 0.75,
                'condition' => 'super_effective_only',
                'description' => '効果抜群の技によるダメージを4分の3にします。',
            ],
            [
                'ability_key' => 'prism-armor',
                'key' => 'prism-armor-super-effective-reduction',
                'effect_type' => 'super_effective_damage_reduction',
                'target_type' => null,
                'value' => 0.75,
                'condition' => 'super_effective_only',
                'description' => '効果抜群の技によるダメージを4分の3にします。',
            ],

            /*
            |--------------------------------------------------------------------------
            | 注意情報として扱う特性
            |--------------------------------------------------------------------------
            */
            [
                'ability_key' => 'fluffy',
                'key' => 'fluffy-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'contact_move_and_fire_weakness',
                'description' => '接触技のダメージを半減します。ただし、ほのお技によるダメージが増えます。',
            ],
            [
                'ability_key' => 'multiscale',
                'key' => 'multiscale-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'full_hp_only',
                'description' => 'HP満タン時に受けるダメージを半減します。',
            ],
            [
                'ability_key' => 'shadow-shield',
                'key' => 'shadow-shield-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'full_hp_only',
                'description' => 'HP満タン時に受けるダメージを半減します。',
            ],
            [
                'ability_key' => 'fur-coat',
                'key' => 'fur-coat-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'physical_move_only',
                'description' => '物理技によるダメージを軽減します。',
            ],
            [
                'ability_key' => 'vessel-of-ruin',
                'key' => 'vessel-of-ruin-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => 0.75,
                'condition' => 'other_pokemon_special_attack',
                'description' => '自分以外のポケモンの特攻に影響します。',
            ],
            [
                'ability_key' => 'tablets-of-ruin',
                'key' => 'tablets-of-ruin-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => 0.75,
                'condition' => 'other_pokemon_attack',
                'description' => '自分以外のポケモンの攻撃に影響します。',
            ],
            [
                'ability_key' => 'beads-of-ruin',
                'key' => 'beads-of-ruin-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => 0.75,
                'condition' => 'other_pokemon_special_defense',
                'description' => '自分以外のポケモンの特防に影響します。',
            ],
            [
                'ability_key' => 'sword-of-ruin',
                'key' => 'sword-of-ruin-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => 0.75,
                'condition' => 'other_pokemon_defense',
                'description' => '自分以外のポケモンの防御に影響します。',
            ],
            [
                'ability_key' => 'intimidate',
                'key' => 'intimidate-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'on_entry',
                'description' => '場に出た時に相手の攻撃を下げる可能性があります。',
            ],
            [
                'ability_key' => 'mold-breaker',
                'key' => 'mold-breaker-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'ignore_defensive_ability',
                'description' => '一部の防御特性を無視して攻撃する可能性があります。',
            ],
            [
                'ability_key' => 'sturdy',
                'key' => 'sturdy-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'full_hp_only',
                'description' => 'HP満タン時に一撃で倒せない可能性があります。',
            ],
            [
                'ability_key' => 'disguise',
                'key' => 'disguise-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'first_hit',
                'description' => '最初の攻撃を軽減する可能性があります。',
            ],
            [
                'ability_key' => 'magic-bounce',
                'key' => 'magic-bounce-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'reflect_status_move',
                'description' => '一部の変化技を跳ね返す可能性があります。',
            ],
            [
                'ability_key' => 'unaware',
                'key' => 'unaware-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'ignore_stat_changes',
                'description' => '能力変化を無視する可能性があります。',
            ],
            [
                'ability_key' => 'prankster',
                'key' => 'prankster-warning',
                'effect_type' => 'warning_only',
                'target_type' => null,
                'value' => null,
                'condition' => 'status_move_priority',
                'description' => '変化技を先に使う可能性があります。',
            ],
        ];

        foreach ($rules as $rule) {
            $abilityId = $this->findAbilityId($rule['ability_key']);

            AbilityEffectRule::updateOrCreate(
                [
                    'key' => $rule['key'],
                ],
                [
                    'ability_id' => $abilityId,
                    'effect_type' => $rule['effect_type'],
                    'target_type' => $rule['target_type'],
                    'value' => $rule['value'],
                    'condition' => $rule['condition'],
                    'description' => $rule['description'],
                ],
            );
        }
    }

    private function findAbilityId(string $abilityKey): int
    {
        $ability = Ability::query()
            ->where('key', $abilityKey)
            ->first();

        if (! $ability) {
            throw new RuntimeException(
                "特性マスターが見つかりません: {$abilityKey}",
            );
        }

        return $ability->id;
    }
}
