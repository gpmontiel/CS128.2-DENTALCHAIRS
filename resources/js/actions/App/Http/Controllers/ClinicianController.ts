import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ClinicianController::index
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/clinician/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicianController::index
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicianController::index
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::index
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicianController::index
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::index
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::index
* @see app/Http/Controllers/ClinicianController.php:17
* @route '/clinician/home'
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
* @see \App\Http\Controllers\ClinicianController::getAvailableClinicians
* @see app/Http/Controllers/ClinicianController.php:43
* @route '/clinician/available-assistants'
*/
export const getAvailableClinicians = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAvailableClinicians.url(options),
    method: 'get',
})

getAvailableClinicians.definition = {
    methods: ["get","head"],
    url: '/clinician/available-assistants',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicianController::getAvailableClinicians
* @see app/Http/Controllers/ClinicianController.php:43
* @route '/clinician/available-assistants'
*/
getAvailableClinicians.url = (options?: RouteQueryOptions) => {
    return getAvailableClinicians.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicianController::getAvailableClinicians
* @see app/Http/Controllers/ClinicianController.php:43
* @route '/clinician/available-assistants'
*/
getAvailableClinicians.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAvailableClinicians.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::getAvailableClinicians
* @see app/Http/Controllers/ClinicianController.php:43
* @route '/clinician/available-assistants'
*/
getAvailableClinicians.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAvailableClinicians.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicianController::getAvailableClinicians
* @see app/Http/Controllers/ClinicianController.php:43
* @route '/clinician/available-assistants'
*/
const getAvailableCliniciansForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getAvailableClinicians.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::getAvailableClinicians
* @see app/Http/Controllers/ClinicianController.php:43
* @route '/clinician/available-assistants'
*/
getAvailableCliniciansForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getAvailableClinicians.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::getAvailableClinicians
* @see app/Http/Controllers/ClinicianController.php:43
* @route '/clinician/available-assistants'
*/
getAvailableCliniciansForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getAvailableClinicians.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

getAvailableClinicians.form = getAvailableCliniciansForm

/**
* @see \App\Http\Controllers\ClinicianController::editAssistant
* @see app/Http/Controllers/ClinicianController.php:72
* @route '/clinician/edit-assistant'
*/
export const editAssistant = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: editAssistant.url(options),
    method: 'post',
})

editAssistant.definition = {
    methods: ["post"],
    url: '/clinician/edit-assistant',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicianController::editAssistant
* @see app/Http/Controllers/ClinicianController.php:72
* @route '/clinician/edit-assistant'
*/
editAssistant.url = (options?: RouteQueryOptions) => {
    return editAssistant.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicianController::editAssistant
* @see app/Http/Controllers/ClinicianController.php:72
* @route '/clinician/edit-assistant'
*/
editAssistant.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: editAssistant.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicianController::editAssistant
* @see app/Http/Controllers/ClinicianController.php:72
* @route '/clinician/edit-assistant'
*/
const editAssistantForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: editAssistant.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicianController::editAssistant
* @see app/Http/Controllers/ClinicianController.php:72
* @route '/clinician/edit-assistant'
*/
editAssistantForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: editAssistant.url(options),
    method: 'post',
})

editAssistant.form = editAssistantForm

/**
* @see \App\Http\Controllers\ClinicianController::cancelSchedule
* @see app/Http/Controllers/ClinicianController.php:85
* @route '/clinician/cancel-chair-schedule'
*/
export const cancelSchedule = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelSchedule.url(options),
    method: 'post',
})

cancelSchedule.definition = {
    methods: ["post"],
    url: '/clinician/cancel-chair-schedule',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicianController::cancelSchedule
* @see app/Http/Controllers/ClinicianController.php:85
* @route '/clinician/cancel-chair-schedule'
*/
cancelSchedule.url = (options?: RouteQueryOptions) => {
    return cancelSchedule.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicianController::cancelSchedule
* @see app/Http/Controllers/ClinicianController.php:85
* @route '/clinician/cancel-chair-schedule'
*/
cancelSchedule.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelSchedule.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicianController::cancelSchedule
* @see app/Http/Controllers/ClinicianController.php:85
* @route '/clinician/cancel-chair-schedule'
*/
const cancelScheduleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancelSchedule.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicianController::cancelSchedule
* @see app/Http/Controllers/ClinicianController.php:85
* @route '/clinician/cancel-chair-schedule'
*/
cancelScheduleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancelSchedule.url(options),
    method: 'post',
})

cancelSchedule.form = cancelScheduleForm

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
* @see \App\Http\Controllers\ClinicianController::trackRequest
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
export const trackRequest = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trackRequest.url(options),
    method: 'get',
})

trackRequest.definition = {
    methods: ["get","head"],
    url: '/clinician/request-tracker',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ClinicianController::trackRequest
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
trackRequest.url = (options?: RouteQueryOptions) => {
    return trackRequest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicianController::trackRequest
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
trackRequest.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trackRequest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::trackRequest
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
trackRequest.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: trackRequest.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ClinicianController::trackRequest
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
const trackRequestForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: trackRequest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::trackRequest
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
trackRequestForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: trackRequest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ClinicianController::trackRequest
* @see app/Http/Controllers/ClinicianController.php:211
* @route '/clinician/request-tracker'
*/
trackRequestForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: trackRequest.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

trackRequest.form = trackRequestForm

const ClinicianController = { index, getAvailableClinicians, editAssistant, cancelSchedule, createChairRequest, storeChairRequest, trackRequest }

export default ClinicianController