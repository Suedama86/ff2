# Puter Chat Design Guidelines

## Design Approach

**Selected System**: Hybrid approach combining Linear's minimalist typography, ChatGPT's proven chat UX patterns, and Material Design's systematic component structure. This chat interface prioritizes clarity, speed, and seamless multi-model switching.

**Key Principles**:
- Information hierarchy through typography, not decoration
- Instant readability for rapid AI interactions
- Friction-free model switching
- Maximum screen space for conversation content

---

## Typography

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN) - all weights 400, 500, 600
- Monospace: JetBrains Mono - for code blocks in AI responses

**Hierarchy**:
- App Title/Branding: text-xl font-semibold
- Chat Messages (AI): text-base font-normal leading-relaxed
- Chat Messages (User): text-base font-normal
- Model Selector: text-sm font-medium
- Timestamps: text-xs font-normal
- Settings Labels: text-sm font-medium
- Button Text: text-sm font-medium
- Input Placeholder: text-base font-normal

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8, 12, 16, 20
- Micro-spacing (between related elements): 2, 3, 4
- Component padding: 4, 6, 8
- Section spacing: 12, 16, 20
- Container margins: 6, 8, 12

**Grid Structure**:
- Full-height layout: `h-screen flex flex-col`
- Two-column desktop split: Sidebar (320px fixed) + Main chat area (flex-1)
- Mobile: Stack vertically with collapsible sidebar

**Containers**:
- Chat messages container: max-w-4xl mx-auto (centered conversation)
- Sidebar: w-80 (320px fixed width)
- Message bubbles: User messages max-w-2xl ml-auto, AI messages max-w-3xl
- Input area: Full width with max-w-4xl mx-auto inner container

---

## Component Library

### 1. Application Shell

**Header** (h-14, fixed top):
- Left: App logo/title with icon
- Center: Current model badge (pill shape with model name)
- Right: Settings icon button + user menu dropdown
- Border bottom separator (1px)

**Sidebar** (Desktop only, w-80):
- Model Categories accordion:
  - OpenAI (GPT-5, GPT-4.1, o1, o3 series) - 8-10 models listed
  - Anthropic (Claude Sonnet 4, Claude 3.7) - 2-3 models
  - Google (Gemini 2.5 Flash) - 1-2 models
  - xAI (Grok 3, Grok 4 variants) - 5-6 models
  - Meta (Llama 4, Llama 3.3) - 3-4 models
  - DeepSeek (Chat V3.1, Reasoner R1) - 2 models
  - Cohere (Command R variants) - 4-5 models
- Each model as clickable item with hover state
- Active model highlighted with subtle background
- Category headers with expand/collapse icons (Heroicons: ChevronDownIcon/ChevronUpIcon)
- Bottom section: Temperature slider (0-2 range) with current value display
- Search/filter input at top: "Search 400+ models..."

**Mobile Navigation**:
- Bottom sheet/drawer for model selection
- Hamburger menu (Heroicons: Bars3Icon) triggers sidebar
- Floating action button for quick model switch

### 2. Chat Interface

**Message List** (flex-1, overflow-y-auto, pb-32):
- Empty state: Centered welcome card with model capabilities, suggested prompts (4 suggestion chips in 2x2 grid)
- Message items with role-based styling:
  - User messages: Right-aligned, rounded-2xl, px-4 py-3, max-w-2xl
  - AI messages: Left-aligned, rounded-2xl, px-4 py-3, max-w-3xl
- Avatar indicators: 32x32 circular icons (Heroicons: UserCircleIcon for user, SparklesIcon for AI)
- Timestamp below each message: text-xs, mt-1
- Streaming indicator: Animated ellipsis (• • •) for AI responses in progress
- Code blocks: Rounded container with syntax highlighting, copy button (Heroicons: ClipboardDocumentIcon)
- Spacing: space-y-6 between message groups

**Input Area** (fixed bottom, with backdrop blur):
- Multi-line textarea: rounded-2xl, px-6 py-4, min-h-14, max-h-48 auto-expanding
- Right side controls (inline with textarea):
  - Stop generation button when streaming (Heroicons: StopCircleIcon) - size-6
  - Send button (Heroicons: PaperAirplaneIcon) - size-6, rotated -45deg
- Character count indicator (subtle, text-xs) - hidden on mobile
- Attachment button (future feature placeholder) - Heroicons: PaperClipIcon
- Full width with max-w-4xl mx-auto, px-6 py-4

### 3. Model Selector Dropdown (Alternative to Sidebar)

