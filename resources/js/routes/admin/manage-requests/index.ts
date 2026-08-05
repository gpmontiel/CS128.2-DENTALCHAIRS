import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ClinicalAdminController::action
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
export const action = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: action.url(args, options),
    method: 'post',
})

action.definition = {
    methods: ["post"],
    url: '/admin/manage-requests/{id}/action',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::action
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
action.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return action.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::action
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
action.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: action.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::action
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
const actionForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: action.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::action
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
actionForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: action.url(args, options),
    method: 'post',
})

action.form = actionForm

/**
* @see \App\Http\Controllers\ChairManagerController::details
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
export const details = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: details.url(args, options),
    method: 'get',
})

details.definition = {
    methods: ["get","head"],
    url: '/admin/manage-requests/{id}/details',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChairManagerController::details
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
details.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return details.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::details
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
details.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: details.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::details
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
details.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: details.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChairManagerController::details
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
const detailsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: details.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::details
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
detailsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: details.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::details
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
detailsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: details.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

details.form = detailsForm

const manageRequests = {
    action: Object.assign(action, action),
    details: Object.assign(details, details),
}

export default manageRequests