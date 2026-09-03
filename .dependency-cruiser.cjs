module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Production dependency cycles are forbidden.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-presentation-to-payload-or-project',
      severity: 'error',
      comment: 'Reusable presentation consumes shared DTO/contracts, never Payload or client config.',
      from: { path: '^src/(components|modules)/' },
      to: { path: '^src/(payload(?:\\.config\\.ts|/)|project/)' },
    },
    {
      name: 'no-shared-to-payload-or-project',
      severity: 'error',
      comment: 'Shared contracts remain independent from Payload and client identity.',
      from: { path: '^src/shared/' },
      to: { path: '^src/(payload(?:\\.config\\.ts|/)|project/)' },
    },
    {
      name: 'no-production-to-tests',
      severity: 'error',
      comment: 'Production code cannot import tests or fixtures.',
      from: { path: '^src/' },
      to: { path: '(^tests/|\\.(?:test|spec)\\.[cm]?[jt]sx?$|/fixtures?/)' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(?:\\.next|dist|build|coverage|graphify-out|outputs|test-results|node_modules)/' },
    tsConfig: { fileName: 'tsconfig.json' },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/[^/]+' },
    },
  },
}
