# Grok UI Agent Feature Set

The grok-ui target keeps the repository under the hard 1000-file limit.

Integration surface:
- Autonomous task runtime and multi-step planning
- Real-time event/stream protocol
- Permission-gated tool registry
- Persistent task/session state
- Parallel-session-ready task IDs
- Workspace, code-editing, Git/worktree and terminal capability contracts
- MCP/plugin/skill capability contracts
- Scheduled automation capability
- Remote messaging and mobile mirror capability contracts
- Notification/media/document handling contracts
- Cross-session context and evidence-ready event model
- Desktop companion/pet capability flag
- Multi-provider/relay capability flag
- Netlify Function entrypoint for streaming agent events

Desktop-only operations such as real OS terminal processes, Git worktrees,
desktop notifications, persistent daemons and messaging bridges must execute
through an approved native/backend adapter. The browser build must not pretend
those operations succeeded.

Netlify configuration uses a Vite SPA build with dist as the publish directory
and an SPA fallback rewrite.
