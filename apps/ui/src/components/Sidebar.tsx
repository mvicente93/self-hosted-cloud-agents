import { Component, createSignal, For } from "solid-js";

interface Session {
  id: string;
  name: string;
  repo: string;
}

const Sidebar: Component = () => {
  const [collapsed, setCollapsed] = createSignal(false);
  const [sessions] = createSignal<Session[]>([
    { id: "1", name: "Fix auth bug", repo: "johndoe/myapp" },
    { id: "2", name: "Add tests", repo: "johndoe/myapp" },
    { id: "3", name: "Refactor API", repo: "alice/webapp" },
  ]);

  return (
    <aside
      class={`h-screen bg-[var(--terminal-bg)] border-r border-[var(--terminal-green)]/20 flex flex-col transition-all duration-300 ${
        collapsed() ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse Icon */}
      <div class="p-4 border-b border-[var(--terminal-green)]/10">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed())}
          class="terminal-text text-[var(--terminal-cyan)] hover:text-[var(--terminal-green)] transition-colors text-lg"
        >
          {collapsed() ? "▶" : "◀"}
        </button>
      </div>

      {/* New Agent Button */}
      <div class="p-4 border-b border-[var(--terminal-green)]/10">
        <button
          type="button"
          class={`terminal-text text-sm bg-[var(--terminal-green)] text-[var(--terminal-bg)] px-4 py-2 font-bold hover:opacity-90 transition-opacity ${
            collapsed() ? "w-full" : "w-full"
          }`}
        >
          {collapsed() ? "+" : "+ NEW AGENT"}
        </button>
      </div>

      {/* Sessions List */}
      <div class="flex-1 overflow-y-auto p-2">
        <div class={`terminal-text text-xs text-[var(--terminal-yellow)] mb-2 ${collapsed() ? "hidden" : "block"}`}>
          {'> PREVIOUS SESSIONS'}
        </div>
        <For each={sessions()}>
          {(session) => (
            <button
              type="button"
              class={`w-full text-left p-3 border border-[var(--terminal-green)]/10 hover:border-[var(--terminal-green)]/30 hover:bg-black/30 transition-all mb-2 ${
                collapsed() ? "flex justify-center" : ""
              }`}
            >
              {collapsed() ? (
                <span class="terminal-text text-[var(--terminal-green)] text-lg">●</span>
              ) : (
                <div>
                  <div class="terminal-text text-sm text-[var(--terminal-green)] font-bold truncate">
                    {session.name}
                  </div>
                  <div class="terminal-text text-xs text-gray-500 truncate">
                    {session.repo}
                  </div>
                </div>
              )}
            </button>
          )}
        </For>
      </div>
    </aside>
  );
};

export default Sidebar;