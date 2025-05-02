import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ onSelect, userRole }) {
  const menuItems = [
    { id: 'add', label: 'Add Product', icon: <PlusCircleIcon className="h-5 w-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
  ];

  if (userRole === 'superadmin') {
    menuItems.push(
      { id: 'createAdmin', label: 'Create Admin', icon: <UserPlusIcon className="h-5 w-5" /> },
      { id: 'orders', label: 'Order Tracking', icon: <ClipboardDocumentListIcon className="h-5 w-5" /> }
    );
  }

  return (
    <div className="bg-[#D6305A] text-white rounded-lg shadow p-4 w-full">
      <h2 className="text-xl font-semibold mb-4 ">Dashboard</h2>
      <ul className="space-y-3">
        {menuItems.map(item => (
          <li
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="flex items-center gap-3 cursor-pointer text-whites hover:bg-gray-400 p-2 rounded transition"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
