'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [menuItems, setMenuItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [modelFile, setModelFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fake tenant ID for testing (Multi-tenant system mein yeh dynamic hoga)
  const tenantId = "restaurant_test_123";

  // Fetch items from VPS Database
  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/menu?tenantId=${tenantId}`);
      const json = await res.json();
      if (json.success) setMenuItems(json.data);
    } catch (err) {
      console.error("Error fetching menu:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle Form Submit to VPS Storage & DB
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('tenantId', tenantId);
      if (modelFile) {
        formData.append('modelFile', modelFile);
      }

      const res = await fetch('/api/menu', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        alert("Item & 3D Model uploaded to VPS successfully!");
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setModelFile(null);
        fetchItems(); // Refresh List
      } else {
        alert("Upload failed: " + json.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8 text-center">Restaurant AR Menu Dashboard (VPS Powered)</h1>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 mb-8">
          <h2 className="text-xl font-bold">Add New AR Menu Item</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Item Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Price ($ or PKR)</label>
              <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
              <input type="text" required value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Starters, Desi" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Upload 3D Model (.glb file)</label>
            <input type="file" accept=".glb" required onChange={e => setModelFile(e.target.files[0])} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-bold">
            {loading ? "Uploading to your VPS Storage..." : "Save Item & Model"}
          </button>
        </form>

        {/* Items List */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Current Menu Items</h2>
          {menuItems.length === 0 ? <p className="text-slate-400 text-sm">No items added yet.</p> : (
            <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <div key={item._id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.description}</p>
                    <span className="text-sm font-semibold text-indigo-400">{item.price}</span>
                  </div>
                  <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg">
                    3D Model Linked
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
      }
                      
