import { Component, createSignal, For } from "solid-js";

type Message = {
    role: "user" | "assistant";
    content: string;
};

const AgentInterface: Component = () => {
    const [prompt, setPrompt] = createSignal("");
    const [selectedRepo, setSelectedRepo] = createSignal("johndoe/myapp");
    const [selectedBranch, setSelectedBranch] = createSignal("main");
    const [selectedModel, setSelectedModel] = createSignal("gpt-4");
    const [messages, setMessages] = createSignal<Message[]>([]);
    const [chatStarted, setChatStarted] = createSignal(false);

    const repos = [
        "johndoe/myapp",
        "alice/webapp",
        "bob/api-service",
        "charlie/frontend",
    ];

    const branches = ["main", "develop", "feature/new-feature", "hotfix/bug"];
    const models = ["gpt-4", "gpt-3.5-turbo", "claude-3", "llama-3"];

    const handleSubmit = () => {
        if (!prompt().trim()) return;

        const userMessage: Message = { role: "user", content: prompt() };
        const agentMessage: Message = {
            role: "assistant",
            content:
                "Processing your request... Agent response will appear here once connected to backend.",
        };

        setMessages([...messages(), userMessage, agentMessage]);
        setPrompt("");
        setChatStarted(true);
    };

    return (
        <main class="flex-1 h-screen bg-[var(--terminal-bg)] flex flex-col">
            <div class="flex-1 p-8 overflow-y-auto">
                <div class="max-w-4xl mx-auto">
                    {/* Chat History */}
                    {chatStarted() && (
                        <div class="mb-6 space-y-4">
                            <For each={messages()}>
                                {(msg) => (
                                    <div
                                        class={`p-4 bg-black/30 border-l-4 terminal-text text-sm ${
                                            msg.role === "user"
                                                ? "border-[var(--terminal-cyan)] text-gray-200"
                                                : "border-[var(--terminal-green)] text-gray-200"
                                        }`}
                                    >
                                        <span
                                            class={`block text-xs mb-1 ${
                                                msg.role === "user"
                                                    ? "text-[var(--terminal-cyan)]"
                                                    : "text-[var(--terminal-green)]"
                                            }`}
                                        >
                                            {msg.role === "user"
                                                ? ">"
                                                : "AGENT>"}
                                        </span>
                                        {msg.content}
                                    </div>
                                )}
                            </For>
                        </div>
                    )}

                    {/* Prompt Section */}
                    <div class="mb-6">
                        <label class="terminal-text text-[var(--terminal-cyan)] text-sm mb-2 block">
                            {chatStarted() ? "> PROMPT" : "> AGENT PROMPT"}
                        </label>
                        <textarea
                            value={prompt()}
                            onInput={(e) => setPrompt(e.currentTarget.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.ctrlKey) {
                                    handleSubmit();
                                }
                            }}
                            placeholder="Describe what you want the agent to do..."
                            class="w-full h-40 bg-black/50 border border-[var(--terminal-green)]/30 text-gray-200 p-4 terminal-text text-sm resize-none focus:outline-none focus:border-[var(--terminal-green)] placeholder-gray-600"
                        />
                    </div>

                    {/* Options Row */}
                    <div class="flex flex-wrap gap-4 mb-6">
                        {/* Repository Dropdown */}
                        <div class="flex-1 min-w-[200px]">
                            <label class="terminal-text text-[var(--terminal-yellow)] text-xs mb-2 block">
                                {"> REPOSITORY"}
                            </label>
                            <select
                                value={selectedRepo()}
                                onChange={(e) =>
                                    setSelectedRepo(e.currentTarget.value)
                                }
                                class="w-full bg-black/50 border border-[var(--terminal-cyan)]/30 text-gray-200 p-3 terminal-text text-sm focus:outline-none focus:border-[var(--terminal-cyan)] appearance-none cursor-pointer"
                                style={{
                                    "background-image": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2300d4ff' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
                                    "background-repeat": "no-repeat",
                                    "background-position": "right 12px center",
                                    "background-size": "12px",
                                }}
                            >
                                <For each={repos}>
                                    {(repo) => (
                                        <option value={repo}>{repo}</option>
                                    )}
                                </For>
                            </select>
                        </div>

                        {/* Branch Dropdown */}
                        <div class="min-w-[150px]">
                            <label class="terminal-text text-[var(--terminal-yellow)] text-xs mb-2 block">
                                {"> BRANCH"}
                            </label>
                            <select
                                value={selectedBranch()}
                                onChange={(e) =>
                                    setSelectedBranch(e.currentTarget.value)
                                }
                                class="w-full bg-black/50 border border-[var(--terminal-cyan)]/30 text-gray-200 p-3 terminal-text text-sm focus:outline-none focus:border-[var(--terminal-cyan)] appearance-none cursor-pointer"
                                style={{
                                    "background-image": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2300d4ff' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
                                    "background-repeat": "no-repeat",
                                    "background-position": "right 12px center",
                                    "background-size": "12px",
                                }}
                            >
                                <For each={branches}>
                                    {(branch) => (
                                        <option value={branch}>{branch}</option>
                                    )}
                                </For>
                            </select>
                        </div>

                        {/* Model Dropdown */}
                        <div class="min-w-[150px]">
                            <label class="terminal-text text-[var(--terminal-yellow)] text-xs mb-2 block">
                                {"> MODEL"}
                            </label>
                            <select
                                value={selectedModel()}
                                onChange={(e) =>
                                    setSelectedModel(e.currentTarget.value)
                                }
                                class="w-full bg-black/50 border border-[var(--terminal-cyan)]/30 text-gray-200 p-3 terminal-text text-sm focus:outline-none focus:border-[var(--terminal-cyan)] appearance-none cursor-pointer"
                                style={{
                                    "background-image": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2300d4ff' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
                                    "background-repeat": "no-repeat",
                                    "background-position": "right 12px center",
                                    "background-size": "12px",
                                }}
                            >
                                <For each={models}>
                                    {(model) => (
                                        <option value={model}>{model}</option>
                                    )}
                                </For>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div class="flex items-end">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!prompt().trim()}
                                class="terminal-text text-sm bg-[var(--terminal-green)] text-[var(--terminal-bg)] px-8 py-3 font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                SEND_
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AgentInterface;
