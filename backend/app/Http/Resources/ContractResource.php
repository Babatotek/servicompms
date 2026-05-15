<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'user_id'            => $this->user_id,
            'supervisor_id'      => $this->supervisor_id,
            'year'               => $this->year,
            'template_id'        => $this->template_id,
            'status'             => $this->status,
            'submitted_at'       => $this->submitted_at?->toISOString(),
            'approved_by'        => $this->approved_by,
            'approved_at'        => $this->approved_at?->toISOString(),
            'supervisor_comment' => $this->supervisor_comment,
            'reviewed_at'        => $this->reviewed_at?->toISOString(),
            'user'               => $this->whenLoaded('user', fn() => [
                'id'            => $this->user->id,
                'full_name'     => $this->user->full_name,
                'ippis_no'      => $this->user->ippis_no,
                'designation'   => $this->user->designation,
                'department_id' => $this->user->department_id,
                'department'    => $this->user->department?->name,
            ]),
            // Snapshot KRA tree — matches frontend TemplateKRA shape
            'kras'               => $this->whenLoaded('krasWithTree', fn() =>
                $this->krasWithTree->map(fn($kra) => [
                    'id'         => $kra->id,
                    'serial_no'  => $kra->serial_no,
                    'name'       => $kra->name,
                    'weight'     => $kra->weight,
                    'objectives' => $kra->objectives->map(fn($obj) => [
                        'id'           => $obj->id,
                        'description'  => $obj->description,
                        'weight'       => $obj->weight,
                        'graded_weight'=> $obj->graded_weight,
                        'kpis'         => $obj->kpis->map(fn($kpi) => [
                            'id'                  => $kpi->id,
                            'description'         => $kpi->description,
                            'target_value'        => $kpi->target_value,
                            'unit'                => $kpi->unit_of_measurement,
                            'direction'           => $kpi->direction,
                            'weight'              => $kpi->weight,
                            'graded_weight'       => $kpi->graded_weight,
                            'criteria'            => $kpi->criteria,
                        ]),
                    ]),
                ])
            ),
        ];
    }
}
