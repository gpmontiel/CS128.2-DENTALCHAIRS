import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ClinicalAdminController::index
* @see app/Http/Controllers/ClinicalAdminController.php:23
* @route '/admin/home'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::index
* @see app/Http/Controllers/ClinicalAdminController.php:23
* @route '/admin/home'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::index
* @see app/Http/Controllers/ClinicalAdminController.php:23
* @route '/admin/home'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::index
* @see app/Http/Controllers/ClinicalAdminController.php:23
* @route '/admin/home'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::index
* @see app/Http/Controllers/ClinicalAdminController.php:23
* @route '/admin/home'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::index
* @see app/Http/Controllers/ClinicalAdminController.php:23
* @route '/admin/home'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::index
* @see app/Http/Controllers/ClinicalAdminController.php:23
* @route '/admin/home'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::markAttendance
* @see app/Http/Controllers/ClinicalAdminController.php:154
* @route '/admin/attendance/mark'
*/
export const markAttendance = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAttendance.url(options),
    method: 'post',
})

markAttendance.definition = {
    methods: ["post"],
    url: '/admin/attendance/mark',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::markAttendance
* @see app/Http/Controllers/ClinicalAdminController.php:154
* @route '/admin/attendance/mark'
*/
markAttendance.url = (options?: RouteQueryOptions) => {
    return markAttendance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::markAttendance
* @see app/Http/Controllers/ClinicalAdminController.php:154
* @route '/admin/attendance/mark'
*/
markAttendance.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAttendance.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::markAttendance
* @see app/Http/Controllers/ClinicalAdminController.php:154
* @route '/admin/attendance/mark'
*/
const markAttendanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAttendance.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::markAttendance
* @see app/Http/Controllers/ClinicalAdminController.php:154
* @route '/admin/attendance/mark'
*/
markAttendanceForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAttendance.url(options),
    method: 'post',
})

markAttendance.form = markAttendanceForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeManual
* @see app/Http/Controllers/ClinicalAdminController.php:189
* @route '/admin/attendance/manual'
*/
export const storeManual = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeManual.url(options),
    method: 'post',
})

storeManual.definition = {
    methods: ["post"],
    url: '/admin/attendance/manual',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeManual
* @see app/Http/Controllers/ClinicalAdminController.php:189
* @route '/admin/attendance/manual'
*/
storeManual.url = (options?: RouteQueryOptions) => {
    return storeManual.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeManual
* @see app/Http/Controllers/ClinicalAdminController.php:189
* @route '/admin/attendance/manual'
*/
storeManual.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeManual.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeManual
* @see app/Http/Controllers/ClinicalAdminController.php:189
* @route '/admin/attendance/manual'
*/
const storeManualForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeManual.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeManual
* @see app/Http/Controllers/ClinicalAdminController.php:189
* @route '/admin/attendance/manual'
*/
storeManualForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeManual.url(options),
    method: 'post',
})

storeManual.form = storeManualForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageManagerRequests
* @see app/Http/Controllers/ClinicalAdminController.php:215
* @route '/admin/manage-requests'
*/
export const manageManagerRequests = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageManagerRequests.url(options),
    method: 'get',
})

manageManagerRequests.definition = {
    methods: ["get","head"],
    url: '/admin/manage-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageManagerRequests
* @see app/Http/Controllers/ClinicalAdminController.php:215
* @route '/admin/manage-requests'
*/
manageManagerRequests.url = (options?: RouteQueryOptions) => {
    return manageManagerRequests.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageManagerRequests
* @see app/Http/Controllers/ClinicalAdminController.php:215
* @route '/admin/manage-requests'
*/
manageManagerRequests.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageManagerRequests.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageManagerRequests
* @see app/Http/Controllers/ClinicalAdminController.php:215
* @route '/admin/manage-requests'
*/
manageManagerRequests.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageManagerRequests.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageManagerRequests
* @see app/Http/Controllers/ClinicalAdminController.php:215
* @route '/admin/manage-requests'
*/
const manageManagerRequestsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageManagerRequests.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageManagerRequests
* @see app/Http/Controllers/ClinicalAdminController.php:215
* @route '/admin/manage-requests'
*/
manageManagerRequestsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageManagerRequests.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageManagerRequests
* @see app/Http/Controllers/ClinicalAdminController.php:215
* @route '/admin/manage-requests'
*/
manageManagerRequestsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageManagerRequests.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manageManagerRequests.form = manageManagerRequestsForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateManagerRequestAction
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
export const updateManagerRequestAction = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateManagerRequestAction.url(args, options),
    method: 'post',
})

