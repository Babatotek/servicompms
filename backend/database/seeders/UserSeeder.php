<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $usersData = [
            ['ippis_no'=>'00001','surname'=>'ADMIN',    'firstname'=>'SUPER',     'email'=>'admin@servicom.gov.ng', 'designation'=>'System Administrator','department_id'=>'dept_ict', 'role'=>'Super Admin'],
            ['ippis_no'=>'00002','surname'=>'FUNMILAYO','firstname'=>'OLADIMEJI', 'email'=>'nc@servicom.gov.ng',    'designation'=>'National Coordinator', 'department_id'=>'dept_nc',  'role'=>'National Coordinator'],
            ['ippis_no'=>'10001','surname'=>'LAWAL',    'firstname'=>'OBEHI',     'email'=>'dd@servicom.gov.ng',    'designation'=>'Deputy Director',      'department_id'=>'dept_ops', 'role'=>'Deputy Director',    'supervisor_email'=>'nc@servicom.gov.ng'],
            ['ippis_no'=>'20001','surname'=>'CHINYERE', 'firstname'=>'NAWABUA',   'email'=>'head@servicom.gov.ng',  'designation'=>'Head of Department',   'department_id'=>'dept_ops', 'role'=>'Dept Head',          'supervisor_email'=>'dd@servicom.gov.ng'],
            ['ippis_no'=>'30001','surname'=>'NNEKA',    'firstname'=>'OLEH',      'email'=>'lead@servicom.gov.ng',  'designation'=>'Team Lead',            'department_id'=>'dept_ops', 'role'=>'Team Lead',          'supervisor_email'=>'head@servicom.gov.ng'],
            ['ippis_no'=>'40001','surname'=>'ISAH',     'firstname'=>'ABDULLAHI', 'email'=>'staff@servicom.gov.ng', 'designation'=>'Officer I',            'department_id'=>'dept_ops', 'role'=>'Staff',              'supervisor_email'=>'lead@servicom.gov.ng','counter_signer_email'=>'head@servicom.gov.ng'],
        ];

        $emailToMeta = [];

        // First pass — create/update users without supervisor links
        foreach ($usersData as $data) {
            $role               = $data['role'];
            $supervisorEmail    = $data['supervisor_email'] ?? null;
            $counterSignerEmail = $data['counter_signer_email'] ?? null;
            unset($data['role'], $data['supervisor_email'], $data['counter_signer_email']);

            $user = User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, ['password' => Hash::make('password'), 'is_active' => true])
            );

            $user->syncRoles([$role]);

            $emailToMeta[$data['email']] = [
                'id'                   => $user->id,
                'supervisor_email'     => $supervisorEmail,
                'counter_signer_email' => $counterSignerEmail,
            ];
        }

        // Second pass — wire supervisor_id and counter_signer_id
        foreach ($emailToMeta as $email => $meta) {
            $updates = [];
            if ($meta['supervisor_email'] && isset($emailToMeta[$meta['supervisor_email']])) {
                $updates['supervisor_id'] = $emailToMeta[$meta['supervisor_email']]['id'];
            }
            if ($meta['counter_signer_email'] && isset($emailToMeta[$meta['counter_signer_email']])) {
                $updates['counter_signer_id'] = $emailToMeta[$meta['counter_signer_email']]['id'];
            }
            if ($updates) {
                User::where('id', $meta['id'])->update($updates);
            }
        }
    }
}
