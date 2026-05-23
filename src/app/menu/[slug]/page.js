'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

export default function CustomerMenuPage({ params }) {
  const { slug } = params; // Get restaurant slug from URL (e.g., /menu/spice-grill)
  const [tenant, setTenant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null); // Tracking current 3D AR view modal

  useEffect(() => {
    const fetchTenantAndMenu = async () => {
      try {
        // 1. Find restaurant details using the URL slug
        const tenantQuery = query(collection(db, 'tenants'), where('slug', '==', slug));
        const tenantSnapshot = await getDocs(tenantQuery);

        if (tenantSnapshot.empty) {
          setLoading(false);
          return;
        }

        const tenantDoc = tenantSnapshot.docs[0];
        const tenantData = tenantDoc.data();
        setTenant(tenantData);

        // 2. Fetch all menu items belonging to this restaurant's ownerId
        const menuQuery = query(collection(db, 'menu_items'), where('tenantId', '==', tenantData.ownerId));
        const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
          const items = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          setMenuItems(items);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching menu data:", error);
        setLoading(false);
      }
    };

    fetchTenantAndMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 font-bold text-lg">
        Loading Digital Menu...
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500 font-bold text-lg">
        Restaurant Not Found!
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-20">
      {/* Restaurant Header Branding */}
      <header className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-10 py-5 text-center">
        <h1 className="text-2xl font-black tracking-tight text-stone-800 uppercase">{tenant.restaurantName}</h1>
        <p className="text-xs text-indigo-600 font-bold tracking-widest uppercase mt-1">✨ Live 3D AR Menu</p>
      </header>

      {/* Grid of Menu Cards */}
      <main className="max-w-2xl mx-auto px-4 pt-8">
        {menuItems.length === 0 ? (
          <p className="text-stone-500 text-center py-12 text-sm font-medium">This restaurant hasn't added any dishes to their digital menu yet.</p>
        ) : (
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200/60 flex justify-between items-center gap-4">
                <div className="flex-grow">
                  <span className="inline-block bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mb-1">{item.name}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2 pr-2 mb-2">{item.description}</p>
                  <p className="text-sm font-black text-indigo-600">${item.price.toFixed(2)}</p>
                </div>
                
                {/* View in AR Trigger Button */}
                <button
                  onClick={() => setActiveItem(item)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md shadow-indigo-600/10 flex flex-col items-center gap-1 shrink-0 transition"
                >
                  <span>View in</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase">3D / AR</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* AR Model Viewer Modal Popup */}
      {activeItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-between animate-fadeIn">
          {/* Top Panel Actions */}
          <div className="p-4 flex justify-between items-center w-full z-10 bg-gradient-to-b from-black/60 to-transparent">
            <div>
              <h4 className="text-white font-black text-base">{activeItem.name}</h4>
              <p className="text-stone-400 text-xs">${activeItem.price.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => setActiveItem(null)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold h-10 w-10 rounded-full flex items-center justify-center transition border border-white/10"
            >
              ✕
            </button>
          </div>

          {/* Web XR Google Model Viewer Web Component */}
          <div className="w-full h-full flex items-center justify-center relative">
            <model-viewer
              src={activeItem.modelUrl}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              touch-action="none"
              shadow-intensity="1.5"
              exposure="1.2"
              autoplay
              style={{ width: '100%', height: '100%', absolute: 'inset-0' }}
            >
              <button 
                slot="ar-button" 
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-black px-6 py-3 rounded-full shadow-xl shadow-indigo-600/30 border border-indigo-400 transition animate-bounce text-sm"
              >
                👋 Place on your Table (AR)
              </button>
            </model-viewer>
          </div>
        </div>
      )}
    </div>
  );
                                                                    }
        
