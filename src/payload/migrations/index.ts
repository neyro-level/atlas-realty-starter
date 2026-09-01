import * as migration_20260830_190437_foundation_init from './20260830_190437_foundation_init';
import * as migration_20260831_193020_admin_platform_hardening from './20260831_193020_admin_platform_hardening';

export const migrations = [
  {
    up: migration_20260830_190437_foundation_init.up,
    down: migration_20260830_190437_foundation_init.down,
    name: '20260830_190437_foundation_init',
  },
  {
    up: migration_20260831_193020_admin_platform_hardening.up,
    down: migration_20260831_193020_admin_platform_hardening.down,
    name: '20260831_193020_admin_platform_hardening'
  },
];
