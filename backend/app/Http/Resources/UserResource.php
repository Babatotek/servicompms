<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'ippis_no'          => $this->ippis_no,
            'surname'           => $this->surname,
            'firstname'         => $this->firstname,
            'othername'         => $this->othername,
            'full_name'         => $this->full_name,
            'email'             => $this->email,
            'phone'             => $this->phone,
            'designation'       => $this->designation,
            'department_id'     => $this->department_id,
            'department'        => $this->whenLoaded('department', fn() => [
                'id'   => $this->department->id,
                'name' => $this->department->name,
                'code' => $this->department->code,
            ]),
            'role'              => $this->getRoleNames()->first(),
            'supervisor_id'     => $this->supervisor_id,
            'counter_signer_id' => $this->counter_signer_id,
            'is_active'         => $this->is_active,
            'avatar_url'        => $this->avatar_url,
        ];
    }
}
