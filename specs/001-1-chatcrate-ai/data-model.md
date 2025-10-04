# Data Model: ChatCrate Browser Extension

**Feature**: ChatCrate Browser Extension Development Environment Setup  
**Date**: 2025-10-04  
**Status**: Initial Design (Hello World Phase)

## Overview

This document defines the data models and interfaces for the ChatCrate browser extension. Since this is the initial infrastructure setup phase (Hello World), there are minimal data models. However, we document the planned interfaces for future module development.

## Current Phase: Hello World

### No Data Models Required

The Hello World implementation has no complex data structures. The popup simply displays static text.

### Simple Props Interface (Example for Testing)

```typescript
// src/components/HelloWorld.tsx
interface HelloWorldProps {
  message?: string;  // Optional message to display, defaults to "Hello World"
}
```

**Purpose**: Demonstrate component props and testing patterns  
**Fields**: Single optional string field for customization  
**Validation**: None required (simple string)

---

## Future Module Interfaces (Placeholder Documentation)

These interfaces document the intended architecture but are **not implemented** in this phase.

### Extractor Module Interface

```typescript
// src/modules/extractor/types.ts (future)

/**
 * Represents a single message in a conversation
 */
interface Message {
  id: string;                    // Unique message identifier
  role: 'user' | 'assistant';    // Who sent the message
  content: string;               // Message text content
  timestamp: Date;               // When message was sent
  metadata?: {                   // Optional platform-specific metadata
    model?: string;              // AI model used (e.g., "gpt-4")
    tokens?: number;             // Token count if available
    [key: string]: any;          // Extensible for platform-specific data
  };
}

/**
 * Represents a complete conversation
 */
interface Conversation {
  id: string;                    // Unique conversation identifier
  platform: string;              // Source platform (e.g., "chatgpt", "claude")
  title?: string;                // Conversation title if available
  messages: Message[];           // Array of messages in order
  createdAt: Date;              // Conversation start time
  updatedAt: Date;              // Last message time
  metadata?: {                   // Optional conversation metadata
    model?: string;              // Primary model used
    systemPrompt?: string;       // System prompt if available
    [key: string]: any;          // Extensible
  };
}

/**
 * Platform-specific extractor interface
 */
interface Extractor {
  platform: string;              // Platform identifier
  detect(): boolean;             // Check if current page is this platform
  extract(): Promise<Conversation>;  // Extract conversation from page
}
```

**Purpose**: Standardize conversation data across different AI platforms  
**Relationships**: Conversation contains many Messages  
**Validation Rules**:
- `id` must be unique within its scope
- `role` must be either 'user' or 'assistant'
- `messages` array must preserve chronological order
- `timestamp` and date fields must be valid Date objects

---

### Formatter Module Interface

```typescript
// src/modules/formatter/types.ts (future)

/**
 * Formatted output with metadata
 */
interface FormattedOutput {
  format: string;                // Format type (e.g., "markdown", "json")
  content: string;               // Formatted content string
  metadata: {                    // Metadata about the formatting
    formatter: string;           // Which formatter was used
    timestamp: Date;             // When formatting occurred
    sourceId: string;            // Original conversation ID
    [key: string]: any;          // Extensible
  };
}

/**
 * Format-specific formatter interface
 */
interface Formatter {
  format: string;                // Format identifier (e.g., "markdown")
  format(conversation: Conversation): Promise<FormattedOutput>;
}
```

**Purpose**: Standardize output format across different formatters  
**Relationships**: FormattedOutput is created from one Conversation  
**Validation Rules**:
- `format` must match a supported format type
- `content` must be non-empty after formatting
- `metadata.sourceId` must match original conversation ID

---

### Exporter Module Interface

