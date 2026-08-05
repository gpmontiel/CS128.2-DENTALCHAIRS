import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import attendance from './attendance'
/**
* @see \App\Http\Controllers\ChairManagerController::home
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/chair-manager/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChairManagerController::home
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::home
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::home
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChairManagerController::home
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::home
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::home
* @see app/Http/Controllers/ChairManagerController.php:17
* @route '/chair-manager/home'
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
* @see \App\Http\Controllers\ChairManagerController::update
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
export const update = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/chair-manager/cancel-request/{assignment}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChairManagerController::update
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
update.url = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{assignment}', parsedArgs.assignment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::update
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
update.post = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::update
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
const updateForm = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::update
* @see app/Http/Controllers/ChairManagerController.php:127
* @route '/chair-manager/cancel-request/{assignment}'
*/
updateForm.post = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, options),
    method: 'post',
})

update.form = updateForm

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
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
export const manageRequests = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRequests.url(args, options),
    method: 'get',
})

manageRequests.definition = {
    methods: ["get","head"],
    url: '/chair-manager/manage-requests/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequests.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return manageRequests.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequests.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRequests.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequests.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageRequests.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
const manageRequestsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequestsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChairManagerController::manageRequests
* @see app/Http/Controllers/ChairManagerController.php:213
* @route '/chair-manager/manage-requests/{id}'
*/
manageRequestsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manageRequests.form = manageRequestsForm

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
export const updateRequestStatus = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRequestStatus.url(args, options),
    method: 'post',
})

updateRequestStatus.definition = {
    methods: ["post"],
    url: '/chair-manager/manage-requests/{assignmentId}/request/{requestId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatus.url = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions) => {
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

    return updateRequestStatus.definition.url
            .replace('{assignmentId}', parsedArgs.assignmentId.toString())
            .replace('{requestId}', parsedArgs.requestId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatus.post = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRequestStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
const updateRequestStatusForm = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRequestStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/chair-manager/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatusForm.post = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRequestStatus.url(args, options),
    method: 'post',
})

updateRequestStatus.form = updateRequestStatusForm

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

const chairManager = {
    attendance: Object.assign(attendance, attendance),
    home: Object.assign(home, home),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    history: Object.assign(history, history),
    manageRequests: Object.assign(manageRequests, manageRequests),
    updateRequestStatus: Object.assign(updateRequestStatus, updateRequestStatus),
    requestDetails: Object.assign(requestDetails, requestDetails),
}

export default chairManager