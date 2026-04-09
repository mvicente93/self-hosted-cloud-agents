import { type Component, createSignal, onMount, onCleanup } from 'solid-js';

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const Dropdown: Component<DropdownProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;

  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  const handleSelect = (option: string) => {
    props.onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} class="w-1/2 relative">
      <button
        type="button"
        class="btn btn-ghost w-full h-10 justify-between"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen());
        }}
      >
        <span class="truncate">{props.value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-4 shrink-0" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      
      {isOpen() && (
        <ul class="menu menu-sm bg-base-200 rounded-box z-50 w-full mt-1 p-2 shadow absolute left-0 right-0">
          {props.options.map((option) => (
            <li>
              <button
                type="button"
                class="w-full text-left"
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
