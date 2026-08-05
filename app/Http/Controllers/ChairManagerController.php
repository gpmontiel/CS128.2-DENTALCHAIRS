<?php

namespace App\Http\Controllers;

use App\Models\ChairManagerAssignment;
use App\Models\DentalChairRequest;
use App\Models\Notification;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChairManagerController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();

        $rooms = Room::with('sections')->orderBy('room_name')->get();

        $baseQuery = ChairManagerAssignment::with(['section.room'])
            ->where('clinician_id', $user->id); // Note: Clinician model uses user_id

        $pendingRequests = (clone $baseQuery)
            ->where('status', 'Pending')
            ->whereDate('date', '>=', $today)
            ->orderBy('date')
            ->get();

        $activeAssignments = (clone $baseQuery)
            ->where('status', 'Confirmed')
            ->whereDate('date', '>=', $today)
            ->orderBy('date')
            ->get();

        $historyData = (clone $baseQuery)
            ->orderByDesc('date')
            ->limit(3)
            ->get();

        return Inertia::render('chair-manager/home', [
            'rooms' => $rooms,
            'pendingRequests' => $pendingRequests,
            'assignmentData' => $activeAssignments,
            'historyData' => $historyData,
            'isChairManager' => $activeAssignments->count() > 0,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'shift' => 'required|string|in:AM,PM',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $user = Auth::user();

        // 1. Check if the slot is already taken by someone else
        $slotTaken = ChairManagerAssignment::where('section_id', $validated['section_id'])
            ->whereDate('date', $validated['date'])
            ->where('shift', $validated['shift'])
            ->whereIn('status', ['Accepted', 'Confirmed'])
            ->exists();

        if ($slotTaken) {
            return back()->with('error', 'A chair manager is already assigned for this section, date, and shift.');
        }

        // 2. Check if the current user already has a shift that day
        $userExistingShift = ChairManagerAssignment::where('clinician_id', $user->id)
            ->where('section_id', $validated['section_id'])
            ->whereDate('date', $validated['date'])
            ->whereIn('status', ['Pending', 'Accepted', 'Confirmed'])
            ->first();

        if ($userExistingShift) {
            return back()->with('error', "You can only have one shift per section per day. Existing: {$userExistingShift->shift}.");
        }

        $hasDentalChairConflict = DentalChairRequest::where('clinician_id', $user->id)
            ->where('section_id', $validated['section_id'])
            ->whereDate('date', $validated['date'])
            ->where('shift', $validated['shift'])
            ->whereIn('status', ['Pending', 'Accepted'])
            ->exists();

        if ($hasDentalChairConflict) {
            return back()->with('error', 'Schedule conflict: You already have a Dental Chair assignment for this date and shift.');
        }

        // 3. Create the assignment
        $assignment = ChairManagerAssignment::create([
            'clinician_id' => $user->id,
            'section_id' => $validated['section_id'],
            'shift' => $validated['shift'],
            'date' => $validated['date'],
            'status' => 'Pending',
        ]);

        // 4. Notify Clinical Admins
        $admins = User::where('role_id', 1)->get();
        $prettyDate = Carbon::parse($validated['date'])->format('F j, Y');
        $section = $assignment->section;

        $notifications = $admins->map(function ($admin) use ($user, $prettyDate, $validated, $section) {
            return [
                'user_id' => $admin->id,
                'type' => 'incoming_request',
                'title' => 'Request for Chair Manager',
                'message' => "{$user->name} requested to be a chair manager for {$prettyDate} ({$validated['shift']}) on {$section->section_name}. Please review.",
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        Notification::insert($notifications);

        return back()->with('success', 'Request submitted successfully!');
    }

    public function cancelRequest(ChairManagerAssignment $assignment)
    {
        $user = Auth::user();

        if ($assignment->clinician_id !== $user->id) {
            abort(403);
        }

        $assignment->update(['status' => 'Cancelled']);

        $admins = User::where('role_id', 1)->get();
        $prettyDate = Carbon::parse($assignment->date)->format('F j, Y');
        $sectionName = $assignment->section->section_name;

        $notifications = $admins->map(function ($admin) use ($user, $prettyDate, $assignment, $sectionName) {
            return [
                'user_id' => $admin->id,
                'type' => 'cancelled_request',
                'title' => 'Chair Manager Request Cancelled',
                'message' => "{$user->name} cancelled their request for {$prettyDate} ({$assignment->shift}) on {$sectionName}.",
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        Notification::insert($notifications);

        return back()->with('success', 'Request cancelled successfully.');
    }

    public function history()
    {
        $user = Auth::user();

        $history = ChairManagerAssignment::with(['section.room'])
            ->where('clinician_id', $user->id)
            ->orderByDesc('date')
            ->get();

        return Inertia::render('chair-manager/history', [
            'history' => $history,
        ]);
    }

    public function requestDetails($id)
    {
        $assignment = ChairManagerAssignment::with('section.room')->findOrFail($id);

        $requests = DentalChairRequest::with([
            'clinician.user',
            'clinician.studentGroup',
            'assistant.user',
        ])
            ->where('section_id', $assignment->section_id)
            ->where('date', $assignment->date->format('Y-m-d'))
            ->where('shift', $assignment->shift)
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('chair-manager/request-details', [
            'assignment' => [
                'id' => $assignment->id,
                'date' => $assignment->date->format('Y-m-d'),
                'shift' => $assignment->shift,
                'section' => $assignment->section->section_name ?? 'Unknown',
                'room' => $assignment->section->room->room_name ?? 'Unknown',
            ],
            'totalSeats' => $assignment->section->chair_count ?? 0,
            'requestCount' => $requests->count(),
            'requestList' => $requests->map(function ($req) {
                return [
                    'id' => $req->id,
                    'student_id' => $req->clinician_id,
                    'student_name' => $req->clinician->user->name ?? 'Unknown Student',
                    'pfp' => $req->clinician->user->pfp ?? null,
                    'student_group' => $req->clinician->studentGroup->group_name ?? 'No Group',
                    'assistant_name' => $req->assistant ? ($req->assistant->user->name ?? '') : null,
                    'created_at' => $req->created_at,
                    'status' => $req->status,
                    'chair_number' => $req->chair_number,
                ];
            }),
        ]);
    }

    public function manageRequests($id)
    {
        $assignment = ChairManagerAssignment::with('section.room')->findOrFail($id);
        $totalSeats = $assignment->section->chair_count ?? 0;

        $requests = DentalChairRequest::with([
            'clinician.user',
            'clinician.studentGroup',
            'assistant.user',
        ])
            ->where('section_id', $assignment->section_id)
            ->where('date', $assignment->date->format('Y-m-d'))
            ->where('shift', $assignment->shift)
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('chair-manager/manage-requests', [
            'assignment' => [
                'id' => $assignment->id,
                'date' => $assignment->date->format('Y-m-d'),
                'shift' => $assignment->shift,
                'section' => $assignment->section->section_name ?? 'Unknown',
                'room' => $assignment->section->room->room_name ?? 'Unknown',
            ],
            'totalSeats' => $totalSeats,
            'requestList' => $requests->map(function ($req) {
                return [
                    'id' => $req->id,
                    'student_id' => $req->clinician_id,
                    'student_name' => $req->clinician->user->name ?? 'Unknown Student',
                    'pfp' => $req->clinician->user->pfp ?? null,
                    'student_group' => $req->clinician->studentGroup->group_name ?? 'No Group',
                    'assistant_name' => $req->assistant ? ($req->assistant->user->name ?? '') : null,
                    'created_at' => $req->created_at,
                    'status' => $req->status,
                    'chair_number' => $req->chair_number,
                ];
            }),
        ]);
    }

    public function updateRequestStatus(Request $request, $assignmentId, $requestId)
    {
        $validated = $request->validate([
            'action' => 'required|in:accept,reject',
        ]);

        $chairRequest = DentalChairRequest::findOrFail($requestId);
        $assignment = ChairManagerAssignment::with('section')->findOrFail($assignmentId);

        $newStatus = $validated['action'] === 'accept' ? 'Accepted' : 'Rejected';

        // Update the primary request status
        $chairRequest->update(['status' => $newStatus]);

        // Create notification for the student
        $formattedDate = $assignment->date->format('F j, Y');
        Notification::create([
            'user_id' => $chairRequest->clinician_id,
            'title' => "[CL] Chair Request {$newStatus}",
            'message' => $newStatus === 'Accepted'
                ? "Your chair request for {$assignment->section->section_name} - {$assignment->shift} on {$formattedDate} has been approved."
                : "Your chair request for {$assignment->section->section_name} - {$assignment->shift} on {$formattedDate} has been rejected.",
            'type' => strtolower($newStatus),
            'is_read' => false,
        ]);

        // Auto-reject competing requests if a student is accepted to a chair
        if ($validated['action'] === 'accept' && $chairRequest->chair_number) {
            $competingRequests = DentalChairRequest::where('section_id', $assignment->section_id)
                ->where('date', $assignment->date->format('Y-m-d'))
                ->where('shift', $assignment->shift)
                ->where('chair_number', $chairRequest->chair_number)
                ->where('status', 'Pending')
                ->where('id', '!=', $chairRequest->id)
                ->get();

            foreach ($competingRequests as $competing) {
                $competing->update(['status' => 'Rejected']);

                Notification::create([
                    'user_id' => $competing->clinician_id,
                    'title' => '[CL] Chair Request Rejected',
                    'message' => "Your chair request for Chair {$chairRequest->chair_number} has been rejected because another student was accepted for this chair.",
                    'type' => 'rejected',
                    'is_read' => false,
                ]);
            }
        }

        return back();
    }
}
