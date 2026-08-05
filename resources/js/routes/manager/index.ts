import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ProgramManagerController::home
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/manager/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::home
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::home
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::home
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::home
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::home
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::home
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

home.form = homeForm

const manager = {
    home: Object.assign(home, home),
}

export default manager