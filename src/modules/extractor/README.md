# Extractor Module

**Status**: Placeholder (not implemented in initial phase)

## Purpose
Extract chat conversation content from various AI platforms (ChatGPT, Claude, Gemini, Perplexity)

## Future Implementation
- [ ] ChatGPT conversation extractor
- [ ] Claude conversation extractor  
- [ ] Gemini conversation extractor
- [ ] Perplexity conversation extractor

## Interface
```typescript
interface Extractor {
  platform: string;
  detect(): boolean;
  extract(): Promise<Conversation>;
}
```

