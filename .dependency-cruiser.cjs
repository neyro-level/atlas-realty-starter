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
      name: 'no-reusable-presentation-to-payload-or-project',
      severity: 'error',
      comment: 'Reusable presentation consumes shared DTO/contracts, never Payload or client config.',
      from: { path: '^packages/(site-ui|site-contracts)/src/' },
      to: { path: '^src/(payload(?:\\.config\\.ts|/)|project/)' },
    },
    {
      name: 'no-core-to-project-or-app',
      severity: 'error',
      comment: 'Reusable core cannot depend on client configuration or application routes.',
      from: { path: '^src/core/' },
      to: { path: '^src/(project|app)/' },
    },
    {
      name: 'no-ui-to-payload',
      severity: 'error',
      comment: 'UI consumes DTOs and never Payload runtime or database modules.',
      from: { path: '^src/ui/' },
      to: { path: '^src/(payload(?:\\.config\\.ts|/)|core/data-access/)' },
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
