# Feature Specification: Perplexity to Tana Workflow

**Feature Branch**: `002-perplexity-tana-coding`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: User description: "规格说明：Perplexity -> Tana 工作流（用于 Coding Agent 的实现提示）"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## Clarifications

### Session 2025-10-04
- Q: 在提取 Perplexity 内容时，系统需要保留样式信息（标题、列表、加粗等）。这些样式信息应该以什么形式存储在中间数据结构中？ → A: Markdown - 转换为 Markdown 格式（# 标题，** 加粗，* 列表等）
- Q: 从 Perplexity 页面提取引用信息时，引用对象应该包含哪些字段？ → A: 基本引用 - 仅包含标题和 URL
- Q: 当用户在 Perplexity 页面还在加载内容（例如 AI 正在流式输出回答）时点击操作按钮，系统应该如何处理？ → A: 等待完成 - 禁用按钮直到页面完全加载完成，显示"正在加载"提示
- Q: 当 Perplexity 页面包含图片、表格、代码块等富媒体内容时，系统应该如何处理这些内容？ → A: 完整保留 - 图片用 `![](url)` 保留，表格转为 Markdown 表格，代码块用 ``` 包围
- Q: 当用户点击操作按钮后，系统在不同状态下（成功、失败、进行中）应该如何向用户提供反馈？ → A: 插件内状态 - 在插件 popup 界面内显示状态文本和图标，不自动消失

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
作为一个使用 Perplexity 进行研究和搜索的用户，我希望能够一键将 Perplexity 对话页面中的内容（包括问题、回答、引用等）提取并格式化为 Tana Paste 格式，然后复制到剪贴板，这样我就可以轻松地将这些研究结果整理到我的 Tana 知识库中，保持原有的结构、样式和引用信息完整。

### Acceptance Scenarios
1. **Given** 用户在 Perplexity Search 页面（例如 https://www.perplexity.ai/search/ni-shi-shui-uDrUw.FFTiWHa_EKMfdyig），**When** 用户点击浏览器插件中的一键操作按钮，**Then** 系统应该提取当前页面的对话内容（包括问题、回答、引用），将其转换为 Tana Paste 格式，并复制到用户剪贴板，同时显示成功提示。

2. **Given** 用户在 Perplexity DeepResearch 页面，**When** 用户选择了 Formatter 为 "Tana Paste" 和 Exporter 为 "Clipboard" 后点击操作按钮，**Then** 系统应该提取研究结果内容，保留样式和引用信息，转换为 Tana Paste 格式并复制到剪贴板。

3. **Given** 用户在 Perplexity Labs 页面，**When** 用户点击操作按钮，**Then** 系统应该提取对话内容并按照 Tana Paste 格式复制到剪贴板，用户可以直接在 Tana 中粘贴查看。

4. **Given** 用户在非 Perplexity 页面（例如 Google.com），**When** 用户打开浏览器插件，**Then** 系统应该禁用操作按钮，并显示提示信息说明当前页面不受支持。

5. **Given** 用户在不符合 chat 页面形态的 Perplexity 页面（例如首页或设置页面），**When** 用户打开浏览器插件，**Then** 系统应该禁用操作按钮，并显示提示信息说明当前页面类型不受支持。

6. **Given** 用户在合法的 Perplexity chat 页面且已成功复制内容到剪贴板，**When** 用户在 Tana 应用中执行粘贴操作，**Then** 内容应该以正确的结构呈现，样式和引用信息应该保持可见和可辨识。

7. **Given** 用户在合法的 Perplexity chat 页面但页面内容还在加载中（AI 回答流式输出中），**When** 用户打开浏览器插件，**Then** 操作按钮应该被禁用，并显示"正在加载"提示信息，直到内容完全加载完成后按钮才可用。

8. **Given** 用户在包含图片、表格、代码块的 Perplexity chat 页面，**When** 用户点击操作按钮并将内容粘贴到 Tana，**Then** 图片应该以图片形式显示，表格应该以表格结构呈现，代码块应该以代码格式显示。

9. **Given** 用户在合法的 Perplexity chat 页面点击操作按钮，**When** 系统执行提取、格式化、复制流程，**Then** 插件界面应该实时显示当前状态（进行中、成功或失败），状态信息包含文本描述和对应图标，且不会自动消失。

### Edge Cases
- 当 Perplexity 页面内容过长或包含复杂嵌套结构时，系统如何确保完整提取？
- 当剪贴板写入失败时（例如浏览器权限问题），系统如何向用户反馈？
- 当 Perplexity 页面还在加载内容时（AI 流式输出中），操作按钮必须禁用并显示"正在加载"提示，直到内容完全加载完成。
- 当 Perplexity 页面包含富媒体内容时，系统必须完整保留：图片转为 `![](url)` 语法，表格转为 Markdown 表格，代码块用 ``` 包围。
- 当 Perplexity 页面的引用格式发生变化时，系统如何保持兼容性？
- 当图片 URL 无效或表格结构过于复杂时，系统如何处理转换错误？

## Requirements *(mandatory)*

### Functional Requirements

