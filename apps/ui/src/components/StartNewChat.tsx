import { type Component, createSignal } from 'solid-js';
import Dropdown from './Dropdown';

const StartNewChat: Component = () => {
  const [model, setModel] = createSignal('Pick a model');
  const [repository, setRepository] = createSignal('Pick a repository');

  return (
    <div class="flex flex-col items-center gap-4 w-full max-w-2xl">
      <textarea class="textarea bg-base-300 border-0 w-full h-32 resize-none focus:outline-none focus:border-0" placeholder="Type your message..."></textarea>
      
      <div class="flex justify-between w-full">
        <div class="flex gap-2 w-1/2">
          <Dropdown
            label="Model"
            options={['gpt-4', 'claude-3', 'llama-3']}
            value={model()}
            onChange={setModel}
          />
          
          <Dropdown
            label="Repository"
            options={['repo-1', 'repo-2', 'repo-3']}
            value={repository()}
            onChange={setRepository}
          />
        </div>
        
        <button type="button" class="btn btn-ghost h-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5" aria-hidden="true">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 18.974 18.974 0 0 0 14.5-9.373A18.972 18.972 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StartNewChat;
