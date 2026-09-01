import * as migration_20260830_190437_foundation_init from './20260830_190437_foundation_init';
import * as migration_20260831_193020_admin_platform_hardening from './20260831_193020_admin_platform_hardening';
import * as migration_20260901_062242_add_media_storage_prefix from './20260901_062242_add_media_storage_prefix';
import * as migration_20260901_091357_add_residential_complexes from './20260901_091357_add_residential_complexes';
import * as migration_20260901_134719_public_ui_parity from './20260901_134719_public_ui_parity';

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
    name: '20260901_062242_add_media_storage_prefix',
  },
  {
    up: migration_20260901_091357_add_residential_complexes.up,
    down: migration_20260901_091357_add_residential_complexes.down,
    name: '20260901_091357_add_residential_complexes',
  },
  {
    up: migration_20260901_134719_public_ui_parity.up,
    down: migration_20260901_134719_public_ui_parity.down,
    name: '20260901_134719_public_ui_parity'
  },
];
