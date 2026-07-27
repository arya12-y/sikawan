<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogRequestToConsole
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);
        $response = $next($request);
        $ms = round((microtime(true) - $start) * 1000);

        if ($ms > 500) {
            $msg = sprintf("[%s] %s %s %03dms %s %s",
                now()->format('H:i:s'),
                str_pad($request->method(), 6),
                $request->path(),
                $ms,
                $response->status(),
                $request->user()?->email ?? '-'
            );
            error_log($msg);
        }

        return $response;
    }
}
