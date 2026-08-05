import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
const manageRequests3f669eaf09c770686cec0774f54a023c = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRequests3f669eaf09c770686cec0774f54a023c.url(args, options),
    method: 'get',
})

manageRequests3f669eaf09c770686cec0774f54a023c.definition = {
    methods: ["get","head"],
    url: '/admin/manage-requests/{id}/details',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
manageRequests3f669eaf09c770686cec0774f54a023c.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return manageRequests3f669eaf09c770686cec0774f54a023c.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
manageRequests3f669eaf09c770686cec0774f54a023c.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRequests3f669eaf09c770686cec0774f54a023c.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
manageRequests3f669eaf09c770686cec0774f54a023c.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageRequests3f669eaf09c770686cec0774f54a023c.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
const manageRequests3f669eaf09c770686cec0774f54a023cForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests3f669eaf09c770686cec0774f54a023c.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
manageRequests3f669eaf09c770686cec0774f54a023cForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests3f669eaf09c770686cec0774f54a023c.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/admin/manage-requests/{id}/details'
*/
manageRequests3f669eaf09c770686cec0774f54a023cForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests3f669eaf09c770686cec0774f54a023c.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manageRequests3f669eaf09c770686cec0774f54a023c.form = manageRequests3f669eaf09c770686cec0774f54a023cForm
/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
const manageRequests50d7575948aba9d50e6efa8d29fabeed = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRequests50d7575948aba9d50e6efa8d29fabeed.url(args, options),
    method: 'get',
})

manageRequests50d7575948aba9d50e6efa8d29fabeed.definition = {
    methods: ["get","head"],
    url: '/chair-manager/manage-requests/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequests50d7575948aba9d50e6efa8d29fabeed.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return manageRequests50d7575948aba9d50e6efa8d29fabeed.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequests50d7575948aba9d50e6efa8d29fabeed.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRequests50d7575948aba9d50e6efa8d29fabeed.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequests50d7575948aba9d50e6efa8d29fabeed.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageRequests50d7575948aba9d50e6efa8d29fabeed.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
const manageRequests50d7575948aba9d50e6efa8d29fabeedForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests50d7575948aba9d50e6efa8d29fabeed.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequests50d7575948aba9d50e6efa8d29fabeedForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests50d7575948aba9d50e6efa8d29fabeed.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequests50d7575948aba9d50e6efa8d29fabeedForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests50d7575948aba9d50e6efa8d29fabeed.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manageRequests50d7575948aba9d50e6efa8d29fabeed.form = manageRequests50d7575948aba9d50e6efa8d29fabeedForm

/**
* Multiple routes resolve to \App\Http\Controllers\ChairManagerController::manageRequests, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `manageRequests['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const manageRequests = {
    '/admin/manage-requests/{id}/details': manageRequests3f669eaf09c770686cec0774f54a023c,
    '/chair-manager/manage-requests/{id}': manageRequests50d7575948aba9d50e6efa8d29fabeed,
}

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
*/
const updateRequestStatusfc836f38f238df39d1b64e067fc8e958 = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRequestStatusfc836f38f238df39d1b64e067fc8e958.url(args, options),
    method: 'post',
})

updateRequestStatusfc836f38f238df39d1b64e067fc8e958.definition = {
    methods: ["post"],
    url: '/admin/manage-requests/{assignmentId}/request/{requestId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatusfc836f38f238df39d1b64e067fc8e958.url = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            assignmentId: args[0],
            requestId: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        assignmentId: args.assignmentId,
        requestId: args.requestId,
    }

    return updateRequestStatusfc836f38f238df39d1b64e067fc8e958.definition.url
            .replace('{assignmentId}', parsedArgs.assignmentId.toString())
            .replace('{requestId}', parsedArgs.requestId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatusfc836f38f238df39d1b64e067fc8e958.post = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRequestStatusfc836f38f238df39d1b64e067fc8e958.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
*/
const updateRequestStatusfc836f38f238df39d1b64e067fc8e958Form = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRequestStatusfc836f38f238df39d1b64e067fc8e958.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatusfc836f38f238df39d1b64e067fc8e958Form.post = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRequestStatusfc836f38f238df39d1b64e067fc8e958.url(args, options),
    method: 'post',
})

updateRequestStatusfc836f38f238df39d1b64e067fc8e958.form = updateRequestStatusfc836f38f238df39d1b64e067fc8e958Form
/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
const updateRequestStatus6c775f8116b719f868ca0ad3e74dafac = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRequestStatus6c775f8116b719f868ca0ad3e74dafac.url(args, options),
    method: 'post',
})

updateRequestStatus6c775f8116b719f868ca0ad3e74dafac.definition = {
    methods: ["post"],
    url: '/chair-manager/manage-requests/{assignmentId}/request/{requestId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatus6c775f8116b719f868ca0ad3e74dafac.url = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            assignmentId: args[0],
            requestId: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        assignmentId: args.assignmentId,
        requestId: args.requestId,
    }

    return updateRequestStatus6c775f8116b719f868ca0ad3e74dafac.definition.url
            .replace('{assignmentId}', parsedArgs.assignmentId.toString())
            .replace('{requestId}', parsedArgs.requestId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatus6c775f8116b719f868ca0ad3e74dafac.post = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRequestStatus6c775f8116b719f868ca0ad3e74dafac.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
const updateRequestStatus6c775f8116b719f868ca0ad3e74dafacForm = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRequestStatus6c775f8116b719f868ca0ad3e74dafac.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatus6c775f8116b719f868ca0ad3e74dafacForm.post = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRequestStatus6c775f8116b719f868ca0ad3e74dafac.url(args, options),
    method: 'post',
})

