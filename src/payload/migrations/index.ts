import * as migration_20260830_190437_foundation_init from './20260830_190437_foundation_init';
import * as migration_20260831_193020_admin_platform_hardening from './20260831_193020_admin_platform_hardening';
import * as migration_20260901_062242_add_media_storage_prefix from './20260901_062242_add_media_storage_prefix';

export const migrations = [
  {
    up: migration_20260830_190437_foundation_init.up,
    down: migration_20260830_190437_foundation_init.down,
    name: '20260830_190437_foundation_init',
  },
  {
    up: migration_20260831_193020_admin_platform_hardening.up,
    down: migration_20260831_193020_admin_platform_hardening.down,
    name: '20260831_193020_admin_platform_hardening',
  },
  {
    up: migration_20260901_062242_add_media_storage_prefix.up,
    down: migration_20260901_062242_add_media_storage_prefix.down,
    name: '20260901_062242_add_media_storage_prefix'
  },
];
