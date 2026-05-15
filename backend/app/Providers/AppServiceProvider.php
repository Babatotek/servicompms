<?php

namespace App\Providers;

use App\Models\Appraisal;
use App\Models\PerformanceContract;
use App\Policies\AppraisalPolicy;
use App\Policies\ContractPolicy;
use App\Services\AppraisalWorkflowService;
use App\Services\ContractSnapshotService;
use App\Services\MpmsAggregationService;
use App\Services\ScoringService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind services as singletons — one instance per request
        $this->app->singleton(ScoringService::class);
        $this->app->singleton(MpmsAggregationService::class);
        $this->app->singleton(ContractSnapshotService::class);
        $this->app->singleton(AppraisalWorkflowService::class, function ($app) {
            return new AppraisalWorkflowService($app->make(ScoringService::class));
        });
    }

    public function boot(): void
    {
        // Policies
        Gate::policy(Appraisal::class, AppraisalPolicy::class);
        Gate::policy(PerformanceContract::class, ContractPolicy::class);

        // JSON responses only — no redirects for API
        \Illuminate\Auth\Middleware\Authenticate::redirectUsing(fn() => null);
    }
}
