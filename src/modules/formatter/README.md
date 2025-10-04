# Formatter Module

**Status**: Placeholder (not implemented in initial phase)

## Purpose
Transform extracted conversation content into various output formats

## Future Implementation
- [ ] Markdown formatter
- [ ] JSON formatter
- [ ] Tana Paste formatter
- [ ] HTML formatter

## Interface
```typescript
interface Formatter {
  format: string;
  format(conversation: Conversation): Promise<FormattedOutput>;
}
```

