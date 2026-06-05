import React, { useState } from 'react';

export default function SearchForm({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    onSearch(cleanQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form" noValidate>
      <div className="input-wrapper">
        <input
          type="text"
          className={`search-input ${isShaking ? 'input-error' : ''}`}
          placeholder="Search city (e.g., London, New York, Tokyo)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
        />
        <button type="submit" className="search-btn" aria-label="Search City" disabled={isLoading}>
          {isLoading ? (
            <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="search-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
