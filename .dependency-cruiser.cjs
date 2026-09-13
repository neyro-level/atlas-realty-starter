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
      to: { path: '^(?:payload$|@payloadcms/|pg$|src/(?:payload(?:\\.config\\.ts|/)|project/|core/data-access/))' },
    },
    {
      name: 'no-core-to-project-or-app',
      severity: 'error',
      comment: 'Reusable core cannot depend on client configuration or application routes.',
      from: { path: '^src/core/' },
      to: { path: '^src/(project|app)/' },
    },
    {
      name: 'no-legacy-tenant-facades',
      severity: 'error',
      comment: 'Tenant identity is owned only by src/project/tenant.config.ts.',
      from: {},
      to: { path: '^src/project/(?:tenant|site-identity|site-profile)\\.ts$' },
    },
    {
      name: 'no-ui-to-payload',
      severity: 'error',
      comment: 'UI consumes DTOs and never Payload runtime or database modules.',
      from: { path: '^src/ui/' },
      to: { path: '^src/(payload(?:\\.config\\.ts|/)|core/data-access/)' },
    },
    {
      name: 'no-public-or-user-to-privileged-gateways',
      severity: 'error',
      comment: 'Public and user reads cannot reach system or ingest capabilities.',
      from: { path: '^src/core/data-access/(?:public|user)/' },
      to: { path: '^src/core/data-access/(?:system|ingest)/' },
    },
    {
      name: 'lead-adapters-use-safe-http-port',
      severity: 'error',
      comment: 'Lead adapters must use the centrally hardened outbound HTTP client.',
      from: { path: '^src/project/leads/adapters/' },
      to: { path: '^(?:node:http|node:https|http|https)$' },
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
