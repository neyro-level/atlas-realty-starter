import * as migration_20260903_130533 from './20260903_130533';
import * as migration_20260904_090000_standard_21_roles from './20260904_090000_standard_21_roles';
import * as migration_20260905_075723_standard_21_expand_backfill_contract from './20260905_075723_standard_21_expand_backfill_contract';
import * as migration_20260905_082941_standard_21_import_job from './20260905_082941_standard_21_import_job';

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
    name: '20260905_082941_standard_21_import_job'
  },
];
