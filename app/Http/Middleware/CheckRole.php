<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roleId): Response
    {
        if ($request->user() && (string) $request->user()->role_id === $roleId) {
            return $next($request);
        }

        abort(403, 'Unauthorized access.');
    }
}
