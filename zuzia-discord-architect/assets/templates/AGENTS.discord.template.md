# Discord project rules

- Keep Discord transport handlers thin.
- Register application commands through an explicit deployment script.
- Derive Gateway intents and bot permissions from active features.
- Validate all interaction, webhook, dashboard, AI, and persistence boundaries.
- Use safe mentions for user-controlled output.
- Do not log secrets or private message content.
- Run lint, typecheck, tests, and build before claiming completion.
- Document live Discord checks that were not performed.
