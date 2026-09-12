import * as migration_20260903_130533 from './20260903_130533';
import * as migration_20260904_090000_standard_21_roles from './20260904_090000_standard_21_roles';
import * as migration_20260905_075723_standard_21_expand_backfill_contract from './20260905_075723_standard_21_expand_backfill_contract';
import * as migration_20260905_082941_standard_21_import_job from './20260905_082941_standard_21_import_job';
import * as migration_20260905_093617_standard_21_public_catalog from './20260905_093617_standard_21_public_catalog';
import * as migration_20260905_103148_standard_21_leads_outbox from './20260905_103148_standard_21_leads_outbox';
import * as migration_20260905_213045_security_shared_entity_ownership from './20260905_213045_security_shared_entity_ownership';
import * as migration_20260906_213128_atlas_complex_display_fields from './20260906_213128_atlas_complex_display_fields';
import * as migration_20260912_102719_core4_layout_unit_expand from './20260912_102719_core4_layout_unit_expand';
import * as migration_20260912_110758_core4_import_ownership_publication_expand from './20260912_110758_core4_import_ownership_publication_expand';
import * as migration_20260912_110854_core4_remove_dead_feed_schedule from './20260912_110854_core4_remove_dead_feed_schedule';
import * as migration_20260912_112509_core4_catalog_read_model from './20260912_112509_core4_catalog_read_model';

export const migrations = [
  {
    up: migration_20260903_130533.up,
    down: migration_20260903_130533.down,
    name: '20260903_130533',
  },
  {
    up: migration_20260904_090000_standard_21_roles.up,
    down: migration_20260904_090000_standard_21_roles.down,
    name: '20260904_090000_standard_21_roles',
  },
  {
    up: migration_20260905_075723_standard_21_expand_backfill_contract.up,
    down: migration_20260905_075723_standard_21_expand_backfill_contract.down,
    name: '20260905_075723_standard_21_expand_backfill_contract',
  },
  {
    up: migration_20260905_082941_standard_21_import_job.up,
    down: migration_20260905_082941_standard_21_import_job.down,
    name: '20260905_082941_standard_21_import_job',
  },
  {
    up: migration_20260905_093617_standard_21_public_catalog.up,
    down: migration_20260905_093617_standard_21_public_catalog.down,
    name: '20260905_093617_standard_21_public_catalog',
  },
  {
    up: migration_20260905_103148_standard_21_leads_outbox.up,
    down: migration_20260905_103148_standard_21_leads_outbox.down,
    name: '20260905_103148_standard_21_leads_outbox',
  },
  {
    up: migration_20260905_213045_security_shared_entity_ownership.up,
    down: migration_20260905_213045_security_shared_entity_ownership.down,
    name: '20260905_213045_security_shared_entity_ownership',
  },
  {
    up: migration_20260906_213128_atlas_complex_display_fields.up,
    down: migration_20260906_213128_atlas_complex_display_fields.down,
    name: '20260906_213128_atlas_complex_display_fields',
  },
  {
    up: migration_20260912_102719_core4_layout_unit_expand.up,
    down: migration_20260912_102719_core4_layout_unit_expand.down,
    name: '20260912_102719_core4_layout_unit_expand',
  },
  {
    up: migration_20260912_110758_core4_import_ownership_publication_expand.up,
    down: migration_20260912_110758_core4_import_ownership_publication_expand.down,
    name: '20260912_110758_core4_import_ownership_publication_expand',
  },
  {
    up: migration_20260912_110854_core4_remove_dead_feed_schedule.up,
    down: migration_20260912_110854_core4_remove_dead_feed_schedule.down,
    name: '20260912_110854_core4_remove_dead_feed_schedule',
  },
  {
    up: migration_20260912_112509_core4_catalog_read_model.up,
    down: migration_20260912_112509_core4_catalog_read_model.down,
    name: '20260912_112509_core4_catalog_read_model'
  },
];
