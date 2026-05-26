<?php

namespace Database\Seeders;

use App\Models\RoleTag;
use Illuminate\Database\Seeder;

class RoleTagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleTags = [
            [
                'key' => 'lead',
                'name' => '初手要員',
                'description' => '最初に出しやすく、最低限の仕事ができるポケモンです。',
                'examples' => [
                    '多くの相手に等倍以上で攻撃できる',
                    'ステルスロックやでんじはなどで仕事ができる',
                    '不利でも交代技で逃げられる',
                    'きあいのタスキで行動保証がある',
                ],
                'lead_score' => 5,
                'switch_score' => 0,
                'finisher_score' => 0,
            ],
            [
                'key' => 'field_setup',
                'name' => '場作り',
                'description' => '後続の味方が動きやすい状況を作るポケモンです。',
                'examples' => [
                    'ステルスロックを持っている',
                    'リフレクター・ひかりのかべを持っている',
                    'あくび・でんじは・おにびを持っている',
                    '相手を削ったり、動きを制限できる',
                ],
                'lead_score' => 4,
                'switch_score' => 1,
                'finisher_score' => 0,
            ],
            [
                'key' => 'physical_attacker',
                'name' => '物理アタッカー',
                'description' => '攻撃の高さを使って相手を倒すポケモンです。',
                'examples' => [
                    'じしん、インファイト、アイアンヘッドなどの物理技が中心',
                    '攻撃が高い',
                    'こだわりハチマキを持つ',
                    'つるぎのまいを使う',
                ],
                'lead_score' => 1,
                'switch_score' => 0,
                'finisher_score' => 3,
            ],
            [
                'key' => 'special_attacker',
                'name' => '特殊アタッカー',
                'description' => '特攻の高さを使って相手を倒すポケモンです。',
                'examples' => [
                    'シャドーボール、ムーンフォース、ハイドロポンプなどの特殊技が中心',
                    '特攻が高い',
                    'こだわりメガネを持つ',
                    'わるだくみ・めいそうを使う',
                ],
                'lead_score' => 1,
                'switch_score' => 0,
                'finisher_score' => 3,
            ],
            [
                'key' => 'physical_wall',
                'name' => '物理受け',
                'description' => '相手の物理技を受けるためのポケモンです。',
                'examples' => [
                    '防御が高い',
                    'HPと防御に努力値を振っている',
                    'おにびやいかくで物理火力を下げられる',
                    '回復技を持っている',
                ],
                'lead_score' => 0,
                'switch_score' => 4,
                'finisher_score' => 0,
            ],
            [
                'key' => 'special_wall',
                'name' => '特殊受け',
                'description' => '相手の特殊技を受けるためのポケモンです。',
                'examples' => [
                    '特防が高い',
                    'HPと特防に努力値を振っている',
                    'とつげきチョッキを持つ',
                    '回復技を持っている',
                ],
                'lead_score' => 0,
                'switch_score' => 4,
                'finisher_score' => 0,
            ],
            [
                'key' => 'pivot',
                'name' => 'クッション',
                'description' => '不利な対面で一度受けて、味方につなぐポケモンです。',
                'examples' => [
                    'とんぼがえり、ボルトチェンジ、クイックターンを持っている',
                    '回復技を持っている',
                    '一撃で倒されにくい',
                    '状態異常技で相手をごまかせる',
                ],
                'lead_score' => 1,
                'switch_score' => 5,
                'finisher_score' => 0,
            ],
            [
                'key' => 'finisher',
                'name' => '終盤エース',
                'description' => '相手が削れた後に、最後に倒し切るポケモンです。',
                'examples' => [
                    '素早さが高い',
                    '火力が高い',
                    '積み技を持っている',
                    '先制技やスカーフで上から倒せる',
                ],
                'lead_score' => 0,
                'switch_score' => 0,
                'finisher_score' => 5,
            ],
            [
                'key' => 'breaker',
                'name' => '崩し役',
                'description' => '耐久が高い相手や受けポケモンを崩すためのポケモンです。',
                'examples' => [
                    '高火力技を持っている',
                    'ちょうはつ、アンコール、トリックを持っている',
                    'どくどく、やどりぎのタネなどで削れる',
                    '積み技で受けを崩せる',
                ],
                'lead_score' => 1,
                'switch_score' => 1,
                'finisher_score' => 3,
            ],
            [
                'key' => 'priority',
                'name' => '先制技持ち',
                'description' => '相手より先に攻撃できる技で、最後の削りを狙えるポケモンです。',
                'examples' => [
                    'しんそくを持っている',
                    'バレットパンチを持っている',
                    'アクアジェットを持っている',
                    'ふいうちを持っている',
                ],
                'lead_score' => 1,
                'switch_score' => 0,
                'finisher_score' => 3,
            ],
            [
                'key' => 'setup_sweeper',
                'name' => '積みエース',
                'description' => '能力を上げてから一気に相手を倒すポケモンです。',
                'examples' => [
                    'つるぎのまいを持っている',
                    'りゅうのまいを持っている',
                    'わるだくみを持っている',
                    'めいそうを持っている',
                ],
                'lead_score' => 0,
                'switch_score' => 1,
                'finisher_score' => 4,
            ],
            [
                'key' => 'support',
                'name' => 'サポート',
                'description' => '直接倒すよりも、味方が戦いやすい状況を作るポケモンです。',
                'examples' => [
                    'でんじは、おにび、どくどくを持っている',
                    'アンコール、ちょうはつを持っている',
                    'ねがいごと、いやしのねがいを持っている',
                    'トリックやはたきおとすで妨害できる',
                ],
                'lead_score' => 2,
                'switch_score' => 1,
                'finisher_score' => 0,
            ],
            [
                'key' => 'switch_move',
                'name' => '交代技持ち',
                'description' => '攻撃しながら味方に交代できるポケモンです。',
                'examples' => [
                    'とんぼがえりを持っている',
                    'ボルトチェンジを持っている',
                    'クイックターンを持っている',
                    '不利対面でも味方につなげられる',
                ],
                'lead_score' => 3,
                'switch_score' => 3,
                'finisher_score' => 0,
            ],
            [
                'key' => 'recovery',
                'name' => '回復持ち',
                'description' => '回復技で長く戦えるポケモンです。',
                'examples' => [
                    'じこさいせいを持っている',
                    'はねやすめを持っている',
                    'ねがいごとを持っている',
                    'ドレイン系の技で回復できる',
                ],
                'lead_score' => 0,
                'switch_score' => 3,
                'finisher_score' => 0,
            ],
        ];

        foreach ($roleTags as $roleTag) {
            RoleTag::updateOrCreate(
                ['key' => $roleTag['key']],
                $roleTag
            );
        }
    }
}
