# Zuzia Ekosistem Config Semasi

## config.json Yapisi

```json
{
  "ecosystem": {
    "name": "zuzia-agents",
    "version": "1.0.0",
    "project": "<proje-adi>"
  },
  "orchestrator": {
    "memory_path": ".zuzia/memory/",
    "max_retries": 2,
    "quality_gates": true
  },
  "agents": {
    "planner": { "model": "claude-opus-5", "enabled": true },
    "coder":   { "model": "claude-sonnet-5", "enabled": true },
    "tester":  { "model": "claude-sonnet-5", "enabled": true },
    "reviewer":{ "model": "claude-opus-5",   "enabled": true },
    "devops":  { "model": "claude-sonnet-5", "enabled": false },
    "docs":    { "model": "claude-haiku-4-5-20251001", "enabled": false },
    "security":{ "model": "claude-opus-5",   "enabled": false }
  },
  "quality_gates": {
    "code_coverage_threshold": 85,
    "max_reviewer_cycles": 3,
    "require_security_gate": false
  },
  "memory": {
    "auto_update": true,
    "retention_days": 30
  }
}
```

## Alan Aciklamalari

| Alan | Tip | Aciklama |
|------|-----|----------|
| orchestrator.max_retries | int | Bir görev kac kez retry edilebilir |
| quality_gates.code_coverage_threshold | int | Minimum test coverage % |
| quality_gates.max_reviewer_cycles | int | Reviewer max kac kez reddedebilir |
| memory.retention_days | int | Memory kayitlari kac gun saklanir |
