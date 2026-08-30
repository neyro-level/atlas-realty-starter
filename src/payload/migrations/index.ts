import * as migration_20260830_190437_foundation_init from './20260830_190437_foundation_init';

export const migrations = [
  {
    up: migration_20260830_190437_foundation_init.up,
    down: migration_20260830_190437_foundation_init.down,
    name: '20260830_190437_foundation_init'
  },
];
