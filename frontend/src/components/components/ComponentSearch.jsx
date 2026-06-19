const CATEGORIES = ['All', 'Frame', 'Tyre', 'Gear Set', 'Seat', 'Brake'];

/**
 * Search and filter bar for component listing
 */
const ComponentSearch = ({ search, onSearchChange, category, onCategoryChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search components..."
          className="input pl-9"
          aria-label="Search components"
        />
      </div>

      {/* Category Filter */}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="select w-full sm:w-44"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
};

export default ComponentSearch;