updateManagerRequestAction.definition = {
    methods: ["post"],
    url: '/admin/manage-requests/{id}/action',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateManagerRequestAction
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
updateManagerRequestAction.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateManagerRequestAction.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateManagerRequestAction
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
updateManagerRequestAction.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateManagerRequestAction.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateManagerRequestAction
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
const updateManagerRequestActionForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateManagerRequestAction.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateManagerRequestAction
* @see app/Http/Controllers/ClinicalAdminController.php:280
* @route '/admin/manage-requests/{id}/action'
*/
updateManagerRequestActionForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateManagerRequestAction.url(args, options),
    method: 'post',
})

updateManagerRequestAction.form = updateManagerRequestActionForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:327
* @route '/admin/management'
*/
export const management = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: management.url(options),
    method: 'get',
})

management.definition = {
    methods: ["get","head"],
    url: '/admin/management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:327
* @route '/admin/management'
*/
management.url = (options?: RouteQueryOptions) => {
    return management.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:327
* @route '/admin/management'
*/
management.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: management.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:327
* @route '/admin/management'
*/
management.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: management.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:327
* @route '/admin/management'
*/
const managementForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: management.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:327
* @route '/admin/management'
*/
managementForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: management.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:327
* @route '/admin/management'
*/
managementForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: management.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

management.form = managementForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeUser
* @see app/Http/Controllers/ClinicalAdminController.php:375
* @route '/admin/management/users'
*/
export const storeUser = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeUser.url(options),
    method: 'post',
})

storeUser.definition = {
    methods: ["post"],
    url: '/admin/management/users',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeUser
* @see app/Http/Controllers/ClinicalAdminController.php:375
* @route '/admin/management/users'
*/
storeUser.url = (options?: RouteQueryOptions) => {
    return storeUser.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeUser
* @see app/Http/Controllers/ClinicalAdminController.php:375
* @route '/admin/management/users'
*/
storeUser.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeUser.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeUser
* @see app/Http/Controllers/ClinicalAdminController.php:375
* @route '/admin/management/users'
*/
const storeUserForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeUser.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeUser
* @see app/Http/Controllers/ClinicalAdminController.php:375
* @route '/admin/management/users'
*/
storeUserForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeUser.url(options),
    method: 'post',
})

storeUser.form = storeUserForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::reassignStudentGroup
* @see app/Http/Controllers/ClinicalAdminController.php:403
* @route '/admin/management/users/{id}/student-info'
*/
export const reassignStudentGroup = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: reassignStudentGroup.url(args, options),
    method: 'put',
})

reassignStudentGroup.definition = {
    methods: ["put"],
    url: '/admin/management/users/{id}/student-info',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::reassignStudentGroup
* @see app/Http/Controllers/ClinicalAdminController.php:403
* @route '/admin/management/users/{id}/student-info'
*/
reassignStudentGroup.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reassignStudentGroup.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::reassignStudentGroup
* @see app/Http/Controllers/ClinicalAdminController.php:403
* @route '/admin/management/users/{id}/student-info'
*/
reassignStudentGroup.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: reassignStudentGroup.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::reassignStudentGroup
* @see app/Http/Controllers/ClinicalAdminController.php:403
* @route '/admin/management/users/{id}/student-info'
*/
const reassignStudentGroupForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reassignStudentGroup.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::reassignStudentGroup
* @see app/Http/Controllers/ClinicalAdminController.php:403
* @route '/admin/management/users/{id}/student-info'
*/
reassignStudentGroupForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reassignStudentGroup.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

reassignStudentGroup.form = reassignStudentGroupForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyUser
* @see app/Http/Controllers/ClinicalAdminController.php:415
* @route '/admin/management/users/{id}'
*/
export const destroyUser = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyUser.url(args, options),
    method: 'delete',
})

destroyUser.definition = {
    methods: ["delete"],
    url: '/admin/management/users/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyUser
* @see app/Http/Controllers/ClinicalAdminController.php:415
* @route '/admin/management/users/{id}'
*/
destroyUser.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroyUser.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyUser
* @see app/Http/Controllers/ClinicalAdminController.php:415
* @route '/admin/management/users/{id}'
*/
destroyUser.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyUser.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyUser
* @see app/Http/Controllers/ClinicalAdminController.php:415
* @route '/admin/management/users/{id}'
*/
const destroyUserForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyUser.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyUser
* @see app/Http/Controllers/ClinicalAdminController.php:415
* @route '/admin/management/users/{id}'
*/
destroyUserForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyUser.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyUser.form = destroyUserForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeRoom
* @see app/Http/Controllers/ClinicalAdminController.php:424
* @route '/admin/management/rooms'
*/
export const storeRoom = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeRoom.url(options),
    method: 'post',
})

