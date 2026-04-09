import { type Component, type JSX, createSignal, Show } from 'solid-js';

interface SidebarProps {
  children: JSX.Element;
}

const Sidebar: Component<SidebarProps> = (props) => {
  const [collapsed, setCollapsed] = createSignal(false);

  return (
    <div class="flex h-screen">
      <div 
        class={`bg-base-200 flex flex-col border-r border-base-300 transition-all duration-300 ${collapsed() ? 'w-16' : 'w-64'} hidden lg:flex`}
      >
        <div class="p-4 border-b border-base-300 flex justify-center">
          <button 
            type="button" 
            class="btn btn-ghost btn-square btn-sm"
            onClick={() => setCollapsed(!collapsed())}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="size-4" classList={{ 'rotate-180': collapsed() }}>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div class="flex flex-col gap-2 p-4 w-full">
          <button type="button" class="btn btn-ghost w-full" title="Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="size-5 shrink-0"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <Show when={!collapsed()}>
              <span>Dashboard</span>
            </Show>
          </button>
          <button type="button" class="btn btn-ghost w-full" title="Agents">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="size-5 shrink-0"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <Show when={!collapsed()}>
              <span>Agents</span>
            </Show>
          </button>
          <button type="button" class="btn btn-ghost w-full" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="size-5 shrink-0"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
            <Show when={!collapsed()}>
              <span>Settings</span>
            </Show>
          </button>
        </div>
      </div>
      <div class="flex-1 flex flex-col">
        <nav class="navbar bg-base-300">
          <label for="mobile-drawer" class="btn btn-ghost btn-square lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="size-6">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <div class="px-4 font-bold">Self-Hosted Cloud Agents</div>
        </nav>
        <div class="flex-1 flex items-center justify-center p-4">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
