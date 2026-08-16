# Compatibility Reference

## Resolve versions at execution time

Do not assume a remembered package version is current.

For greenfield work:

1. Check the official Discord developer documentation for API behavior.
2. Check the official discord.js documentation and package registry.
3. Resolve a runtime version compatible with the selected discord.js release.
4. Install exact or policy-approved ranges according to the repository.
5. record resolved versions in the final report.

For existing projects:

- preserve current versions unless the request requires an upgrade
- inspect lockfiles
- read the matching version documentation
- avoid copying code from a different major version

## Source priority

1. Official Discord developer documentation.
2. Official discord.js documentation and repository.
3. Official package documentation for dependencies.
4. Existing repository behavior and tests.
5. Community examples only when official sources are insufficient.

## API behavior to verify

- interaction response timing and follow-up lifetime
- current intents and privileged intent requirements
- application command fields, contexts, and integration types
- permission flags
- rate-limit behavior
- attachment and embed limits
- sharding requirements
- webhook signature rules
- message and component capabilities

## Dependency discipline

- do not install overlapping libraries without a reason
- prefer maintained packages
- check runtime engine constraints
- avoid abandoned wrappers for core Discord behavior
- minimize dependency count for security-sensitive functions
