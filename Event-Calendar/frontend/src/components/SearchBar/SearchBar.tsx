import { useContext, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

/**
 * SearchBar component
 *
 * A responsive search input field designed for dynamic expansion and collapse.
 * It provides a clean way for users to initiate a search and manages its own
 * internal input state until the search is explicitly triggered.
 *
 * Props:
 * @param {string} value - The current search term controlled by the parent component.
 * @param {(searchTerm: string) => void} onSearch - Callback function invoked when the 'Enter' key is pressed
 * within the input field or when the search bar collapses (to clear the search).
 * @param {string} [placeholder="Search..."] - Optional placeholder text for the input field.
 *
 * Behavior:
 * - **Expansion:** The input field expands gracefully when the search icon is clicked,
 * and automatically focuses for immediate typing.
 * - **Collapse:** The input field collapses when clicking the search icon again or
 * when clicking anywhere outside the search bar area.
 * - **Search Trigger:** The `onSearch` callback is executed when the 'Enter' key is pressed.
 * - **Automatic Clear on Collapse:** Any text currently in the search input is automatically
 * cleared, and the `onSearch` callback is invoked with an empty string, effectively
 * resetting the search filter in the parent component.
 *
 * Accessibility:
 * - Includes focus management for improved user experience.
 *
 * Example usage:
 * ```tsx
 * <SearchBar
 * value={mySearchTerm}
 * onSearch={setMySearchTerm}
 * placeholder="Search..."
 * />
 * ```
 */
export default function SearchBar({
  value,
  onSearch,
  placeholder = "Search...",
}: SearchBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingClearRef = useRef(false); // 🔧 флаг за deferred onSearch("")

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (!expanded && pendingClearRef.current) {
      onSearch("");
      pendingClearRef.current = false;
    }
  }, [expanded]);

  const toggleExpand = () => {
    setExpanded((prev) => {
      if (prev) {
        setInternalValue("");
        pendingClearRef.current = true;
        inputRef.current?.blur();
      } else {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      return !prev;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(internalValue);
      inputRef.current?.blur();
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      if (expanded) {
        setInternalValue("");
        onSearch("");
      }
      setExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center group">
      <button
        onClick={toggleExpand}
        className="text-gray-500 hover:text-black focus:outline-none p-2 rounded-md hover:bg-gray-100"
        title="Search"
      >
        <Search className="w-5 h-5" />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`transition-all duration-300 ml-2 bg-white border border-gray-300 text-gray-700 placeholder-gray-400 rounded-md px-3 py-1 overflow-hidden focus:outline-none focus:ring focus:ring-blue-300 ${
          expanded ? "w-full" : "w-0"
        }`}
        style={{ visibility: expanded ? "visible" : "hidden" }}
      />
    </div>
  );
}