updateRequestStatus6c775f8116b719f868ca0ad3e74dafac.form = updateRequestStatus6c775f8116b719f868ca0ad3e74dafacForm

/**
* Multiple routes resolve to \App\Http\Controllers\ChairManagerController::updateRequestStatus, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `updateRequestStatus['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const updateRequestStatus = {
    '/admin/manage-requests/{assignmentId}/request/{requestId}': updateRequestStatusfc836f38f238df39d1b64e067fc8e958,
    '/chair-manager/manage-requests/{assignmentId}/request/{requestId}': updateRequestStatus6c775f8116b719f868ca0ad3e74dafac,
}

/**
* @see \App\Http\Controllers\ChairManagerController::index
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/chair-manager/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChairManagerController::index
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::index
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::index
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChairManagerController::index
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::index
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::index
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
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
* @see \App\Http\Controllers\ChairManagerController::store
* @see app/Http/Controllers/ChairManagerController.php:53
* @route '/chair-manager/request-role'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/chair-manager/request-role',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChairManagerController::store
* @see app/Http/Controllers/ChairManagerController.php:53
* @route '/chair-manager/request-role'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::store
* @see app/Http/Controllers/ChairManagerController.php:53
* @route '/chair-manager/request-role'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::store
* @see app/Http/Controllers/ChairManagerController.php:53
* @route '/chair-manager/request-role'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::store
* @see app/Http/Controllers/ChairManagerController.php:53
* @route '/chair-manager/request-role'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\ChairManagerController::cancelRequest
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
export const cancelRequest = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelRequest.url(args, options),
    method: 'post',
})

cancelRequest.definition = {
    methods: ["post"],
    url: '/chair-manager/cancel-request/{assignment}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChairManagerController::cancelRequest
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
cancelRequest.url = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assignment: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { assignment: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            assignment: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        assignment: typeof args.assignment === 'object'
        ? args.assignment.id
        : args.assignment,
    }

    return cancelRequest.definition.url
            .replace('{assignment}', parsedArgs.assignment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::cancelRequest
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
cancelRequest.post = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelRequest.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::cancelRequest
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
const cancelRequestForm = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancelRequest.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::cancelRequest
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
cancelRequestForm.post = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancelRequest.url(args, options),
    method: 'post',
})

cancelRequest.form = cancelRequestForm

/**
* @see \App\Http\Controllers\ChairManagerController::history
* @see app/Http/Controllers/ChairManagerController.php:158
* @route '/chair-manager/history'
*/
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/chair-manager/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChairManagerController::history
* @see app/Http/Controllers/ChairManagerController.php:158
* @route '/chair-manager/history'
*/
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::history
* @see app/Http/Controllers/ChairManagerController.php:158
* @route '/chair-manager/history'
*/
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::history
* @see app/Http/Controllers/ChairManagerController.php:158
* @route '/chair-manager/history'
*/
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChairManagerController::history
* @see app/Http/Controllers/ChairManagerController.php:158
* @route '/chair-manager/history'
*/
const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::history
* @see app/Http/Controllers/ChairManagerController.php:158
* @route '/chair-manager/history'
*/
historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::history
* @see app/Http/Controllers/ChairManagerController.php:158
* @route '/chair-manager/history'
*/
historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

history.form = historyForm

/**
* @see \App\Http\Controllers\ChairManagerController::requestDetails
* @see app/Http/Controllers/ChairManagerController.php:172
* @route '/chair-manager/request-details/{id}'
*/
export const requestDetails = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: requestDetails.url(args, options),
    method: 'get',
})

requestDetails.definition = {
    methods: ["get","head"],
    url: '/chair-manager/request-details/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChairManagerController::requestDetails
* @see app/Http/Controllers/ChairManagerController.php:172
* @route '/chair-manager/request-details/{id}'
*/
requestDetails.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return requestDetails.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::requestDetails
* @see app/Http/Controllers/ChairManagerController.php:172
* @route '/chair-manager/request-details/{id}'
*/
requestDetails.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: requestDetails.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::requestDetails
* @see app/Http/Controllers/ChairManagerController.php:172
* @route '/chair-manager/request-details/{id}'
*/
requestDetails.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: requestDetails.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChairManagerController::requestDetails
* @see app/Http/Controllers/ChairManagerController.php:172
* @route '/chair-manager/request-details/{id}'
*/
const requestDetailsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: requestDetails.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::requestDetails
* @see app/Http/Controllers/ChairManagerController.php:172
* @route '/chair-manager/request-details/{id}'
*/
requestDetailsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: requestDetails.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::requestDetails
* @see app/Http/Controllers/ChairManagerController.php:172
* @route '/chair-manager/request-details/{id}'
*/
requestDetailsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: requestDetails.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

requestDetails.form = requestDetailsForm

const ChairManagerController = { manageRequests, updateRequestStatus, index, store, cancelRequest, history, requestDetails }

export default ChairManagerController