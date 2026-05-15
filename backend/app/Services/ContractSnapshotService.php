<?php

namespace App\Services;

use App\Models\KraTemplate;
use App\Models\PerformanceContract;
use App\Models\ContractKra;
use App\Models\ContractObjective;
use App\Models\ContractKpi;
use Illuminate\Support\Facades\DB;

/**
 * Snapshots the full KRA → Objective → KPI tree from a template
 * into the contract_kras/objectives/kpis tables at approval time.
 * This freezes the contract so future template edits never affect
 * live appraisals — mirrors the localStorage snapshot in the frontend.
 */
class ContractSnapshotService
{
    public function snapshot(PerformanceContract $contract, KraTemplate $template): void
    {
        DB::transaction(function () use ($contract, $template) {
            // Clear any existing snapshot (re-approval scenario)
            $contract->kras()->each(function ($kra) {
                $kra->objectives()->each(fn($obj) => $obj->kpis()->delete());
                $kra->objectives()->delete();
            });
            $contract->kras()->delete();

            $template->load('kras.objectives.kpis');

            foreach ($template->kras as $tKra) {
                $kra = ContractKra::create([
                    'contract_id' => $contract->id,
                    'serial_no'   => $tKra->serial_no,
                    'name'        => $tKra->kra_name,
                    'weight'      => $tKra->weight,
                ]);

                foreach ($tKra->objectives as $tObj) {
                    $obj = ContractObjective::create([
                        'kra_id'        => $kra->id,
                        'description'   => $tObj->description,
                        'weight'        => $tObj->weight,
                        'graded_weight' => $tObj->graded_weight,
                    ]);

                    foreach ($tObj->kpis as $tKpi) {
                        ContractKpi::create([
                            'objective_id'       => $obj->id,
                            'description'        => $tKpi->description,
                            'target_value'       => $tKpi->target_value,
                            'unit_of_measurement'=> $tKpi->unit_of_measurement,
                            'direction'          => $tKpi->direction,
                            'criteria_O'         => $tKpi->criteria_O,
                            'criteria_E'         => $tKpi->criteria_E,
                            'criteria_VG'        => $tKpi->criteria_VG,
                            'criteria_G'         => $tKpi->criteria_G,
                            'criteria_F'         => $tKpi->criteria_F,
                            'criteria_P'         => $tKpi->criteria_P,
                            'weight'             => $tKpi->weight ?? null,
                            'graded_weight'      => $tKpi->graded_weight ?? null,
                            'mpms_kpi_id'        => $tKpi->mpms_kpi_id ?? null,
                        ]);
                    }
                }
            }
        });
    }
}
