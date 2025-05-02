import { BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

export default function Header({ user, onLogout, lowStock, socket }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Inventory Manager</h1>
      
      <div className="flex items-center gap-6 relative">
        {/* Notification */}
        <div className="relative group cursor-pointer">
          <BellIcon className="h-6 w-6 text-gray-600" />
          {lowStock && lowStock.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {lowStock.length}
            </span>
          )}
          <div className="absolute right-0 top-8 bg-white border rounded shadow-lg w-64 p-4 hidden group-hover:block z-50">
            <h4 className="font-semibold mb-2 text-sm">Low Stock Alerts</h4>
            {!lowStock || lowStock.length === 0 ? (
              <p className="text-sm text-gray-500">No low stock items.</p>
            ) : (
              <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                {lowStock.map(product => (
                  <li key={product.id}>
                    {product.name} - {product.quantity} left
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center cursor-pointer space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <ChevronDownIcon className="h-5 w-5 text-gray-600" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 bg-white shadow-lg rounded p-2 w-48 z-50">
              <div className="px-3 py-2 border-b text-sm text-gray-700">
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs capitalize text-gray-500">{user.username} {user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}