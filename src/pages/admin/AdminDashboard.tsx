import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { LogOut, Plus, Trash2, Edit2, Save, LayoutDashboard, Package, MessageSquare, HelpCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  // Home Content State
  const [homeContent, setHomeContent] = useState<any>({ headline: '', description: '', imageUrl: '', whatsappNumber: '', shopeeUrl: '', tokopediaUrl: '', faviconUrl: '' });
  const [savingHome, setSavingHome] = useState(false);

  // Products State
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
         // Verify admin status (we skip actual collection check here for simplicity, but backend rules will reject if not admin)
         setUser(user);
         fetchData();
      } else {
         navigate('/admin/login');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const fetchData = async () => {
    try {
       const homeDoc = await getDoc(doc(db, 'content', 'home'));
       if (homeDoc.exists()) setHomeContent(homeDoc.data());

       const prodsSnap = await getDocs(collection(db, 'products'));
       setProducts(prodsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
       handleFirestoreError(e, OperationType.GET, 'multiple');
    }
  };

  const handleSaveHome = async () => {
     setSavingHome(true);
     try {
        await setDoc(doc(db, 'content', 'home'), {
           ...homeContent,
           updatedAt: new Date().toISOString()
        });
        alert('Pengaturan Home berhasil disimpan!');
     } catch (e: any) {
        alert(e.message || 'Gagal menyimpan');
        handleFirestoreError(e, OperationType.UPDATE, 'content/home');
     } finally {
        setSavingHome(false);
     }
  };

  const handleAddProduct = async () => {
      try {
         const newProd = { name: 'Produk Baru', description: 'Deskripsi', price: 10000, imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80', variant: 'Original', createdAt: new Date().toISOString() };
         const docRef = await addDoc(collection(db, 'products'), newProd);
         setProducts([...products, { id: docRef.id, ...newProd }]);
      } catch (e) {
         handleFirestoreError(e, OperationType.CREATE, 'products');
      }
  };

  const handleDeleteProduct = async (id: string) => {
      if (!confirm('Yakin ingin menghapus?')) return;
      try {
         await deleteDoc(doc(db, 'products', id));
         setProducts(products.filter(p => p.id !== id));
      } catch (e) {
         handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
      }
  };

  const handleUpdateProduct = async (id: string, field: string, value: any) => {
     const updatedProducts = products.map(p => p.id === id ? { ...p, [field]: value } : p);
     setProducts(updatedProducts);
  };

  const handleSaveProduct = async (id: string) => {
      const prod = products.find(p => p.id === id);
      if (!prod) return;
      try {
         const { id: _, ...dataToSave } = prod;
         await updateDoc(doc(db, 'products', id), dataToSave);
         alert('Produk disimpan');
      } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `products/${id}`);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
       {/* Sidebar */}
       <div className="w-64 bg-brand-dark text-white p-6">
          <div className="font-serif font-bold text-2xl mb-10 text-brand-caramel-light">CMS Gipang</div>
          <nav className="space-y-2">
             <button onClick={() => setActiveTab('home')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'home' ? 'bg-brand-caramel-dark' : 'hover:bg-white/10'}`}>
                <LayoutDashboard className="w-5 h-5" /> <span>Home Settings</span>
             </button>
             <button onClick={() => setActiveTab('products')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-brand-caramel-dark' : 'hover:bg-white/10'}`}>
                <Package className="w-5 h-5" /> <span>Produk</span>
             </button>
          </nav>
          <div className="absolute bottom-6 w-52 border-t border-white/10 pt-6">
             <div className="text-sm text-gray-400 mb-4 px-4 line-clamp-1">{user?.email}</div>
             <button onClick={() => signOut(auth)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-red-400">
                <LogOut className="w-5 h-5" /> <span>Logout</span>
             </button>
          </div>
       </div>

       {/* Content */}
       <div className="flex-1 p-10 overflow-y-auto">
          {activeTab === 'home' && (
             <div className="max-w-3xl">
                <h1 className="text-3xl font-bold text-brand-dark mb-8">Pengaturan Halaman Utama</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Headline</label>
                      <input type="text" value={homeContent.headline} onChange={e => setHomeContent({...homeContent, headline: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi</label>
                      <textarea value={homeContent.description} onChange={e => setHomeContent({...homeContent, description: e.target.value})} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel"></textarea>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">URL Gambar Utama (Hero)</label>
                      <input type="text" value={homeContent.imageUrl} onChange={e => setHomeContent({...homeContent, imageUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel" />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Nomor WhatsApp (Contoh: 62812...)</label>
                         <input type="text" value={homeContent.whatsappNumber} onChange={e => setHomeContent({...homeContent, whatsappNumber: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Link Shopee</label>
                         <input type="text" value={homeContent.shopeeUrl} onChange={e => setHomeContent({...homeContent, shopeeUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="https://shopee.co.id/..." />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Link Tokopedia</label>
                         <input type="text" value={homeContent.tokopediaUrl} onChange={e => setHomeContent({...homeContent, tokopediaUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="https://tokopedia.com/..." />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Logo/Favicon URL</label>
                         <input type="text" value={homeContent.faviconUrl} onChange={e => setHomeContent({...homeContent, faviconUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                   </div>
                   <div className="pt-4">
                      <button onClick={handleSaveHome} disabled={savingHome} className="flex items-center justify-center px-6 py-3 bg-brand-terracotta text-white rounded-xl hover:bg-brand-caramel-dark font-medium">
                         <Save className="w-5 h-5 mr-2" /> {savingHome ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'products' && (
             <div>
                <div className="flex items-center justify-between mb-8">
                   <h1 className="text-3xl font-bold text-brand-dark">Daftar Produk</h1>
                   <button onClick={handleAddProduct} className="flex items-center px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-caramel-dark">
                      <Plus className="w-5 h-5 mr-2" /> Tambah Produk
                   </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   {products.map(p => (
                      <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-6">
                         <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                            <img src={p.imageUrl} alt="preview" className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Nama Produk</label>
                               <input type="text" value={p.name} onChange={e => handleUpdateProduct(p.id, 'name', e.target.value)} className="w-full px-3 py-1.5 border rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Harga (Rp)</label>
                               <input type="number" value={p.price} onChange={e => handleUpdateProduct(p.id, 'price', Number(e.target.value))} className="w-full px-3 py-1.5 border rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Varian / Kategori</label>
                               <input type="text" value={p.variant} onChange={e => handleUpdateProduct(p.id, 'variant', e.target.value)} className="w-full px-3 py-1.5 border rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">URL Gambar</label>
                               <input type="text" value={p.imageUrl} onChange={e => handleUpdateProduct(p.id, 'imageUrl', e.target.value)} className="w-full px-3 py-1.5 border rounded" />
                            </div>
                            <div className="col-span-2">
                               <label className="block text-xs font-bold text-gray-500 mb-1">Deskripsi Singkat</label>
                               <input type="text" value={p.description} onChange={e => handleUpdateProduct(p.id, 'description', e.target.value)} className="w-full px-3 py-1.5 border rounded" />
                            </div>
                            <div className="col-span-2 flex justify-end space-x-3 mt-2">
                               <button onClick={() => handleDeleteProduct(p.id)} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center">
                                  <Trash2 className="w-4 h-4 mr-1" /> Hapus
                               </button>
                               <button onClick={() => handleSaveProduct(p.id)} className="px-4 py-2 bg-brand-terracotta text-white rounded-lg flex items-center">
                                  <Save className="w-4 h-4 mr-1" /> Simpan
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                   {products.length === 0 && <div className="text-gray-500">Belum ada produk.</div>}
                </div>
             </div>
          )}
       </div>
    </div>
  );
}
