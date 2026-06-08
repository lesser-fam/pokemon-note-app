export function PokemonStatLegend() {
    return (
        <details className="rounded border bg-white p-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
                H・A・B・C・D・Sとは？
            </summary>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-700 sm:grid-cols-6">
                <span className="rounded bg-gray-100 px-2 py-1">H：HP</span>

                <span className="rounded bg-gray-100 px-2 py-1">A：攻撃</span>

                <span className="rounded bg-gray-100 px-2 py-1">B：防御</span>

                <span className="rounded bg-gray-100 px-2 py-1">C：特攻</span>

                <span className="rounded bg-gray-100 px-2 py-1">D：特防</span>

                <span className="rounded bg-gray-100 px-2 py-1">S：素早さ</span>
            </div>
        </details>
    );
}
