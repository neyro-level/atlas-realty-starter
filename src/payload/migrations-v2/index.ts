import * as migration_20260903_130533 from './20260903_130533';

export const migrations = [
  {
    up: migration_20260903_130533.up,
    down: migration_20260903_130533.down,
    name: '20260903_130533'
  },
];
