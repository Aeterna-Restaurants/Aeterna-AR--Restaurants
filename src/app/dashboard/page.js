'use client';

import { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [modelFile, setModelFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        // Fetch Tenant details
        const tenantDoc = await getDoc(doc(db, 'tenants', currentUser.uid));
        if (tenantDoc.exists()) {
          setTenant(tenantDoc.data());
          
          // Real-time fetch menu items for this specific tenant
          const q = query(collection(db, 'menu_items'), where('tenantId', '==', currentUser.uid));
          const unsubscribeMenu = onSnapshot(q, (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() });
            });
            setMenuItems(items);
            setLoading(false);
          });

          return () => unsubscribeMenu();
        }
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!modelFile) {
      alert('Please upload a 3D Model (.glb file) for AR view.');
      return;
    }
    setUploading(true);

    try {
      // 1. Upload 3D Model to Firebase Storage
      const storageRef = ref(storage, `models/${user.uid}/${Date.now()}_${modelFile.name}`);
      const snapshot = await uploadBytes(storageRef, modelFile);
      const modelUrl = await getDownloadURL(snapshot.ref);

      // 2. Save Item details to Firestore
      await addDoc(collection(db, 'menu_items'), {
        name,
        price: parseFloat(price),
        description,
        category: category.toLowerCase(),
        modelUrl,
        tenantId: user.uid,
        createdAt: new Date().toISOString()
      });

      // Reset Form
      setName('');
      setPrice('');
      setDescription('');
      setCategory('');
      setModelFile(null);
      alert('Menu item added successfully with 3D AR Model!');
    } catch (error) {
      alert('Error adding item: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'menu_items', id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-black text-indigo-400 tracking-wider mb-1">Aeterna Dashboard</h2>
          <p className="text-xs text-slate-400 font-medium mb-8">Logged in as: <span className="text-slate-200">{tenant?.restaurantName}</span></p>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Live AR Menu Link</h4>
            <a 
              href={`/menu/${tenant?.slug}`} 
              target="_blank" 
              className="text-sm text-indigo-400 hover:underline break-all font-semibold"
            >
              /menu/{tenant?.slug}
            </a>
          </div>
        </div>

        <button 
          onClick={() => signOut(auth)} 
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2.5 rounded-xl border border-red-500/20 transition mt-4"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Add Item Form */}
        <section className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-bold mb-6 text-white">Add New Menu Item</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Item Name</label>
              <input 
                type="text" required placeholder="e.g., Cheesy Pizza"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price ($)</label>
                <input 
                  type="number" step="0.01" required placeholder="12.99"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  value={price} onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <input 
                  type="text" required placeholder="e.g., Pizza"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  value={category} onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                rows="3" required placeholder="Freshly baked with extra mozzarella..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                value={description} onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">3D Model File (.glb only)</label>
              <input 
                type="file" accept=".glb" required
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20"
                onChange={(e) => setModelFile(e.target.files[0])}
              />
            </div>
            <button 
              type="submit" disabled={uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white font-bold py-3 rounded-xl transition text-sm mt-4 shadow-lg shadow-indigo-600/10"
            >
              {uploading ? 'Uploading 3D Assets...' : 'Save Product'}
            </button>
          </form>
        </section>

        {/* Right Side: Live Menu List */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6 text-white">Current Digital Menu</h3>
          {menuItems.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No items added yet. Use the form on the left to add your first dish!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-4 font-semibold text-white">{item.name}</td>
                      <td className="py-4 capitalize"><span className="bg-slate-800 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-md">{item.category}</span></td>
                      <td className="py-4 text-indigo-400 font-bold">${item.price.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-400 hover:text-red-300 font-bold bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/10 transition text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