```typescript
// src/modules/exporter/types.ts (future)

/**
 * Export configuration for a target platform
 */
interface ExportConfig {
  platform: string;              // Export target (e.g., "notion", "obsidian")
  credentials?: {                // Authentication credentials if required
    apiKey?: string;
    token?: string;
    [key: string]: any;
  };
  options?: {                    // Export options
    destination?: string;        // Target folder/database
    overwrite?: boolean;         // Whether to overwrite existing
    [key: string]: any;
  };
}

/**
 * Result of an export operation
 */
interface ExportResult {
  success: boolean;              // Whether export succeeded
  platform: string;              // Target platform
  url?: string;                  // URL to exported content if available
  error?: string;                // Error message if failed
  metadata?: {                   // Additional result metadata
    timestamp: Date;
    [key: string]: any;
  };
}

/**
 * Platform-specific exporter interface
 */
interface Exporter {
  platform: string;              // Platform identifier
  export(output: FormattedOutput, config: ExportConfig): Promise<ExportResult>;
}
```

**Purpose**: Standardize export operations across different target platforms  
**Relationships**: Exporter consumes FormattedOutput, produces ExportResult  
**Validation Rules**:
- `platform` in ExportConfig must match Exporter.platform
- `credentials` must be validated before export attempt
- `ExportResult.success` must accurately reflect operation outcome

---

### UI State (Future)

```typescript
// src/modules/ui/types.ts (future)

/**
 * Application state for the extension
 */
interface AppState {
  currentPlatform?: string;      // Detected chat platform on active tab
  conversation?: Conversation;   // Extracted conversation (if any)
  selectedFormat: string;        // User-selected output format
  selectedExporter: string;      // User-selected export target
  exportConfig: ExportConfig;    // Current export configuration
  status: {                      // Operation status
    extracting: boolean;
    formatting: boolean;
    exporting: boolean;
    error?: string;
  };
}
```

**Purpose**: Manage UI state and user selections  
**State Management**: Context API or Zustand (to be decided in future)  
**Validation Rules**:
- Only one of extracting/formatting/exporting should be true at a time
- `selectedFormat` and `selectedExporter` must be from available options

---

## Data Flow (Future Architecture)

```
User Action → Extractor → Conversation
                             ↓
                         Formatter → FormattedOutput
                                          ↓
                                      Exporter → ExportResult
```

**State Transitions**:
1. **Idle**: No operation in progress
2. **Extracting**: Reading conversation from page
3. **Formatting**: Converting to selected format
4. **Exporting**: Sending to target platform
5. **Complete**: Operation finished (success or error)
6. **Back to Idle**: Ready for next operation

---

## Storage Considerations (Future)

### Chrome Storage API

Will use `chrome.storage.sync` for user preferences:
```typescript
interface StoredPreferences {
  defaultFormat: string;         // User's preferred default format
  defaultExporter: string;       // User's preferred default exporter
  exportConfigs: {               // Saved export configurations
    [platform: string]: ExportConfig;
  };
}
```

**Storage Strategy**:
- Preferences sync across devices via `chrome.storage.sync`
- API keys stored securely (consider chrome.storage.local for sensitive data)
- Conversation history not stored (privacy-first approach)
- Export history kept minimal (last 10 exports max)

---

## Validation Patterns (Future)

### Type Guards

```typescript
function isValidMessage(obj: any): obj is Message {
  return (
    typeof obj.id === 'string' &&
    (obj.role === 'user' || obj.role === 'assistant') &&
    typeof obj.content === 'string' &&
    obj.timestamp instanceof Date
  );
}

function isValidConversation(obj: any): obj is Conversation {
  return (
    typeof obj.id === 'string' &&
    typeof obj.platform === 'string' &&
    Array.isArray(obj.messages) &&
    obj.messages.every(isValidMessage)
  );
}
```

### Error Handling

All modules should use Result type pattern:
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

---

## Current Implementation Status

✅ **HelloWorld Component**: Simple component with optional message prop  
❌ **Conversation Model**: Not implemented (future)  
❌ **Message Model**: Not implemented (future)  
❌ **Formatter Interface**: Not implemented (future)  
❌ **Exporter Interface**: Not implemented (future)  
❌ **Storage Models**: Not implemented (future)

**Next Steps**: These interfaces will be implemented incrementally as modules are developed in future iterations.

---

## Conclusion

This document establishes the data model foundation for ChatCrate. While the current Hello World phase requires minimal data structures, the documented interfaces provide a clear roadmap for future development. All modules follow a consistent pattern of extracting, transforming, and exporting data through well-defined interfaces.

**Status**: ✅ Data Model Design Complete for Current Phase

