<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PokemonCommonMoveResource;
use App\Models\Move;
use App\Models\PokemonCommonMove;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class PokemonCommonMoveController extends Controller
{
    private const RULES = ['main_series', 'champions'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $pokemonKey = $request->query('pokemon_key');
        $formKey = $request->query('form_key');
        $rule = $request->query('rule', 'main_series');

        $query = PokemonCommonMove::query()
            ->with('move')
            ->where('rule', in_array($rule, self::RULES, true) ? $rule : 'main_series')
            ->orderBy('usage_rank')
            ->orderBy('id');

        if ($pokemonKey) {
            $query->where('pokemon_key', $pokemonKey);
        }

        if ($formKey) {
            $query->where('form_key', $formKey);
        }

        return PokemonCommonMoveResource::collection($query->get());
    }

    public function store(Request $request): PokemonCommonMoveResource
    {
        $validated = $request->validate([
            'rule' => ['nullable', Rule::in(self::RULES)],
            'pokemon_key' => ['required', 'string', 'max:255'],
            'form_key' => ['required', 'string', 'max:255'],
            'move_id' => ['required', 'integer', 'exists:moves,id'],
            'usage_rank' => ['nullable', 'integer', 'min:1', 'max:99'],
            'memo' => ['nullable', 'string', 'max:255'],
        ]);

        $rule = $validated['rule'] ?? 'main_series';
        $usageRank = $validated['usage_rank'] ?? null;

        if (!$usageRank) {
            $usageRank = PokemonCommonMove::query()
                ->where('rule', $rule)
                ->where('pokemon_key', $validated['pokemon_key'])
                ->where('form_key', $validated['form_key'])
                ->max('usage_rank');

            $usageRank = $usageRank ? $usageRank + 1 : 1;
        }

        $commonMove = PokemonCommonMove::updateOrCreate(
            [
                'rule' => $rule,
                'pokemon_key' => $validated['pokemon_key'],
                'form_key' => $validated['form_key'],
                'move_id' => $validated['move_id'],
            ],
            [
                'usage_rank' => $usageRank,
                'memo' => $validated['memo'] ?? null,
            ],
        );

        return new PokemonCommonMoveResource($commonMove->load('move'));
    }

    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $validated['csv_file'];
        $handle = fopen($file->getRealPath(), 'rb');

        if ($handle === false) {
            return response()->json([
                'message' => 'CSVファイルを読み込めませんでした。',
            ], 422);
        }

        $header = fgetcsv($handle);
        $expectedHeader = ['rule', 'pokemon_key', 'form_key', 'move_name', 'memo'];

        if ($header === false || array_map('trim', $header) !== $expectedHeader) {
            fclose($handle);

            return response()->json([
                'message' => 'CSVのヘッダーが正しくありません。',
                'expected_header' => $expectedHeader,
            ], 422);
        }

        $importedCount = 0;
        $updatedCount = 0;
        $errors = [];
        $lineNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $lineNumber++;

            if (count($row) === 1 && trim((string) $row[0]) === '') {
                continue;
            }

            $values = array_pad($row, count($expectedHeader), '');
            [$rule, $pokemonKey, $formKey, $moveName, $memo] = array_map('trim', array_slice($values, 0, count($expectedHeader)));
            $formKey = $formKey !== '' ? $formKey : 'default';

            if (!in_array($rule, self::RULES, true)) {
                $errors[] = "{$lineNumber}行目: ruleはmain_seriesまたはchampionsを指定してください。";
                continue;
            }

            if ($pokemonKey === '' || $moveName === '') {
                $errors[] = "{$lineNumber}行目: pokemon_keyとmove_nameは必須です。";
                continue;
            }

            $move = Move::query()->where('name', $moveName)->first();

            if (!$move) {
                $errors[] = "{$lineNumber}行目: 技名「{$moveName}」がマスタデータに見つかりません。";
                continue;
            }

            $usageRank = PokemonCommonMove::query()
                ->where('rule', $rule)
                ->where('pokemon_key', $pokemonKey)
                ->where('form_key', $formKey)
                ->max('usage_rank');

            $commonMove = PokemonCommonMove::updateOrCreate(
                [
                    'rule' => $rule,
                    'pokemon_key' => $pokemonKey,
                    'form_key' => $formKey,
                    'move_id' => $move->id,
                ],
                [
                    'usage_rank' => $usageRank ? $usageRank + 1 : 1,
                    'memo' => $memo !== '' ? $memo : null,
                ],
            );

            if ($commonMove->wasRecentlyCreated) {
                $importedCount++;
            } else {
                $updatedCount++;
            }
        }

        fclose($handle);

        return response()->json([
            'imported_count' => $importedCount,
            'updated_count' => $updatedCount,
            'error_count' => count($errors),
            'errors' => $errors,
        ]);
    }

    public function destroy(PokemonCommonMove $pokemonCommonMove): Response
    {
        $pokemonCommonMove->delete();

        return response()->noContent();
    }
}
