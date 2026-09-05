import * as migration_20260903_130533 from './20260903_130533'
import * as migration_20260904_090000_standard_21_roles from './20260904_090000_standard_21_roles'

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
]
