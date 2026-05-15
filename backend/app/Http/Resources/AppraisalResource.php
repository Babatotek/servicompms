<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AppraisalResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                       => $this->id,
            'user_id'                  => $this->user_id,
            'contract_id'              => $this->contract_id,
            'period_id'                => $this->period_id,
            'year'                     => $this->year,
            'status'                   => $this->status,
            'submitted_at'             => $this->submitted_at?->toISOString(),
            'supervisor_id'            => $this->supervisor_id,
            'counter_signer_id'        => $this->counter_signer_id,
            'supervisor_comment'       => $this->supervisor_comment,
            'supervisor_rating'        => $this->supervisor_rating,
            'supervisor_reviewed_at'   => $this->supervisor_reviewed_at?->toISOString(),
            'counter_signer_comment'   => $this->counter_signer_comment,
            'counter_signed_at'        => $this->counter_signed_at?->toISOString(),

            // Flat scores map — matches frontend achievements Record<string,number>
            'kpi_scores' => $this->whenLoaded('kpiScores', fn() =>
                $this->kpiScores->mapWithKeys(fn($s) => [
                    (string) $s->kpi_id => [
                        'achievement'        => $s->achievement,
                        'raw_score'          => $s->raw_score,
                        'weighted_raw_score' => $s->weighted_raw_score,
                        'grade_key'          => $s->grade_key,
                    ],
                ])
            ),

            'competency_scores' => $this->whenLoaded('competencyScores', fn() =>
                $this->competencyScores->mapWithKeys(fn($s) => [
                    "comp_{$s->competency_id}" => $s->score,
                ])
            ),

            'operations_scores' => $this->whenLoaded('operationsScores', fn() =>
                $this->operationsScores->mapWithKeys(fn($s) => [
                    "op_{$s->item_id}" => $s->score,
                ])
            ),

            'scores' => $this->whenLoaded('total', fn() => [
                'kpi_total'   => $this->total?->section_4_score ?? 0,
                'competency'  => $this->total?->section_5_score ?? 0,
                'ops_score'   => $this->total?->section_6_score ?? 0,
                'grand_total' => $this->total?->grand_total ?? 0,
                'grade'       => $this->total?->final_grade,
            ]),

            'comments' => $this->whenLoaded('comments', fn() =>
                $this->comments->mapWithKeys(fn($c) => [
                    $c->role => [
                        'comment'          => $c->comment,
                        'strengths'        => $c->strengths,
                        'improvement_areas'=> $c->improvement_areas,
                        'rating'           => $c->rating,
                        'signature_date'   => $c->signature_date?->toISOString(),
                    ],
                ])
            ),

            'period' => $this->whenLoaded('period', fn() => [
                'id'    => $this->period->id,
                'label' => $this->period->label,
                'year'  => $this->period->year,
            ]),

            'user' => $this->whenLoaded('user', fn() => [
                'id'            => $this->user->id,
                'full_name'     => $this->user->full_name,
                'ippis_no'      => $this->user->ippis_no,
                'designation'   => $this->user->designation,
                'department_id' => $this->user->department_id,
                'department'    => $this->user->department?->name,
            ]),
        ];
    }
}
