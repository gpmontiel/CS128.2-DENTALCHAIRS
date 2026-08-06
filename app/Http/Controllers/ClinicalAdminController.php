<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\ChairManagerAssignment;
use App\Models\Clinician;
use App\Models\DentalChairRequest;
use App\Models\Notification;
use App\Models\Role;
use App\Models\Room;
use App\Models\Section;
use App\Models\StudentGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ClinicalAdminController extends Controller
{
    public function index(Request $request)
    {
        // Get date from query string, default to today
        $date = Carbon::parse($request->input('date', today()->format('Y-m-d')));
        $dateString = $date->format('Y-m-d');

        // 1. Fetch Master Data
        $rooms = Room::select('id', 'room_name')->get();
        $sections = Section::select('id as section_id', 'section_name', 'room_id', 'chair_count')->get();
        $totalChairsCount = $sections->sum('chair_count');

        $students = User::where('role_id', 3)->select('id as profile_id', 'name', 'pfp', 'role_id')->get()->map(function ($user) {
            $parts = explode(' ', $user->name, 2);
            $user->first_name = $parts[0];
            $user->last_name = $parts[1] ?? '';

            return $user;
        });

        $activeChairsCount = DentalChairRequest::where('date', $dateString)
            ->where('status', 'Accepted')
            ->whereHas('attendances', function ($query) {
                $query->where('status', 'Present');
            })
            ->count();

        $presentStudentsCount = Attendance::where('date', $dateString)->where('status', 'Present')->count();

        // 3. Compute Weekly Chart Data (Mon-Fri)
        $startOfWeek = $date->copy()->startOfWeek();
        $endOfWeek = $date->copy()->startOfWeek()->addDays(4);

        $weeklyAttendance = Attendance::whereBetween('date', [$startOfWeek, $endOfWeek])
            ->where('status', 'Present')
            ->get();

        $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        $chartData = collect($days)->mapWithKeys(function ($day) {
            return [$day => ['day' => $day, 'Present' => 0]];
        });

        foreach ($weeklyAttendance as $att) {
            $dayName = Carbon::parse($att->date)->format('D');
            if ($chartData->has($dayName)) {
                $temp = $chartData[$dayName];
                $temp['Present'] += 1;
                $chartData[$dayName] = $temp;
            }
        }

        // 4. Compile the Unified Attendance List (Accepted Requests + Standalone Manual)
        $acceptedRequests = DentalChairRequest::with([
            'clinician.user', 'assistant.user', 'section.room', 'attendances',
        ])->where('date', $dateString)->where('status', 'Accepted')->get();

        $manualAttendances = Attendance::with(['clinician.user', 'section.room'])
            ->where('date', $dateString)
            ->whereNull('dental_chair_request_id')
            ->get();

        $flattenedList = collect();

        foreach ($acceptedRequests as $req) {
            $mainAtt = $req->attendances->where('reason', '!=', 'Assistant')->first();
            $astAtt = $req->attendances->where('reason', 'Assistant')->first();

            $flattenedList->push([
                'request_id' => $req->id,
                'attendance_id' => $mainAtt->id ?? null,
                'shift' => $req->shift,
                'section_name' => $req->section->section_name ?? '',
                'room_id' => $req->section->room_id ?? null,
                'unique_key' => "req-{$req->id}-primary",
                'display_profile' => [
                    'profile_id' => $req->clinician->user->id ?? null,
                    'firstName' => explode(' ', $req->clinician->user->name ?? '')[0],
                    'lastName' => explode(' ', $req->clinician->user->name ?? '', 2)[1] ?? '',
                    'pfp' => $req->clinician->user->pfp ?? null,
                ],
                'current_attendance' => $mainAtt ? $mainAtt->status : null,
                'attendance_reason' => $mainAtt ? $mainAtt->reason : null,
                'isAssistant' => false,
                'assistant' => $req->assistant ? [
                    'attendance_id' => $astAtt->id ?? null,
                    'unique_key' => "req-{$req->id}-assistant",
                    'display_profile' => [
                        'profile_id' => $req->assistant->user->id ?? null,
                        'firstName' => explode(' ', $req->assistant->user->name ?? '')[0],
                        'lastName' => explode(' ', $req->assistant->user->name ?? '', 2)[1] ?? '',
                        'pfp' => $req->assistant->user->pfp ?? null,
                    ],
                    'current_attendance' => $astAtt ? $astAtt->status : null,
                    'attendance_reason' => $astAtt ? $astAtt->reason : null,
                ] : null,
            ]);
        }

        foreach ($manualAttendances as $man) {
            $flattenedList->push([
                'request_id' => null,
                'attendance_id' => $man->id,
                'shift' => $man->shift,
                'section_name' => $man->section->section_name ?? '',
                'room_id' => $man->section->room_id ?? null,
                'unique_key' => "manual-{$man->id}",
                'display_profile' => [
                    'profile_id' => $man->clinician->user->id ?? null,
                    'firstName' => explode(' ', $man->clinician->user->name ?? '')[0],
                    'lastName' => explode(' ', $man->clinician->user->name ?? '', 2)[1] ?? '',
                    'pfp' => $man->clinician->user->pfp ?? null,
                ],
                'current_attendance' => $man->status,
                'attendance_reason' => $man->reason,
                'isAssistant' => false,
                'assistant' => null,
            ]);
        }

        return Inertia::render('admin/home', [
            'currentDate' => $dateString,
            'rooms' => $rooms,
            'sections' => $sections,
            'students' => $students,
            'totalChairsCount' => $totalChairsCount,
            'activeChairsCount' => $activeChairsCount,
            'presentStudentsCount' => $presentStudentsCount,
            'weeklyChartData' => $chartData->values(),
            'attendanceList' => $flattenedList,
        ]);
    }

    public function markAttendance(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'nullable|integer',
            'attendance_id' => 'nullable|integer',
            'status' => 'required|in:Present,Absent',
            'isAssistant' => 'required|boolean',
            'date' => 'required|date',
        ]);

        $reason = $validated['isAssistant'] ? 'Assistant' : 'Regular Duty';

        if ($validated['attendance_id']) {
            Attendance::where('id', $validated['attendance_id'])->update([
                'status' => $validated['status'],
                'reason' => $reason,
            ]);
        } else {
            // Create new record tied to a chair request
            $chairReq = DentalChairRequest::findOrFail($validated['request_id']);

            Attendance::create([
                'dental_chair_request_id' => $chairReq->id,
                'clinician_id' => $validated['isAssistant'] ? $chairReq->assistant_id : $chairReq->clinician_id,
                'section_id' => $chairReq->section_id,
                'date' => $validated['date'],
                'shift' => $chairReq->shift,
                'status' => $validated['status'],
                'reason' => $reason,
            ]);
        }

        return back()->with('success', 'Attendance marked successfully.');
    }

    public function storeManual(Request $request)
    {
        $validated = $request->validate([
            'studentId' => 'required|exists:users,id',
            'sectionId' => 'required|exists:sections,id',
            'date' => 'required|date',
            'shift' => 'required|in:AM,PM',
            'status' => 'required|in:Present,Absent',
            'reason' => 'required|string',
            'customReason' => 'nullable|string',
        ]);

        $finalReason = $validated['reason'] === 'Others' ? $validated['customReason'] : $validated['reason'];

        Attendance::create([
            'clinician_id' => $validated['studentId'],
            'section_id' => $validated['sectionId'],
            'date' => $validated['date'],
            'shift' => $validated['shift'],
            'status' => $validated['status'],
            'reason' => $finalReason,
        ]);

        return back()->with('success', 'Manual attendance added successfully.');
    }

    public function manageManagerRequests(Request $request)
    {
        $filter = $request->input('filter', 'Upcoming');
        $sortBy = $request->input('sortBy', 'created_at');
        $sortDesc = $request->boolean('sortDesc', false);

        $query = ChairManagerAssignment::with([
            'section',
            'clinician.user',
            'clinician.studentGroup',
        ]);

        if ($filter === 'Upcoming') {
            $query->where('status', 'Pending');
        } else {
            // 'AM' or 'PM' Shifts
            $query->where('shift', $filter)
                ->whereIn('status', ['Confirmed', 'Rejected', 'Cancelled']);
        }

        $direction = $sortDesc ? 'desc' : 'asc';
        $query->orderBy($sortBy, $direction);

        $requests = $query->get()->map(function ($assignment) {
            $user = $assignment->clinician->user ?? null;
            $clinician = $assignment->clinician ?? null;
            $group = $clinician->studentGroup ?? null;

            $nameParts = $user ? explode(' ', $user->name, 2) : ['Unknown', 'User'];

            return [
                'assignment_id' => $assignment->id,
                'student_id' => $assignment->clinician_id,
                'section_id' => $assignment->section_id,
                'shift' => $assignment->shift,
                'date' => $assignment->date->format('Y-m-d'),
                'status' => $assignment->status,
                'created_at' => $assignment->created_at->toIso8601String(),
                'section_name' => $assignment->section->section_name ?? 'N/A',
                'profiles' => [
                    'first_name' => $nameParts[0],
                    'last_name' => $nameParts[1] ?? '',
                    'pfp' => $user->pfp ?? null,
                ],
                'group_name' => $group->group_name ?? 'N/A',
                'year_level' => $clinician->year_level ?? 'N/A',
            ];
        });

        return Inertia::render('admin/manage-requests', [
            'requests' => $requests,
            'filters' => [
                'reqFilter' => $filter,
                'sortBy' => $sortBy,
                'sortDesc' => $sortDesc,
            ],
        ]);
    }

    public function updateManagerRequestAction(Request $request, $id)
    {
        $validated = $request->validate([
            'action' => 'required|in:Confirmed,Rejected',
        ]);

        $assignment = ChairManagerAssignment::with('section')->findOrFail($id);
        $action = $validated['action'];

        // 1. Validation Check for Confirmed Actions
        if ($action === 'Confirmed') {
            $exists = ChairManagerAssignment::where('section_id', $assignment->section_id)
                ->where('shift', $assignment->shift)
                ->where('date', $assignment->date->format('Y-m-d'))
                ->where('status', 'Confirmed')
                ->exists();

            if ($exists) {
                return back()->withErrors(['message' => 'Validation Failed: A student has already been accepted for this Section, Shift, and Date!']);
            }
        }

        // 2. Update the assignment status
        $assignment->update(['status' => $action]);

        // 3. Send Notification to the Clinician
        $formattedDate = Carbon::parse($assignment->date)->format('F j, Y');
        $sectionName = $assignment->section->section_name ?? 'your assigned section';
        $shiftType = $assignment->shift;

        $notificationType = $action === 'Confirmed' ? 'accepted' : 'rejected';

        $message = $action === 'Confirmed'
            ? "Your clinical admin accepted your request to be chair manager for {$formattedDate} ({$shiftType}) on {$sectionName}. You can now accept and reject chair requests from clinicians."
            : "Your clinical admin rejected your request to be chair manager for {$formattedDate} ({$shiftType}) on {$sectionName}.";

        Notification::create([
            'user_id' => $assignment->clinician_id,
            'title' => '[CM] Chair Manager Request',
            'message' => $message,
            'type' => $notificationType,
            'is_read' => false,
        ]);

        return back()->with('success', "Request {$action} successfully.");
    }

    public function management()
    {
        $roles = Role::select('id', 'role_name')->orderBy('role_name')->get();
        $studentGroups = StudentGroup::select('id', 'group_name as name')->orderBy('group_name')->get();

        $users = User::with(['role', 'clinician.studentGroup'])
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                $clinician = $user->clinician;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'pfpUrl' => $user->pfp,
                    'role_id' => $user->role_id,
                    'role_name' => $user->role->role_name ?? 'N/A',
                    'clinician' => $clinician ? [
                        'student_group_id' => $clinician->student_group_id,
                        'group_name' => $clinician->studentGroup->group_name ?? 'Unassigned',
                    ] : null,
                ];
            });

        $rooms = Room::with('sections')->get()->map(function ($room) {
            return [
                'room_id' => $room->id,
                'room_name' => $room->room_name,
                'sections' => $room->sections->map(function ($sec) {
                    return [
                        'section_id' => $sec->id,
                        'room_id' => $sec->room_id,
                        'section_name' => $sec->section_name,
                        'chair_count' => $sec->chair_count,
                    ];
                }),
            ];
        });

        return Inertia::render('admin/management', [
            'users' => $users,
            'roles' => $roles,
            'studentGroups' => $studentGroups,
            'rooms' => $rooms,
        ]);
    }

    public function storeUser(Request $request)
    {
        $studentRoleId = 3;

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'role_id' => 'required|exists:roles,id',
            'student_group_id' => 'nullable|exists:student_groups,id',
        ]);

        $user = User::create([
            'email' => $validated['email'],
            'password' => Hash::make('dentrack-vv2'),
            'role_id' => $validated['role_id'],
        ]);

        if ((int) $validated['role_id'] === $studentRoleId) {
            Clinician::create([
                'user_id' => $user->id,
                'student_group_id' => $validated['student_group_id'] ?? null,
            ]);
        }

        return back()->with('success', 'User successfully added!');
    }

    public function reassignStudentGroup(Request $request, $userId)
    {
        $validated = $request->validate([
            'student_group_id' => 'nullable|exists:student_groups,id',
        ]);

        $clinician = Clinician::where('user_id', $userId)->firstOrFail();
        $clinician->update($validated);

        return back()->with('success', 'Student information updated successfully!');
    }

    public function destroyUser($id)
    {
        Clinician::where('user_id', $id)->delete();

        User::findOrFail($id)->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    public function storeRoom(Request $request)
    {
        $validated = $request->validate([
            'room_name' => 'required|string|unique:rooms,room_name',
            'has_custom_section' => 'boolean',
            'section_name' => 'nullable|string',
            'chair_count' => 'required|integer|min:1',
        ]);

        $room = Room::create(['room_name' => $validated['room_name']]);

        $sectionName = ! empty($validated['has_custom_section']) && ! empty($validated['section_name'])
            ? $validated['section_name']
            : $validated['room_name'];

        $room->sections()->create([
            'section_name' => $sectionName,
            'chair_count' => $validated['chair_count'],
        ]);

        return back()->with('success', 'Discipline successfully added!');
    }

    public function updateRoom(Request $request, $id)
    {
        $validated = $request->validate([
            'room_name' => 'required|string|unique:rooms,room_name,'.$id,
        ]);

        Room::findOrFail($id)->update(['room_name' => $validated['room_name']]);

        return back()->with('success', 'Discipline updated successfully!');
    }

    public function destroyRoom($id)
    {
        Room::findOrFail($id)->delete();

        return back()->with('success', 'Discipline deleted successfully.');
    }

    public function storeSection(Request $request, $roomId)
    {
        $validated = $request->validate([
            'section_name' => 'required|string',
            'chair_count' => 'required|integer|min:1',
        ]);

        Section::create([
            'room_id' => $roomId,
            'section_name' => $validated['section_name'],
            'chair_count' => $validated['chair_count'],
        ]);

        return back()->with('success', 'Section created successfully.');
    }

    public function updateSection(Request $request, $id)
    {
        $validated = $request->validate([
            'section_name' => 'required|string',
            'chair_count' => 'required|integer|min:1',
        ]);

        Section::findOrFail($id)->update($validated);

        return back()->with('success', 'Section updated successfully!');
    }

    public function destroySection($id)
    {
        Section::findOrFail($id)->delete();

        return back()->with('success', 'Section deleted successfully.');
    }
}
