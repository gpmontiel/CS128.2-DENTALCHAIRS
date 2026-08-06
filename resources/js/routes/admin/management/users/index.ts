import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:368
* @route '/admin/management/users'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/management/users',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:368
* @route '/admin/management/users'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:368
* @route '/admin/management/users'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:368
* @route '/admin/management/users'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::store
* @see app/Http/Controllers/ClinicalAdminController.php:368
* @route '/admin/management/users'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateStudentInfo
* @see app/Http/Controllers/ClinicalAdminController.php:394
* @route '/admin/management/users/{id}/student-info'
*/
export const updateStudentInfo = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStudentInfo.url(args, options),
    method: 'put',
})

updateStudentInfo.definition = {
    methods: ["put"],
    url: '/admin/management/users/{id}/student-info',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateStudentInfo
* @see app/Http/Controllers/ClinicalAdminController.php:394
* @route '/admin/management/users/{id}/student-info'
*/
updateStudentInfo.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateStudentInfo.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateStudentInfo
* @see app/Http/Controllers/ClinicalAdminController.php:394
* @route '/admin/management/users/{id}/student-info'
*/
updateStudentInfo.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStudentInfo.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateStudentInfo
* @see app/Http/Controllers/ClinicalAdminController.php:394
* @route '/admin/management/users/{id}/student-info'
*/
const updateStudentInfoForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateStudentInfo.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateStudentInfo
* @see app/Http/Controllers/ClinicalAdminController.php:394
* @route '/admin/management/users/{id}/student-info'
*/
updateStudentInfoForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateStudentInfo.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateStudentInfo.form = updateStudentInfoForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroy
* @see app/Http/Controllers/ClinicalAdminController.php:406
* @route '/admin/management/users/{id}'
*/
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/management/users/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroy
* @see app/Http/Controllers/ClinicalAdminController.php:406
* @route '/admin/management/users/{id}'
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
* @see app/Http/Controllers/ClinicalAdminController.php:406
* @route '/admin/management/users/{id}'
*/
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroy
* @see app/Http/Controllers/ClinicalAdminController.php:406
* @route '/admin/management/users/{id}'
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
* @see app/Http/Controllers/ClinicalAdminController.php:406
* @route '/admin/management/users/{id}'
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

const users = {
    store: Object.assign(store, store),
    updateStudentInfo: Object.assign(updateStudentInfo, updateStudentInfo),
    destroy: Object.assign(destroy, destroy),
}

export default users