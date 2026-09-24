<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $tooManyAttemptsResponse = static function (Request $request, array $headers) {
            $response = response()->json([
                'message' => '試行回数が上限に達しました。時間をおいて再度お試しください。',
            ], 429, $headers);
            $response->headers->set('Cache-Control', 'no-store, private');

            return $response;
        };

        RateLimiter::for('login', function (Request $request) use ($tooManyAttemptsResponse): array {
            $email = Str::lower(trim((string) $request->input('email')));

            return [
                Limit::perMinute(5)
                    ->by('login-email:'.hash('sha256', $email))
                    ->response($tooManyAttemptsResponse),
                Limit::perMinute(20)
                    ->by('login-ip:'.$request->ip())
                    ->response($tooManyAttemptsResponse),
            ];
        });

        RateLimiter::for('register', fn (Request $request): Limit => Limit::perHour(5)
            ->by('register-ip:'.$request->ip())
            ->response($tooManyAttemptsResponse));
    }
}
