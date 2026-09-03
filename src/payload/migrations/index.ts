import * as migration_20260830_190437_foundation_init from './20260830_190437_foundation_init';
import * as migration_20260831_193020_admin_platform_hardening from './20260831_193020_admin_platform_hardening';
import * as migration_20260901_062242_add_media_storage_prefix from './20260901_062242_add_media_storage_prefix';
import * as migration_20260901_091357_add_residential_complexes from './20260901_091357_add_residential_complexes';
import * as migration_20260901_134719_public_ui_parity from './20260901_134719_public_ui_parity';
import * as migration_20260902_190814_mass_catalog from './20260902_190814_mass_catalog';
import * as migration_20260902_191246_import_source_key from './20260902_191246_import_source_key';
import * as migration_20260902_191834_durable_unit_import from './20260902_191834_durable_unit_import';
import * as migration_20260902_202741_chessboard_index from './20260902_202741_chessboard_index';
import * as migration_20260902_215242_lifecycle_security from './20260902_215242_lifecycle_security';

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
    name: '20260901_134719_public_ui_parity',
  },
  {
    up: migration_20260902_190814_mass_catalog.up,
    down: migration_20260902_190814_mass_catalog.down,
    name: '20260902_190814_mass_catalog',
  },
  {
    up: migration_20260902_191246_import_source_key.up,
    down: migration_20260902_191246_import_source_key.down,
    name: '20260902_191246_import_source_key',
  },
  {
    up: migration_20260902_191834_durable_unit_import.up,
    down: migration_20260902_191834_durable_unit_import.down,
    name: '20260902_191834_durable_unit_import',
  },
  {
    up: migration_20260902_202741_chessboard_index.up,
    down: migration_20260902_202741_chessboard_index.down,
    name: '20260902_202741_chessboard_index',
  },
  {
    up: migration_20260902_215242_lifecycle_security.up,
    down: migration_20260902_215242_lifecycle_security.down,
    name: '20260902_215242_lifecycle_security'
  },
];
