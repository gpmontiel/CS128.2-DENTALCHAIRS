import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
export const store = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/management/rooms/{roomId}/sections',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
store.url = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { roomId: args }
    }

    if (Array.isArray(args)) {
        args = {
            roomId: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        roomId: args.roomId,
    }

    return store.definition.url
            .replace('{roomId}', parsedArgs.roomId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
store.post = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
const storeForm = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
storeForm.post = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::update
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/management/sections/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::update
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::update
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::update
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::update
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
updateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroy
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/management/sections/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroy
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroy
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroy
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
const destroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroy
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
destroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const sections = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default sections