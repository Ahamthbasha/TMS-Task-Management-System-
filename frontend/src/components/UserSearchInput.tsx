
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { searchUsers, getAllUsers, type UserSearchResult, type UserSearchResponse } from '../api/authAction/userAuth'
import debounce from 'lodash/debounce';
import './UserSearchInput.css';

interface UserSearchInputProps {
  value: string;
  onChange: (userId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Search users by name or email...',
  error
}) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch selected user details if value exists
  useEffect(() => {
    if (value && !selectedUser) {
      getAllUsers()
        .then((response: UserSearchResponse) => {
          const user = response.data.find((u: UserSearchResult) => u.id === value);
          if (user) {
            setSelectedUser(user);
            setQuery(user.name);
          }
        })
        .catch(console.error);
    }
  }, [value, selectedUser]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
          setUsers([]);
          setIsOpen(false);
          setIsLoading(false);
          return;
        }

        try {
          const response = await searchUsers(searchQuery);
          setUsers(response.data);
          setIsOpen(response.data.length > 0);
        } catch (error) {
          console.error('Failed to search users:', error);
          setUsers([]);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (selectedUser) {
      setSelectedUser(null);
      onChange('');
    }
    
    setIsLoading(true);
    debouncedSearch(newQuery);
  };

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setQuery(user.name);
    onChange(user.id);
    setIsOpen(false);
    setUsers([]);
  };

  const handleClear = () => {
    setSelectedUser(null);
    setQuery('');
    onChange('');
    setIsOpen(false);
    setUsers([]);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="user-search-container">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (!selectedUser && query.length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`search-input ${error ? 'input-error' : ''} ${disabled ? 'input-disabled' : ''}`}
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="search-spinner">
            <div className="spinner"></div>
          </div>
        )}
        
        {selectedUser && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear-btn"
            aria-label="Clear selection"
          >
            <svg className="clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && users.length > 0 && (
        <div className="search-dropdown">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className="search-dropdown-item"
            >
              <div className="user-info-wrapper">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              <span className="user-role">{user.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && users.length === 0 && !isLoading && (
        <div className="search-no-results">
          <p className="no-results-text">No users found</p>
        </div>
      )}

      {/* Minimum characters hint */}
      {!selectedUser && query.length > 0 && query.length < 2 && (
        <p className="search-hint">
          Type at least 2 characters to search...
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p className="search-error">{error}</p>
      )}
    </div>
  );
};

export default UserSearchInput;