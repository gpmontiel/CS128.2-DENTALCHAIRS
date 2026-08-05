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

class ClinicianController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $schedules = DentalChairRequest::with([
            'section.room',
            'assistant.user',
        ])
            ->where('clinician_id', $userId)
            ->whereIn('status', ['Accepted', 'Cancelled'])
            ->orderBy('date', 'asc')
            ->orderBy('shift', 'asc')
            ->get();

        $clinicians = User::where('role_id', 3)
            ->where('id', '!=', $userId)
            ->select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('clinician/home', [
            'schedules' => $schedules,
            'clinicians' => $clinicians,
        ]);
    }

    public function getAvailableClinicians(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'shift' => 'required|string',
            'section_id' => 'required|integer',
        ]);

        $busyUserIds = DentalChairRequest::where('date', $request->date)
            ->where('shift', $request->shift)
            ->where('section_id', $request->section_id)
            ->where('status', 'Accepted')
            ->get()
            ->flatMap(function ($req) {
                return [$req->clinician_id, $req->assistant_id];
            })
            ->filter()
            ->unique();

        $availableClinicians = User::where('role_id', 3)
            ->where('id', '!=', auth()->id())
            ->whereNotIn('id', $busyUserIds)
            ->select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($availableClinicians);
    }

    public function editAssistant(Request $request)
    {
        $request->validate([
            'request_id' => 'required|integer',
            'assistant_id' => 'required|exists:users,id',
        ]);

        DentalChairRequest::findOrFail($request->request_id)
            ->update(['assistant_id' => $request->assistant_id]);

        return back()->with('success', 'Assistant updated successfully!');
    }

    public function cancelSchedule(Request $request)
    {
        $request->validate([
            'request_id' => 'required|integer',
            'cancel_reason' => 'required|string',
        ]);

        $schedule = DentalChairRequest::with('section')->findOrFail($request->request_id);
        $schedule->update(['status' => 'Cancelled']);

        if ($schedule->chair_number) {
            $competingRequests = DentalChairRequest::where('section_id', $schedule->section_id)
                ->where('date', $schedule->date->format('Y-m-d'))
                ->where('shift', $schedule->shift)
                ->where('chair_number', $schedule->chair_number)
                ->where('status', 'Rejected')
                ->get();

            foreach ($competingRequests as $competing) {
                $competing->update(['status' => 'Pending']);

                Notification::create([
                    'user_id' => $competing->clinician_id,
                    'title' => '[CL] Chair Request Update',
                    'message' => "The chair you requested (Chair {$schedule->chair_number}) has become available due to a cancellation. Your request is back in the pending queue.",
                    'type' => 'pending',
                    'is_read' => false,
                ]);
            }
        }

        $chairManager = ChairManagerAssignment::where('date', $schedule->date->format('Y-m-d'))
            ->where('section_id', $schedule->section_id)
            ->where('shift', $schedule->shift)
            ->first();

        if ($chairManager) {
            $formattedDate = $schedule->date->format('F j, Y');
            $sectionName = $schedule->section->section_name ?? 'Unknown Section';
            $userName = auth()->user()->name;

            Notification::create([
                'user_id' => $chairManager->clinician_id,
                'type' => 'cancellation',
                'title' => '[CM] Schedule Cancellation',
                'message' => "$userName cancelled their schedule for {$sectionName} - {$schedule->shift} shift on {$formattedDate}. Reason: {$request->cancel_reason}",
                'is_read' => false,
            ]);
        }

        return back()->with('success', 'Schedule cancelled successfully!');
    }

    public function createChairRequest(Request $request)
    {
        $rooms = Room::with('sections')->orderBy('room_name')->get();

        $occupiedChairs = [];

        if ($request->filled(['date', 'shift', 'section_id'])) {
            $occupiedChairs = DentalChairRequest::where('date', $request->date)
                ->where('shift', $request->shift)
                ->where('section_id', $request->section_id)
                ->where('status', 'Accepted')
                ->pluck('chair_number')
                ->toArray();
        }

        return Inertia::render('clinician/create-chair-request', [
            'rooms' => $rooms,
            'occupiedChairs' => $occupiedChairs,
        ]);
    }

    public function storeChairRequest(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'shift' => 'required|in:AM,PM',
            'section_id' => 'required|exists:sections,id',
            'chair_number' => 'required|integer',
        ]);

        $isChairManager = ChairManagerAssignment::where('clinician_id', Auth::id())
            ->where('date', $validated['date'])
            ->where('shift', $validated['shift'])
            ->where('section_id', $validated['section_id'])
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->exists();

        if ($isChairManager) {
            return redirect()->back()->withErrors([
                'chair_number' => 'Cannot request a dental chair. You have a pending or accepted Chair Manager assignment for this section during this shift.',
            ]);
        }

        DentalChairRequest::create([
            'clinician_id' => Auth::id(),
            'section_id' => $validated['section_id'],
            'shift' => $validated['shift'],
            'date' => $validated['date'],
            'chair_number' => $validated['chair_number'],
            'status' => 'Pending',
        ]);

        $chairManager = ChairManagerAssignment::where('date', $validated['date'])
            ->where('shift', $validated['shift'])
            ->where('section_id', $validated['section_id'])
            ->first();

        if ($chairManager) {
            $formattedDate = Carbon::parse($validated['date'])->format('F j, Y');
            $studentName = Auth::user()->name;

            Notification::create([
                'user_id' => $chairManager->clinician_id,
                'type' => 'request',
                'title' => '[CM] New Chair Request',
                'message' => "{$studentName} requested Dental Chair #{$validated['chair_number']} for the {$validated['shift']} shift on {$formattedDate}.",
                'is_read' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Request submitted successfully!');
    }

    public function trackRequest()
    {
        $schedules = DentalChairRequest::with('section.room')
            ->where('clinician_id', Auth::id())
            ->orderBy('date', 'asc')
            ->orderBy('shift', 'asc')
            ->get();

        return Inertia::render('clinician/request-tracker', [
            'schedules' => $schedules,
        ]);
    }
}
