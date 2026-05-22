<?php

namespace App\Providers;

use App\Services\UniversityValidationService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UniversityValidationService::class, function () {
            return new UniversityValidationService();
        });
    }

    public function boot(): void
    {
        //
    }
}