#### 页面检测与验证
- **FR-001**: 系统必须能够检测当前浏览器标签页是否为 Perplexity 网站页面（域名为 perplexity.ai）
- **FR-002**: 系统必须能够判断当前 Perplexity 页面是否为合法的 chat 页面类型（Search、DeepResearch 或 Labs）
- **FR-003**: 系统必须在非合法页面时禁用操作按钮并向用户显示明确的提示信息
- **FR-003a**: 系统必须能够检测页面内容是否完全加载完成（AI 回答流式输出是否结束）
- **FR-003b**: 系统必须在页面内容加载过程中禁用操作按钮，并显示"正在加载"提示信息

#### 内容提取
- **FR-004**: 系统必须能够从 Perplexity Search 页面提取对话内容，包括用户问题、AI 回答和引用信息
- **FR-005**: 系统必须能够从 Perplexity DeepResearch 页面提取研究结果内容
- **FR-006**: 系统必须能够从 Perplexity Labs 页面提取对话内容
- **FR-007**: 系统必须在提取过程中将内容样式转换为 Markdown 格式（标题使用 #、加粗使用 **、斜体使用 *、列表使用 - 等）
- **FR-008**: 系统必须在提取过程中保留引用信息，使其在最终输出中可辨识
- **FR-008a**: 系统必须完整保留富媒体内容：图片转换为 `![](url)` 语法，表格转换为 Markdown 表格格式，代码块用 ``` 包围

#### 格式转换
- **FR-009**: 系统必须提供 Formatter 选择器，当前支持 "Tana Paste" 选项
- **FR-010**: 系统必须能够将提取的内容转换为有效的 Tana Paste 格式
- **FR-011**: 系统必须在转换过程中尽可能保留原有的样式信息并映射到 Tana Paste 格式
- **FR-012**: 系统必须在转换过程中保留引用信息并以 Tana 可识别的方式呈现

#### 导出与复制
- **FR-013**: 系统必须提供 Exporter 选择器，当前支持 "Clipboard" 选项
- **FR-014**: 系统必须能够将格式化后的 Tana Paste 文本复制到用户系统剪贴板
- **FR-015**: 系统必须在复制成功后在插件界面内显示成功状态文本和图标
- **FR-016**: 系统必须在复制失败时在插件界面内显示失败原因和重试建议

#### 用户界面
- **FR-017**: 系统必须提供一个浏览器插件界面，包含两个下拉筛选框（Formatter 和 Exporter）
- **FR-018**: 系统必须提供一个一键操作按钮，触发完整的提取→格式化→复制流程
- **FR-019**: 系统必须在界面中清晰显示当前页面是否受支持以及操作按钮的可用状态
- **FR-019a**: 系统必须在插件界面内提供状态显示区域，包含状态文本和对应图标（成功/失败/进行中/空闲）
- **FR-019b**: 系统显示的状态信息不应自动消失，需要用户手动关闭插件或进行下一次操作时更新

#### 验证与反馈
- **FR-020**: 用户必须能够将从剪贴板复制的内容成功粘贴到 Tana 应用中
- **FR-021**: 系统必须确保粘贴到 Tana 后的内容结构与原 Perplexity 页面一致
- **FR-022**: 系统必须确保粘贴到 Tana 后的引用信息可见且可辨识

### Key Entities *(include if feature involves data)*

- **ExtractedContent**: 从 Perplexity 页面提取的原始内容对象，包含以下信息：
  - 内容类型（Search/DeepResearch/Labs）
  - 问题/查询文本
  - 回答/结果内容
  - 样式信息（以 Markdown 格式表示，包括标题 #、加粗 **、斜体 *、列表 - 等）
  - 富媒体内容（图片以 `![](url)` 表示，表格以 Markdown 表格格式表示，代码块以 ``` 包围）
  - 引用列表（每个引用包含：标题、URL）
  - 提取时间戳

- **TanaPaste**: 格式化后的 Tana Paste 文本内容，遵循 Tana Paste 格式规范
  - 纯文本表示
  - 包含 Tana 特定的标记语法
  - 保留样式映射后的格式
  - 包含引用信息的 Tana 表示

- **PageContext**: 当前浏览器页面的上下文信息
  - 页面 URL
  - 页面类型（Search/DeepResearch/Labs/Unknown）
  - 页面合法性状态（是否为支持的 Perplexity chat 页面）
  - 页面加载状态（完全加载/加载中，用于判断是否禁用操作按钮）

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified


---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Additional Context

### 使用模式
此功能设计为开发模式下的个人使用工具，不需要上架发布到浏览器插件商店。用户将在本地加载插件进行使用。

### 工作流集成
此功能是用户个人信息整理工作流的一部分，目标是建立从 Perplexity（信息收集）到 Tana（知识管理）的高效信息流转通道。

### 约束条件
- 仅在 Perplexity.ai 域名下的特定页面类型可用
- URL 形态示例：https://www.perplexity.ai/search/[query-identifier]
- 不支持其他网站或 Perplexity 的非 chat 页面（如首页、设置页等）

### 成功验收标准
1. 能够在示例 URL 页面上正确提取完整对话内容
2. 转换的 Tana Paste 格式能够被 Tana 应用正确识别和解析
3. 粘贴到 Tana 后，内容结构、样式和引用信息完整保留
4. 在非支持页面上功能正确禁用并提供清晰的用户提示
