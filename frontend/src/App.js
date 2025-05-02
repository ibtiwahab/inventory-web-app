import { useState, useEffect } from 'react';
import API from './api';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import Sidebar from './components/Sidebar';
import OrderTracking from './components/OrderTracking';
import Login from './pages/Login';
import axios from 'axios';
import OrderModal from './components/OrderModal';
import CreateAdmin from './components/CreateAdmin'; 
import Header from './components/Header'; 
import { io } from 'socket.io-client';

function App() {
  const [selectedTab, setSelectedTab] = useState('add');
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      newSocket.on('lowStockUpdate', (data) => {
        console.log('Received low stock update:', data);
        setLowStock(data);
      });
      
      // Add new event listener for inventory updates
      newSocket.on('inventoryUpdate', () => {
        console.log('Received inventory update, refreshing products');
        fetchProducts();
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const handleOrder = (product) => {
    setSelectedProduct(product);
    setShowOrderModal(true);
  };

  const handleOrderSubmit = async (productId, qty) => {
    if (!qty || isNaN(qty) || qty <= 0) {
      alert('Invalid quantity.');
      return;
    }
  
    try {
      // Make sure we have the token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to place orders.');
        return;
      }
  
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productId: parseInt(productId), // Ensure productId is a number
          quantity: parseInt(qty)  // Ensure quantity is a number
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert('Order submitted successfully and awaiting approval!');
        // Note: We no longer update inventory here as it happens upon approval
      } else {
        console.error('Order submission error:', data.error);
        alert('Failed: ' + (data.error || 'Unknown error occurred'));
      }
    } catch (err) {
      console.error('Order submission exception:', err);
      alert('Something went wrong: ' + err.message);
    }
  
    setShowOrderModal(false);
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await API.get('/products');
      setProducts(res.data);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (id) => {
    await API.delete(`/products/${id}`);
    fetchProducts();
    // Also fetch low stock after deleting a product
    fetchLowStock();
  };

  const fetchLowStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/products/low-stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLowStock(res.data);
    } catch (err) {
      console.error('Error fetching low stock products:', err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      fetchProducts();
      fetchLowStock();
      if (userData.role === 'superadmin') fetchUsers();
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    fetchProducts();
    fetchLowStock();
    if (userData.role === 'superadmin') fetchUsers();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (socket) {
      socket.disconnect();
    }
  };

  // This function will be called when order status changes
  const handleOrderStatusChange = () => {
    fetchProducts();
    fetchLowStock();
  };

  const refreshData = () => {
    fetchProducts();
    fetchLowStock();
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Header user={user} lowStock={lowStock} onLogout={handleLogout} socket={socket} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Sidebar
          onSelect={setSelectedTab}
          userRole={user.role}
        />

        <div className="bg-white p-4 rounded shadow-md md:col-span-2 space-y-6">
          {selectedTab === 'add' && (
            <ProductForm
              selected={selected}
              refresh={refreshData}
              clear={() => setSelected(null)}
            />
          )}

          {selectedTab === 'inventory' && (
            <ProductList
              products={products}
              select={setSelected}
              remove={(id) => {
                deleteProduct(id);
              }}
              handleOrder={handleOrder}
              refresh={refreshData} 
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              showOrderModal={showOrderModal}
              setShowOrderModal={setShowOrderModal}
            />
          )}

          {selectedTab === 'orders' && (
            <OrderTracking 
              onOrderStatusChange={handleOrderStatusChange} 
              socket={socket}
            />
          )}

          {selectedTab === 'createAdmin' && user.role === 'superadmin' && (
            <CreateAdmin fetchUsers={fetchUsers} />
          )}
        </div>
      </div>

      {showOrderModal && selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setShowOrderModal(false)}
          onOrder={(productId, qty) => {
            handleOrderSubmit(productId, qty);
          }}
        />
      )}

      {/* Floating low stock alert (commented out in your original code) */}
      {/* {lowStock.length > 0 && showLowStockAlert && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg max-w-md z-50">
          <button
            onClick={() => setShowLowStockAlert(false)}
            className="absolute top-1 right-2 text-white text-2xl hover:text-gray-300 font-bold"
            aria-label="Close"
          >
            &times;
          </button>
          <p className="font-bold mb-1">Low Stock Alert!</p>
          <ul className="text-sm list-disc list-inside">
            {lowStock.map(product => (
              <li key={product.id}>
                {product.name} - {product.quantity} left
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
}

export default App;