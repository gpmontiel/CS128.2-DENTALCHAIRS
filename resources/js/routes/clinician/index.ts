import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ClinicianController::home
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/clinician/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicianController::home
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicianController::home
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::home
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicianController::home
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::home
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::home
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
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
* @see \App\Http\Controllers\ClinicianController::createChairRequest
* @see app/Http/Controllers/ClinicianController.php:138
* @route '/clinician/create-chair-request'
*/
export const createChairRequest = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createChairRequest.url(options),
    method: 'get',
})

createChairRequest.definition = {
    methods: ["get","head"],
    url: '/clinician/create-chair-request',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicianController::createChairRequest
* @see app/Http/Controllers/ClinicianController.php:138
* @route '/clinician/create-chair-request'
*/
createChairRequest.url = (options?: RouteQueryOptions) => {
    return createChairRequest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicianController::createChairRequest
* @see app/Http/Controllers/ClinicianController.php:138
* @route '/clinician/create-chair-request'
*/
createChairRequest.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createChairRequest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::createChairRequest
* @see app/Http/Controllers/ClinicianController.php:138
* @route '/clinician/create-chair-request'
*/
createChairRequest.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: createChairRequest.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicianController::createChairRequest
* @see app/Http/Controllers/ClinicianController.php:138
* @route '/clinician/create-chair-request'
*/
const createChairRequestForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: createChairRequest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::createChairRequest
* @see app/Http/Controllers/ClinicianController.php:138
* @route '/clinician/create-chair-request'
*/
createChairRequestForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: createChairRequest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::createChairRequest
* @see app/Http/Controllers/ClinicianController.php:138
* @route '/clinician/create-chair-request'
*/
createChairRequestForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: createChairRequest.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

createChairRequest.form = createChairRequestForm

/**
* @see \App\Http\Controllers\ClinicianController::storeChairRequest
* @see app/Http/Controllers/ClinicianController.php:159
* @route '/clinician/store-chair-request'
*/
export const storeChairRequest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeChairRequest.url(options),
    method: 'post',
})

storeChairRequest.definition = {
    methods: ["post"],
    url: '/clinician/store-chair-request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicianController::storeChairRequest
* @see app/Http/Controllers/ClinicianController.php:159
* @route '/clinician/store-chair-request'
*/
storeChairRequest.url = (options?: RouteQueryOptions) => {
    return storeChairRequest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicianController::storeChairRequest
* @see app/Http/Controllers/ClinicianController.php:159
* @route '/clinician/store-chair-request'
*/
storeChairRequest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeChairRequest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicianController::storeChairRequest
* @see app/Http/Controllers/ClinicianController.php:159
* @route '/clinician/store-chair-request'
*/
const storeChairRequestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeChairRequest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicianController::storeChairRequest
* @see app/Http/Controllers/ClinicianController.php:159
* @route '/clinician/store-chair-request'
*/
storeChairRequestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeChairRequest.url(options),
    method: 'post',
})

storeChairRequest.form = storeChairRequestForm

/**
* @see \App\Http\Controllers\ClinicianController::requestTracker
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
export const requestTracker = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: requestTracker.url(options),
    method: 'get',
})

requestTracker.definition = {
    methods: ["get","head"],
    url: '/clinician/request-tracker',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicianController::requestTracker
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
requestTracker.url = (options?: RouteQueryOptions) => {
    return requestTracker.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicianController::requestTracker
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
requestTracker.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: requestTracker.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::requestTracker
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
requestTracker.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: requestTracker.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicianController::requestTracker
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
const requestTrackerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: requestTracker.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::requestTracker
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
requestTrackerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: requestTracker.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::requestTracker
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
requestTrackerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: requestTracker.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

requestTracker.form = requestTrackerForm

const clinician = {
    home: Object.assign(home, home),
    createChairRequest: Object.assign(createChairRequest, createChairRequest),
    storeChairRequest: Object.assign(storeChairRequest, storeChairRequest),
    requestTracker: Object.assign(requestTracker, requestTracker),
}

export default clinician