<!--
Sync Impact Report
Version change: none → 1.0.0
Modified principles: All principles added (I. Library-First, II. CLI Interface, III. Test-First, IV. Integration Testing, V. Observability/Versioning/Simplicity)
Added sections: Additional Constraints, Development Workflow
Removed sections: none
Templates requiring updates: .specify/templates/plan-template.md (✅ updated - constitution version reference)
Follow-up TODOs: none
-->
# ChatCrate Constitution

## Core Principles

### I. Library-First
Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries

### II. CLI Interface
Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats

### III. Test-First (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced

### IV. Integration Testing
Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas

### V. Observability, Versioning & Breaking Changes, Simplicity
Text I/O ensures debuggability; Structured logging required; MAJOR.MINOR.BUILD format for versioning; Breaking changes require major version bump; Start simple, YAGNI principles enforced

## Additional Constraints

Technology stack: Bash scripts for CLI tooling, Markdown for documentation; Compliance: All scripts must be POSIX-compliant; Deployment: Scripts distributed as standalone executables; Security: No hardcoded secrets, input validation required

## Development Workflow

Code review: All changes require review; Testing gates: Tests must pass before merge; Deployment approval: Automated checks for constitution compliance; Agent integration: Use update-agent-context.sh for AI agent context updates

## Governance
Constitution supersedes all other practices; Amendments require documentation, approval, migration plan; All PRs/reviews must verify compliance; Complexity must be justified; Use constitution.md for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2025-10-04 | **Last Amended**: 2025-10-04