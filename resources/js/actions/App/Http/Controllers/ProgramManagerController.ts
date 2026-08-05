import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
const manageReports8ffeeb7f1213c8d00afb12f1b784ecc0 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.url(options),
    method: 'get',
})

manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.definition = {
    methods: ["get","head"],
    url: '/admin/manage-reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.url = (options?: RouteQueryOptions) => {
    return manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
const manageReports8ffeeb7f1213c8d00afb12f1b784ecc0Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReports8ffeeb7f1213c8d00afb12f1b784ecc0Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/admin/manage-reports'
*/
manageReports8ffeeb7f1213c8d00afb12f1b784ecc0Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manageReports8ffeeb7f1213c8d00afb12f1b784ecc0.form = manageReports8ffeeb7f1213c8d00afb12f1b784ecc0Form
/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
const manageReports6b378ffa107fd601648f825b9c5d398b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageReports6b378ffa107fd601648f825b9c5d398b.url(options),
    method: 'get',
})

manageReports6b378ffa107fd601648f825b9c5d398b.definition = {
    methods: ["get","head"],
    url: '/manager/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
manageReports6b378ffa107fd601648f825b9c5d398b.url = (options?: RouteQueryOptions) => {
    return manageReports6b378ffa107fd601648f825b9c5d398b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
manageReports6b378ffa107fd601648f825b9c5d398b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manageReports6b378ffa107fd601648f825b9c5d398b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
manageReports6b378ffa107fd601648f825b9c5d398b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manageReports6b378ffa107fd601648f825b9c5d398b.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
const manageReports6b378ffa107fd601648f825b9c5d398bForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageReports6b378ffa107fd601648f825b9c5d398b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
manageReports6b378ffa107fd601648f825b9c5d398bForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageReports6b378ffa107fd601648f825b9c5d398b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::manageReports
* @see app/Http/Controllers/ProgramManagerController.php:14
* @route '/manager/home'
*/
manageReports6b378ffa107fd601648f825b9c5d398bForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manageReports6b378ffa107fd601648f825b9c5d398b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manageReports6b378ffa107fd601648f825b9c5d398b.form = manageReports6b378ffa107fd601648f825b9c5d398bForm

/**
* Multiple routes resolve to \App\Http\Controllers\ProgramManagerController::manageReports, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `manageReports['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const manageReports = {
    '/admin/manage-reports': manageReports8ffeeb7f1213c8d00afb12f1b784ecc0,
    '/manager/home': manageReports6b378ffa107fd601648f825b9c5d398b,
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/admin/manage-reports/students/{id}/attendance'
*/
const getStudentAttendance7247bb85f9f9e614428e87f392e02c03 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStudentAttendance7247bb85f9f9e614428e87f392e02c03.url(args, options),
    method: 'get',
})

getStudentAttendance7247bb85f9f9e614428e87f392e02c03.definition = {
    methods: ["get","head"],
    url: '/admin/manage-reports/students/{id}/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/admin/manage-reports/students/{id}/attendance'
*/
getStudentAttendance7247bb85f9f9e614428e87f392e02c03.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getStudentAttendance7247bb85f9f9e614428e87f392e02c03.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/admin/manage-reports/students/{id}/attendance'
*/
getStudentAttendance7247bb85f9f9e614428e87f392e02c03.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStudentAttendance7247bb85f9f9e614428e87f392e02c03.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/admin/manage-reports/students/{id}/attendance'
*/
getStudentAttendance7247bb85f9f9e614428e87f392e02c03.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getStudentAttendance7247bb85f9f9e614428e87f392e02c03.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/admin/manage-reports/students/{id}/attendance'
*/
const getStudentAttendance7247bb85f9f9e614428e87f392e02c03Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getStudentAttendance7247bb85f9f9e614428e87f392e02c03.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/admin/manage-reports/students/{id}/attendance'
*/
getStudentAttendance7247bb85f9f9e614428e87f392e02c03Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getStudentAttendance7247bb85f9f9e614428e87f392e02c03.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/admin/manage-reports/students/{id}/attendance'
*/
getStudentAttendance7247bb85f9f9e614428e87f392e02c03Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getStudentAttendance7247bb85f9f9e614428e87f392e02c03.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

getStudentAttendance7247bb85f9f9e614428e87f392e02c03.form = getStudentAttendance7247bb85f9f9e614428e87f392e02c03Form
/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/manager/manage-reports/students/{id}/attendance'
*/
const getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.url(args, options),
    method: 'get',
})

getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.definition = {
    methods: ["get","head"],
    url: '/manager/manage-reports/students/{id}/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/manager/manage-reports/students/{id}/attendance'
*/
getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/manager/manage-reports/students/{id}/attendance'
*/
getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/manager/manage-reports/students/{id}/attendance'
*/
getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/manager/manage-reports/students/{id}/attendance'
*/
const getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/manager/manage-reports/students/{id}/attendance'
*/
getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getStudentAttendance
* @see app/Http/Controllers/ProgramManagerController.php:58
* @route '/manager/manage-reports/students/{id}/attendance'
*/
getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0.form = getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0Form

/**
* Multiple routes resolve to \App\Http\Controllers\ProgramManagerController::getStudentAttendance, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `getStudentAttendance['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const getStudentAttendance = {
    '/admin/manage-reports/students/{id}/attendance': getStudentAttendance7247bb85f9f9e614428e87f392e02c03,
    '/manager/manage-reports/students/{id}/attendance': getStudentAttendance5fa1763a26fabea7c5f2f6c7c2bf3bb0,
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/admin/manage-reports/export/group/{groupId}'
*/
const getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4 = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.url(args, options),
    method: 'get',
})

getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.definition = {
    methods: ["get","head"],
    url: '/admin/manage-reports/export/group/{groupId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/admin/manage-reports/export/group/{groupId}'
*/
getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.url = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { groupId: args }
    }

    if (Array.isArray(args)) {
        args = {
            groupId: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        groupId: args.groupId,
    }

    return getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.definition.url
            .replace('{groupId}', parsedArgs.groupId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/admin/manage-reports/export/group/{groupId}'
*/
getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.get = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/admin/manage-reports/export/group/{groupId}'
*/
getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.head = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/admin/manage-reports/export/group/{groupId}'
*/
const getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4Form = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/admin/manage-reports/export/group/{groupId}'
*/
getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4Form.get = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/admin/manage-reports/export/group/{groupId}'
*/
getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4Form.head = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4.form = getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4Form
/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/manager/manage-reports/export/group/{groupId}'
*/
const getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.url(args, options),
    method: 'get',
})

getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.definition = {
    methods: ["get","head"],
    url: '/manager/manage-reports/export/group/{groupId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/manager/manage-reports/export/group/{groupId}'
*/
getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.url = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { groupId: args }
    }

    if (Array.isArray(args)) {
        args = {
            groupId: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        groupId: args.groupId,
    }

    return getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.definition.url
            .replace('{groupId}', parsedArgs.groupId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/manager/manage-reports/export/group/{groupId}'
*/
getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.get = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/manager/manage-reports/export/group/{groupId}'
*/
getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.head = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/manager/manage-reports/export/group/{groupId}'
*/
const getGroupAttendance8453f206125d0e870ebb3c8986fc2fccForm = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/manager/manage-reports/export/group/{groupId}'
*/
getGroupAttendance8453f206125d0e870ebb3c8986fc2fccForm.get = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getGroupAttendance
* @see app/Http/Controllers/ProgramManagerController.php:86
* @route '/manager/manage-reports/export/group/{groupId}'
*/
getGroupAttendance8453f206125d0e870ebb3c8986fc2fccForm.head = (args: { groupId: string | number } | [groupId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc.form = getGroupAttendance8453f206125d0e870ebb3c8986fc2fccForm

/**
* Multiple routes resolve to \App\Http\Controllers\ProgramManagerController::getGroupAttendance, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `getGroupAttendance['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const getGroupAttendance = {
    '/admin/manage-reports/export/group/{groupId}': getGroupAttendance4caa4167a016a0ffbb2e0ecfc23736b4,
    '/manager/manage-reports/export/group/{groupId}': getGroupAttendance8453f206125d0e870ebb3c8986fc2fcc,
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/admin/manage-reports/export/chair/{roomId}'
*/
const getChairUsage7b65bef0470ce1f93224f0e1a4b8f948 = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.url(args, options),
    method: 'get',
})

getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.definition = {
    methods: ["get","head"],
    url: '/admin/manage-reports/export/chair/{roomId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/admin/manage-reports/export/chair/{roomId}'
*/
getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.url = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.definition.url
            .replace('{roomId}', parsedArgs.roomId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/admin/manage-reports/export/chair/{roomId}'
*/
getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.get = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/admin/manage-reports/export/chair/{roomId}'
*/
getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.head = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/admin/manage-reports/export/chair/{roomId}'
*/
const getChairUsage7b65bef0470ce1f93224f0e1a4b8f948Form = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/admin/manage-reports/export/chair/{roomId}'
*/
getChairUsage7b65bef0470ce1f93224f0e1a4b8f948Form.get = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/admin/manage-reports/export/chair/{roomId}'
*/
getChairUsage7b65bef0470ce1f93224f0e1a4b8f948Form.head = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

getChairUsage7b65bef0470ce1f93224f0e1a4b8f948.form = getChairUsage7b65bef0470ce1f93224f0e1a4b8f948Form
/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/manager/manage-reports/export/chair/{roomId}'
*/
const getChairUsage8eb505750c8480f4872d5cf997da96c3 = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getChairUsage8eb505750c8480f4872d5cf997da96c3.url(args, options),
    method: 'get',
})

getChairUsage8eb505750c8480f4872d5cf997da96c3.definition = {
    methods: ["get","head"],
    url: '/manager/manage-reports/export/chair/{roomId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/manager/manage-reports/export/chair/{roomId}'
*/
getChairUsage8eb505750c8480f4872d5cf997da96c3.url = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getChairUsage8eb505750c8480f4872d5cf997da96c3.definition.url
            .replace('{roomId}', parsedArgs.roomId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/manager/manage-reports/export/chair/{roomId}'
*/
getChairUsage8eb505750c8480f4872d5cf997da96c3.get = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getChairUsage8eb505750c8480f4872d5cf997da96c3.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/manager/manage-reports/export/chair/{roomId}'
*/
getChairUsage8eb505750c8480f4872d5cf997da96c3.head = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getChairUsage8eb505750c8480f4872d5cf997da96c3.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/manager/manage-reports/export/chair/{roomId}'
*/
const getChairUsage8eb505750c8480f4872d5cf997da96c3Form = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getChairUsage8eb505750c8480f4872d5cf997da96c3.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/manager/manage-reports/export/chair/{roomId}'
*/
getChairUsage8eb505750c8480f4872d5cf997da96c3Form.get = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getChairUsage8eb505750c8480f4872d5cf997da96c3.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:127
* @route '/manager/manage-reports/export/chair/{roomId}'
*/
getChairUsage8eb505750c8480f4872d5cf997da96c3Form.head = (args: { roomId: string | number } | [roomId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getChairUsage8eb505750c8480f4872d5cf997da96c3.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

getChairUsage8eb505750c8480f4872d5cf997da96c3.form = getChairUsage8eb505750c8480f4872d5cf997da96c3Form

/**
* Multiple routes resolve to \App\Http\Controllers\ProgramManagerController::getChairUsage, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `getChairUsage['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const getChairUsage = {
    '/admin/manage-reports/export/chair/{roomId}': getChairUsage7b65bef0470ce1f93224f0e1a4b8f948,
    '/manager/manage-reports/export/chair/{roomId}': getChairUsage8eb505750c8480f4872d5cf997da96c3,
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/admin/manage-reports/export/all-chair'
*/
const getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.url(options),
    method: 'get',
})

getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.definition = {
    methods: ["get","head"],
    url: '/admin/manage-reports/export/all-chair',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/admin/manage-reports/export/all-chair'
*/
getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.url = (options?: RouteQueryOptions) => {
    return getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/admin/manage-reports/export/all-chair'
*/
getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/admin/manage-reports/export/all-chair'
*/
getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/admin/manage-reports/export/all-chair'
*/
const getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6adForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/admin/manage-reports/export/all-chair'
*/
getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6adForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/admin/manage-reports/export/all-chair'
*/
getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6adForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad.form = getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6adForm
/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/manager/manage-reports/export/all-chair'
*/
const getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.url(options),
    method: 'get',
})

getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.definition = {
    methods: ["get","head"],
    url: '/manager/manage-reports/export/all-chair',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/manager/manage-reports/export/all-chair'
*/
getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.url = (options?: RouteQueryOptions) => {
    return getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/manager/manage-reports/export/all-chair'
*/
getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/manager/manage-reports/export/all-chair'
*/
getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/manager/manage-reports/export/all-chair'
*/
const getAllChairUsage3d7db8bfbee383ae7931d44929f2f30bForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/manager/manage-reports/export/all-chair'
*/
getAllChairUsage3d7db8bfbee383ae7931d44929f2f30bForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProgramManagerController::getAllChairUsage
* @see app/Http/Controllers/ProgramManagerController.php:154
* @route '/manager/manage-reports/export/all-chair'
*/
getAllChairUsage3d7db8bfbee383ae7931d44929f2f30bForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b.form = getAllChairUsage3d7db8bfbee383ae7931d44929f2f30bForm

/**
* Multiple routes resolve to \App\Http\Controllers\ProgramManagerController::getAllChairUsage, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `getAllChairUsage['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const getAllChairUsage = {
    '/admin/manage-reports/export/all-chair': getAllChairUsage11d12f8b86deb1060ecfe5b1ac48a6ad,
    '/manager/manage-reports/export/all-chair': getAllChairUsage3d7db8bfbee383ae7931d44929f2f30b,
}

const ProgramManagerController = { manageReports, getStudentAttendance, getGroupAttendance, getChairUsage, getAllChairUsage }

export default ProgramManagerController