For compact layouts:
- Dropdown trigger: Current model name + icon (Heroicons: ChevronDownIcon)
- Dropdown panel: max-h-96, overflow-y-auto, rounded-xl, shadow-xl
- Searchable with instant filter
- Grouped by provider with dividers
- Each item: py-2 px-4, hover states, checkmark for active model

### 4. Settings Modal

**Triggered from header settings icon** (Heroicons: Cog6ToothIcon):
- Modal overlay: backdrop blur
- Modal panel: max-w-2xl, rounded-2xl, p-8
- Sections with h-12 spacing:
  1. **Model Parameters**:
     - Temperature slider with input field
     - Stream toggle switch
     - Test mode toggle
  2. **Chat History**:
     - Clear conversation button
     - Export chat button
     - Auto-save toggle
  3. **Appearance**:
     - Theme selector (if implementing themes)
     - Message density options (compact/comfortable/spacious)
- Close button: Heroicons: XMarkIcon in top-right corner

### 5. Suggestion Chips (Empty State)

- 4 example prompts in 2x2 grid layout (grid-cols-2 gap-3)
- Each chip: rounded-lg, px-4 py-3, text-sm, border, hover lift effect
- Icons for categories: Heroicons: LightBulbIcon, CodeBracketIcon, ChatBubbleLeftRightIcon, AcademicCapIcon
- Example prompts:
  - "Explain quantum computing"
  - "Write a Python function..."
  - "Compare GPT-5 vs Claude 4"
  - "Help me debug this code"

### 6. Loading & Error States

**Loading (Initial)**:
- Skeleton screens for message list (3-4 placeholder messages)
- Shimmer animation on placeholders

**Streaming**:
- Typewriter effect with smooth text appearance
- Pulsing indicator dot next to avatar

**Error State**:
- Inline error message in chat (rounded-lg, px-4 py-3, border-l-4)
- Retry button (Heroicons: ArrowPathIcon)
- Error icon: Heroicons: ExclamationTriangleIcon

### 7. Conversation Management

**New Chat Button** (top of sidebar):
- Prominent placement with icon (Heroicons: PlusCircleIcon)
- Opens fresh conversation, saves current to history

**Chat History List** (below model selector):
- Collapsed by default, expandable section
- List items: truncated first message, timestamp, model badge
- Hover: Show delete option (Heroicons: TrashIcon)
- Max 20 recent conversations shown

---

## Icons

**Library**: Heroicons (via CDN) - outline style for all icons except filled states
**Size Standards**:
- Navigation/header icons: size-6 (24px)
- Message inline icons: size-5 (20px)
- Small UI elements: size-4 (16px)
- Avatar placeholders: size-8 (32px)

---

## Interaction Patterns

**Model Switching**:
- Click model in sidebar → Instant switch, no confirmation
- Show brief toast notification: "Switched to [Model Name]" (2s duration)

**Message Sending**:
- Enter key sends, Shift+Enter for new line
- Disable send button when textarea empty
- Auto-scroll to bottom on new messages
- Smooth scroll animation (300ms)

**Responsive Behavior**:
- Desktop (lg:): Show permanent sidebar + full chat
- Tablet (md:): Collapsible sidebar, overlay when open
- Mobile: Bottom drawer for models, full-width messages, compact header

**Focus Management**:
- Auto-focus textarea after sending message
- Escape key closes modals/dropdowns
- Keyboard navigation in model selector (arrow keys)

---

## Accessibility

- ARIA labels on all icon buttons
- Keyboard shortcuts: Cmd/Ctrl+K for model search, Cmd/Ctrl+N for new chat
- Focus visible states on all interactive elements (ring-2 ring-offset-2)
- Screen reader announcements for new AI messages
- Skip to main content link
- Message roles properly marked for assistive tech

---

## Responsive Breakpoints

- Mobile: < 768px (base styles)
- Tablet: 768px - 1024px (md:)
- Desktop: > 1024px (lg:)

**Mobile Optimizations**:
- Hide sidebar completely, use modal for model selection
- Reduce message padding: px-3 py-2
- Stack avatar and message content for AI messages
- Floating action button for new chat (bottom-right, size-14)
- Compact header (h-12 instead of h-14)

---

## Performance Considerations

- Virtualize message list for conversations >100 messages
- Lazy load chat history
- Debounce model search input (300ms)
- Optimize re-renders: memo message components
- Smooth scrolling with will-change: transform

This design creates a professional, efficient chat interface that showcases Puter's 400+ model capabilities while maintaining exceptional usability and visual clarity.