import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type AppRole = 'admin' | 'tutor' | 'parent';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);

export const AdminRole = () => Roles('admin');
export const TutorRole = () => Roles('tutor');
export const ParentRole = () => Roles('parent');

export const RolesAny = (...roles: AppRole[]) => Roles(...roles);
