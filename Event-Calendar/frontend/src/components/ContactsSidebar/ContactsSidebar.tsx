import { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';

export default function ContactSidebar() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="ml-4 mt-4 max-w-[15rem] overflow-hidden">
      <button
        onClick={() => setShowSearch((prev) => !prev)}
        className="text-2xl cursor-pointer mb-2"
        title="Toggle Search"
      >
        📲
      </button>

      {showSearch && (
        <div className="overflow-hidden">
          <SearchBar
            value={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Search contacts..."
          />
        </div>
      )}
    </div>
  );
}