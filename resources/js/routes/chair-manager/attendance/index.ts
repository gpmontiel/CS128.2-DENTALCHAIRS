import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ClinicalAdminController::mark
* @see app/Http/Controllers/ClinicalAdminController.php:153
* @route '/admin/attendance/mark'
*/
export const mark = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mark.url(options),
    method: 'post',
})

mark.definition = {
    methods: ["post"],
    url: '/admin/attendance/mark',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::mark
* @see app/Http/Controllers/ClinicalAdminController.php:153
* @route '/admin/attendance/mark'
*/
mark.url = (options?: RouteQueryOptions) => {
    return mark.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::mark
* @see app/Http/Controllers/ClinicalAdminController.php:153
* @route '/admin/attendance/mark'
*/
mark.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mark.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::mark
* @see app/Http/Controllers/ClinicalAdminController.php:153
* @route '/admin/attendance/mark'
*/
const markForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: mark.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::mark
* @see app/Http/Controllers/ClinicalAdminController.php:153
* @route '/admin/attendance/mark'
*/
markForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: mark.url(options),
    method: 'post',
})

mark.form = markForm

/**
* @see \App\Http\Controllers\ClinicalAdminController::manual
* @see app/Http/Controllers/ClinicalAdminController.php:188
* @route '/admin/attendance/manual'
*/
export const manual = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: manual.url(options),
    method: 'post',
})

manual.definition = {
    methods: ["post"],
    url: '/admin/attendance/manual',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ClinicalAdminController::manual
* @see app/Http/Controllers/ClinicalAdminController.php:188
* @route '/admin/attendance/manual'
*/
manual.url = (options?: RouteQueryOptions) => {
    return manual.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ClinicalAdminController::manual
* @see app/Http/Controllers/ClinicalAdminController.php:188
* @route '/admin/attendance/manual'
*/
manual.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: manual.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manual
* @see app/Http/Controllers/ClinicalAdminController.php:188
* @route '/admin/attendance/manual'
*/
const manualForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: manual.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ClinicalAdminController::manual
* @see app/Http/Controllers/ClinicalAdminController.php:188
* @route '/admin/attendance/manual'
*/
manualForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: manual.url(options),
    method: 'post',
})

manual.form = manualForm

const attendance = {
    mark: Object.assign(mark, mark),
    manual: Object.assign(manual, manual),
}

export default attendance