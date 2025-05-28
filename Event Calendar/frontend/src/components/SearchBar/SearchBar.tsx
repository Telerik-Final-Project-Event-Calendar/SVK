import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../state/app.context";
import { Search } from "lucide-react";

export default function SearchBar() {
  const { searchTerm, setAppState } = useContext(AppContext);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
    if (!expanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppState((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
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
    <div
      ref={containerRef}
      className="relative flex items-center">
      <button
        onClick={toggleExpand}
        className="text-gray-500 hover:text-black focus:outline-none"
        title="Search">
        <Search className="w-5 h-5" />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={searchTerm ?? ""}
        onChange={handleChange}
        placeholder="Search..."
        className={`transition-all duration-300 ml-2 bg-white border border-gray-300 text-gray-700 placeholder-gray-400 rounded-md px-3 py-1 w-0 overflow-hidden focus:outline-none focus:ring focus:ring-blue-300 ${
          expanded ? "w-40 sm:w-64" : "w-0"
        }`}
        style={{ visibility: expanded ? "visible" : "hidden" }}
      />
    </div>
  );
}
