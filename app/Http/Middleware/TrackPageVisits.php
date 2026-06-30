<?php

namespace App\Http\Middleware;

use App\Models\PageVisit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackPageVisits
{
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();

        if (!str_starts_with($path, '_')) {
            $pageVisit = PageVisit::firstOrCreate(
                ['path' => $path],
                ['visits' => 0]
            );

            $pageVisit->increment('visits');
            $pageVisit->touch('last_visited_at');

            $request->attributes->set('page_visits', $pageVisit->visits);
        }

        return $next($request);
    }
}
