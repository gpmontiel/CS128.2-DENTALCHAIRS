<?php

namespace App\Console\Commands;

use App\Models\DentalChairRequest;
use App\Models\Notification;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

#[Signature('app:auto-reject-expired-requests')]
#[Description('Command description')]
class AutoRejectExpiredRequests extends Command
{
    // name and signature of the console command
    protected $signature = 'requests:auto-reject-expired';

    // command description
    protected $description = 'Automatically reject pending chair requests whose scheduled date has passed.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Find all 'Pending' requests where the date is strictly before today
        $expiredRequests = DentalChairRequest::with('section')
            ->where('status', 'Pending')
            ->where('date', '<', Carbon::today()->format('Y-m-d'))
            ->get();

        $count = 0;

        foreach ($expiredRequests as $request) {
            // 1. Update status to Rejected
            $request->update(['status' => 'Rejected']);

            // 2. Notify the student
            $formattedDate = $request->date->format('F j, Y');
            $sectionName = $request->section->section_name ?? 'Unknown Section';

            Notification::create([
                'user_id' => $request->clinician_id,
                'title' => '[CL] Chair Request Expired',
                'message' => "Your chair request for {$sectionName} - {$request->shift} on {$formattedDate} was automatically rejected because the date has passed.",
                'type' => 'rejected',
                'is_read' => false,
            ]);

            $count++;
        }

        $this->info("Successfully auto-rejected {$count} expired requests.");
    }
}
