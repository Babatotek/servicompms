<?php

namespace App\Http\Controllers;

use App\Http\Resources\ContractResource;
use App\Models\KraTemplate;
use App\Models\PerformanceContract;
use App\Services\ContractSnapshotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ContractController extends Controller
{
    public function __construct(private ContractSnapshotService $snapshot) {}

    /** GET /contracts/my/{year} */
    public function mine(int $year)
    {
        $contract = PerformanceContract::with('krasWithTree')
            ->where('user_id', auth()->id())
            ->where('year', $year)
            ->first();

        return $contract
            ? new ContractResource($contract)
            : response()->json(['data' => null]);
    }

    /** POST /contracts */
    public function store(Request $request)
    {
        $data = $request->validate([
            'year'        => 'required|integer|min:2020|max:2099',
            'template_id' => 'required|exists:kra_templates,id',
        ]);

        $existing = PerformanceContract::where('user_id', auth()->id())
            ->where('year', $data['year'])
            ->whereNotIn('status', ['returned'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Contract already exists for this year.'], 409);
        }

        $contract = PerformanceContract::create([
            'user_id'       => auth()->id(),
            'supervisor_id' => auth()->user()->supervisor_id,
            'year'          => $data['year'],
            'template_id'   => $data['template_id'],
            'status'        => 'draft',
        ]);

        return new ContractResource($contract);
    }

    /** PATCH /contracts/{id}/submit */
    public function submit(PerformanceContract $contract)
    {
        $this->authorize('update', $contract);

        $contract->update([
            'status'       => 'pending_approval',
            'submitted_at' => now(),
        ]);

        Cache::forget("dashboard:supervisor:{$contract->supervisor_id}");

        return new ContractResource($contract);
    }

    /** PATCH /contracts/{id}/approve  — supervisor */
    public function approve(Request $request, PerformanceContract $contract)
    {
        $data = $request->validate(['comment' => 'nullable|string|max:1000']);

        $template = KraTemplate::findOrFail($contract->template_id);
        $this->snapshot->snapshot($contract, $template);

        $contract->update([
            'status'             => 'active',
            'approved_by'        => auth()->id(),
            'approved_at'        => now(),
            'supervisor_comment' => $data['comment'] ?? null,
            'reviewed_at'        => now(),
        ]);

        Cache::forget("dashboard:staff:{$contract->user_id}");

        return new ContractResource($contract->load('krasWithTree'));
    }

    /** PATCH /contracts/{id}/return  — supervisor */
    public function return(Request $request, PerformanceContract $contract)
    {
        $data = $request->validate(['comment' => 'required|string|max:1000']);

        $contract->update([
            'status'             => 'returned',
            'supervisor_comment' => $data['comment'],
            'reviewed_at'        => now(),
        ]);

        return new ContractResource($contract);
    }

    /** GET /contracts/pending  — supervisor queue */
    public function pending()
    {
        $contracts = PerformanceContract::with([
                'user:id,surname,firstname,ippis_no,designation,department_id',
                'user.department:id,name,code',
                'kras',
            ])
            ->where('supervisor_id', auth()->id())
            ->where('status', 'pending_approval')
            ->orderByDesc('submitted_at')
            ->get();

        return ContractResource::collection($contracts);
    }
}
