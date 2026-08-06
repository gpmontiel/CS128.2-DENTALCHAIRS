import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import manageRequests1766bd from './manage-requests'
import managementD2a520 from './management'
/**
* @see \App\Http\Controllers\ClinicalAdminController::home
* @see app/Http/Controllers/ClinicalAdminController.php:22
* @route '/admin/home'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/admin/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::home
* @see app/Http/Controllers/ClinicalAdminController.php:22
* @route '/admin/home'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::home
* @see app/Http/Controllers/ClinicalAdminController.php:22
* @route '/admin/home'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::home
* @see app/Http/Controllers/ClinicalAdminController.php:22
* @route '/admin/home'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::home
* @see app/Http/Controllers/ClinicalAdminController.php:22
* @route '/admin/home'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::home
* @see app/Http/Controllers/ClinicalAdminController.php:22
* @route '/admin/home'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::home
* @see app/Http/Controllers/ClinicalAdminController.php:22
* @route '/admin/home'
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
* @see \App\Http\Controllers\ClinicalAdminController::manageRequests
* @see app/Http/Controllers/ClinicalAdminController.php:214
* @route '/admin/manage-requests'
*/
export const manageRequests = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRequests.url(options),
    method: 'get',
})

manageRequests.definition = {
    methods: ["get","head"],
    url: '/admin/manage-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageRequests
* @see app/Http/Controllers/ClinicalAdminController.php:214
* @route '/admin/manage-requests'
*/
manageRequests.url = (options?: RouteQueryOptions) => {
    return manageRequests.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageRequests
* @see app/Http/Controllers/ClinicalAdminController.php:214
* @route '/admin/manage-requests'
*/
manageRequests.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageRequests.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageRequests
* @see app/Http/Controllers/ClinicalAdminController.php:214
* @route '/admin/manage-requests'
*/
manageRequests.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageRequests.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageRequests
* @see app/Http/Controllers/ClinicalAdminController.php:214
* @route '/admin/manage-requests'
*/
const manageRequestsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageRequests
* @see app/Http/Controllers/ClinicalAdminController.php:214
* @route '/admin/manage-requests'
*/
manageRequestsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manageRequests
* @see app/Http/Controllers/ClinicalAdminController.php:214
* @route '/admin/manage-requests'
*/
manageRequestsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageRequests.url({
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
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
*/
export const updateRequestStatus = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRequestStatus.url(args, options),
    method: 'post',
})

updateRequestStatus.definition = {
    methods: ["post"],
    url: '/admin/manage-requests/{assignmentId}/request/{requestId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
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
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatus.post = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRequestStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
*/
const updateRequestStatusForm = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRequestStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChairManagerController::updateRequestStatus
* @see app/Http/Controllers/ChairManagerController.php:254
* @route '/admin/manage-requests/{assignmentId}/request/{requestId}'
*/
updateRequestStatusForm.post = (args: { assignmentId: string | number, requestId: string | number } | [assignmentId: string | number, requestId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRequestStatus.url(args, options),
    method: 'post',
})

updateRequestStatus.form = updateRequestStatusForm

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
export const manageReports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageReports.url(options),
    method: 'get',
})

manageReports.definition = {
    methods: ["get","head"],
    url: '/admin/manage-reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReports.url = (options?: RouteQueryOptions) => {
    return manageReports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageReports.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageReports.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
const manageReportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageReports.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageReports.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReportsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageReports.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manageReports.form = manageReportsForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:320
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
* @see app/Http/Controllers/ClinicalAdminController.php:320
* @route '/admin/management'
*/
management.url = (options?: RouteQueryOptions) => {
    return management.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:320
* @route '/admin/management'
*/
management.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: management.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:320
* @route '/admin/management'
*/
management.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: management.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:320
* @route '/admin/management'
*/
const managementForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: management.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:320
* @route '/admin/management'
*/
managementForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: management.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::management
* @see app/Http/Controllers/ClinicalAdminController.php:320
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

const admin = {
    home: Object.assign(home, home),
    manageRequests: Object.assign(manageRequests, manageRequests1766bd),
    updateRequestStatus: Object.assign(updateRequestStatus, updateRequestStatus),
    manageReports: Object.assign(manageReports, manageReports),
    management: Object.assign(management, managementD2a520),
}

export default admin