# Exporter Module

**Status**: Placeholder (not implemented in initial phase)

## Purpose
Export formatted content to target platforms

## Future Implementation
- [ ] Obsidian exporter (local filesystem)
- [ ] Notion exporter (API)
- [ ] Readwise Reader exporter (API)
- [ ] Tana exporter (API)

## Interface
```typescript
interface Exporter {
  platform: string;
  export(output: FormattedOutput, config: ExportConfig): Promise<ExportResult>;
}
```

