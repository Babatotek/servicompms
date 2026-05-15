<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles/permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Contracts
            'contract.create', 'contract.submit', 'contract.approve', 'contract.return',
            // Appraisals
            'appraisal.create', 'appraisal.submit',
            'appraisal.review',       // supervisor approve/return
            'appraisal.counter_sign', // counter-signer
            // MPMS
            'mpms.view', 'mpms.submit_achievement', 'mpms.approve_achievement',
            // Admin
            'admin.users', 'admin.departments', 'admin.settings', 'admin.templates',
            // Analytics / Leaderboard
            'analytics.org', 'leaderboard.view',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'sanctum']);
        }

        // ── Roles (match frontend UserRole enum exactly) ──────────────────────
        $roles = [
            'Staff' => [
                'contract.create', 'contract.submit',
                'appraisal.create', 'appraisal.submit',
                'mpms.view', 'leaderboard.view',
            ],
            'Team Lead' => [
                'contract.create', 'contract.submit',
                'appraisal.create', 'appraisal.submit', 'appraisal.review',
                'mpms.view', 'leaderboard.view',
            ],
            'Dept Head' => [
                'contract.create', 'contract.submit', 'contract.approve', 'contract.return',
                'appraisal.create', 'appraisal.submit', 'appraisal.review', 'appraisal.counter_sign',
                'mpms.view', 'mpms.submit_achievement',
                'leaderboard.view',
            ],
            'Deputy Director' => [
                'contract.create', 'contract.submit', 'contract.approve', 'contract.return',
                'appraisal.create', 'appraisal.submit', 'appraisal.review', 'appraisal.counter_sign',
                'mpms.view', 'mpms.submit_achievement', 'mpms.approve_achievement',
                'analytics.org', 'leaderboard.view',
            ],
            'National Coordinator' => [
                'contract.create', 'contract.submit', 'contract.approve', 'contract.return',
                'appraisal.create', 'appraisal.submit', 'appraisal.review', 'appraisal.counter_sign',
                'mpms.view', 'mpms.submit_achievement', 'mpms.approve_achievement',
                'analytics.org', 'leaderboard.view',
                'admin.users', 'admin.departments', 'admin.settings', 'admin.templates',
            ],
            'Super Admin' => $permissions, // all
        ];

        foreach ($roles as $roleName => $rolePerms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'sanctum']);
            $role->syncPermissions($rolePerms);
        }
    }
}
