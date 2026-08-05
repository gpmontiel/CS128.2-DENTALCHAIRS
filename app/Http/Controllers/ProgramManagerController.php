<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Clinician;
use App\Models\Room;
use App\Models\StudentGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramManagerController extends Controller
{
    public function manageReports()
    {
        $studentGroups = StudentGroup::select('id', 'group_name as name')->orderBy('group_name')->get();

        $students = Clinician::with(['user', 'studentGroup'])
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->user_id,
                    'name' => $c->user->name ?? 'Unknown Student',
                    'pfpUrl' => $c->user->pfp ?? null,
                    'student_number' => $c->student_number,
                    'student_group_id' => $c->student_group_id,
                    'group_name' => $c->studentGroup->group_name ?? 'Unassigned',
                ];
            })
            ->sortBy('name')
            ->values();

        $rooms = Room::with('sections')
            ->get()
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'room_name' => $room->room_name,
                    'chair_count' => $room->sections->sum('chair_count'),
                    'sections' => $room->sections->map(function ($section) {
                        return [
                            'id' => $section->id,
                            'name' => $section->section_name,
                        ];
                    })->values(),
                ];
            })
            ->sortBy('room_name')
            ->values();

        return Inertia::render('manager/manage-reports', [
            'students' => $students,
            'studentGroups' => $studentGroups,
            'rooms' => $rooms,
        ]);
    }

    public function getStudentAttendance(Request $request, $id)
    {
        $start = $request->query('start');
        $end = $request->query('end');

        if (! $start || ! $end) {
            return response()->json(['records' => []]);
        }

        $attendances = Attendance::with(['section.room'])
            ->where('clinician_id', $id)
            ->whereDate('date', '>=', $start)
            ->whereDate('date', '<=', $end)
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($attendance) {
                return [
                    'date' => $attendance->date->format('Y-m-d'),
                    'shift' => $attendance->shift,
                    'room_name' => $attendance->section->room->room_name ?? 'N/A',
                    'section_name' => $attendance->section->section_name ?? 'N/A',
                    'status' => $attendance->status,
                ];
            });

        return response()->json(['records' => $attendances]);
    }

    public function getGroupAttendance(Request $request, $groupId)
    {
        $start = $request->query('start');
        $end = $request->query('end');

        if (! $start || ! $end) {
            return response()->json(['records' => []]);
        }

        $attendances = Attendance::with([
            'section.room',
            'clinician.user',
            'clinician.studentGroup',
        ])
            ->whereDate('date', '>=', $start)
            ->whereDate('date', '<=', $end)
            ->where('status', 'Present')
            ->get();

        $records = collect();

        foreach ($attendances as $att) {
            $roomName = $att->section->room->room_name ?? 'N/A';

            $mainClinician = $att->clinician;
            if ($mainClinician) {
                $mainGroupId = $mainClinician->student_group_id;

                if ($groupId === 'all' || $mainGroupId == $groupId) {
                    $records->push([
                        'student_id' => $mainClinician->user_id,
                        'name' => $mainClinician->user->name ?? 'Unknown Student',
                        'room_name' => $roomName,
                    ]);
                }
            }
        }

        return response()->json(['records' => $records]);
    }

    public function getChairUsage(Request $request, $roomId)
    {
        $start = $request->query('start');
        $end = $request->query('end');

        if (! $start || ! $end) {
            return response()->json(['records' => []]);
        }

        $attendances = Attendance::with(['section.room'])
            ->whereHas('section', function ($query) use ($roomId) {
                $query->where('room_id', $roomId);
            })
            ->whereDate('date', '>=', $start)
            ->whereDate('date', '<=', $end)
            ->where('status', 'Present')
            ->where('reason', 'Regular Duty')
            ->get()
            ->map(function ($attendance) {
                $data = $attendance->toArray();
                $data['date'] = $attendance->date ? $attendance->date->format('Y-m-d') : null;
                return $data;
            });

        return response()->json(['records' => $attendances]);
    }

    public function getAllChairUsage(Request $request)
    {
        $start = $request->query('start');
        $end = $request->query('end');

        if (!$start || !$end) {
            return response()->json(['records' => []]);
        }

        $attendances = Attendance::with(['section.room'])
            ->whereDate('date', '>=', $start)
            ->whereDate('date', '<=', $end)
            ->where('status', 'Present')
            ->where('reason', 'Regular Duty')
            ->get()
            ->map(function ($attendance) {
                $data = $attendance->toArray();
                $data['date'] = $attendance->date ? $attendance->date->format('Y-m-d') : null;
                return $data;
            });

        return response()->json(['records' => $attendances]);
    }
}