storeRoom.definition = {
    methods: ["post"],
    url: '/admin/management/rooms',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeRoom
* @see app/Http/Controllers/ClinicalAdminController.php:424
* @route '/admin/management/rooms'
*/
storeRoom.url = (options?: RouteQueryOptions) => {
    return storeRoom.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeRoom
* @see app/Http/Controllers/ClinicalAdminController.php:424
* @route '/admin/management/rooms'
*/
storeRoom.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeRoom.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeRoom
* @see app/Http/Controllers/ClinicalAdminController.php:424
* @route '/admin/management/rooms'
*/
const storeRoomForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeRoom.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeRoom
* @see app/Http/Controllers/ClinicalAdminController.php:424
* @route '/admin/management/rooms'
*/
storeRoomForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeRoom.url(options),
    method: 'post',
})

storeRoom.form = storeRoomForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateRoom
* @see app/Http/Controllers/ClinicalAdminController.php:447
* @route '/admin/management/rooms/{id}'
*/
export const updateRoom = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRoom.url(args, options),
    method: 'put',
})

updateRoom.definition = {
    methods: ["put"],
    url: '/admin/management/rooms/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateRoom
* @see app/Http/Controllers/ClinicalAdminController.php:447
* @route '/admin/management/rooms/{id}'
*/
updateRoom.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateRoom.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateRoom
* @see app/Http/Controllers/ClinicalAdminController.php:447
* @route '/admin/management/rooms/{id}'
*/
updateRoom.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRoom.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateRoom
* @see app/Http/Controllers/ClinicalAdminController.php:447
* @route '/admin/management/rooms/{id}'
*/
const updateRoomForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRoom.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateRoom
* @see app/Http/Controllers/ClinicalAdminController.php:447
* @route '/admin/management/rooms/{id}'
*/
updateRoomForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRoom.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateRoom.form = updateRoomForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyRoom
* @see app/Http/Controllers/ClinicalAdminController.php:458
* @route '/admin/management/rooms/{id}'
*/
export const destroyRoom = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyRoom.url(args, options),
    method: 'delete',
})

destroyRoom.definition = {
    methods: ["delete"],
    url: '/admin/management/rooms/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyRoom
* @see app/Http/Controllers/ClinicalAdminController.php:458
* @route '/admin/management/rooms/{id}'
*/
destroyRoom.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroyRoom.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyRoom
* @see app/Http/Controllers/ClinicalAdminController.php:458
* @route '/admin/management/rooms/{id}'
*/
destroyRoom.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyRoom.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyRoom
* @see app/Http/Controllers/ClinicalAdminController.php:458
* @route '/admin/management/rooms/{id}'
*/
const destroyRoomForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyRoom.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroyRoom
* @see app/Http/Controllers/ClinicalAdminController.php:458
* @route '/admin/management/rooms/{id}'
*/
destroyRoomForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyRoom.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyRoom.form = destroyRoomForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeSection
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
export const storeSection = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeSection.url(args, options),
    method: 'post',
})

storeSection.definition = {
    methods: ["post"],
    url: '/admin/management/rooms/{roomId}/sections',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeSection
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
storeSection.url = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return storeSection.definition.url
            .replace('{roomId}', parsedArgs.roomId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeSection
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
storeSection.post = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeSection.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeSection
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
const storeSectionForm = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeSection.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::storeSection
* @see app/Http/Controllers/ClinicalAdminController.php:464
* @route '/admin/management/rooms/{roomId}/sections'
*/
storeSectionForm.post = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeSection.url(args, options),
    method: 'post',
})

storeSection.form = storeSectionForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateSection
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
export const updateSection = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSection.url(args, options),
    method: 'put',
})

updateSection.definition = {
    methods: ["put"],
    url: '/admin/management/sections/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateSection
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
updateSection.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateSection.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateSection
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
updateSection.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSection.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateSection
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
const updateSectionForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateSection.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::updateSection
* @see app/Http/Controllers/ClinicalAdminController.php:480
* @route '/admin/management/sections/{id}'
*/
updateSectionForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateSection.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateSection.form = updateSectionForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroySection
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
export const destroySection = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroySection.url(args, options),
    method: 'delete',
})

destroySection.definition = {
    methods: ["delete"],
    url: '/admin/management/sections/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroySection
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
destroySection.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroySection.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroySection
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
destroySection.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroySection.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroySection
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
const destroySectionForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroySection.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::destroySection
* @see app/Http/Controllers/ClinicalAdminController.php:492
* @route '/admin/management/sections/{id}'
*/
destroySectionForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroySection.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroySection.form = destroySectionForm

const ClinicalAdminController = { index, markAttendance, storeManual, manageManagerRequests, updateManagerRequestAction, management, storeUser, reassignStudentGroup, destroyUser, storeRoom, updateRoom, destroyRoom, storeSection, updateSection, destroySection }

export default ClinicalAdminController