import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { LogOut, Plus, Trash2, Save, LayoutDashboard, Package, MessageSquare, HelpCircle, User, FileText } from 'lucide-react';

const ImageInput = ({ value, onChange, label = 'URL Gambar' }: { value: string, onChange: (v: string) => void, label?: string }) => {
  const [mode, setMode] = React.useState<'url' | 'upload'>('url');
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
             const canvas = document.createElement('canvas');
             const MAX_WIDTH = 800; // max size for firebase limits
             const MAX_HEIGHT = 800;
             let width = img.width;
             let height = img.height;
             if (width > height) {
                  if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
             } else {
                  if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
             }
             canvas.width = width;
             canvas.height = height;
             const ctx = canvas.getContext('2d');
             if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                onChange(canvas.toDataURL('image/webp', 0.8));
             }
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50/50">
       <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-bold text-gray-700">{label}</label>
          <div className="flex space-x-2 text-xs">
             <button onClick={() => setMode('url')} className={`px-2 py-1 rounded transition-colors ${mode === 'url' ? 'bg-brand-dark text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>URL</button>
             <button onClick={() => setMode('upload')} className={`px-2 py-1 rounded transition-colors ${mode === 'upload' ? 'bg-brand-dark text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Upload</button>
          </div>
       </div>
       {mode === 'url' ? (
          <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel text-sm" placeholder="https://..." />
       ) : (
          <div className="space-y-2">
             <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-cream file:text-brand-caramel-dark hover:file:bg-brand-caramel-light transition-colors" />
             {value && value.startsWith('data:image') && <span className="text-xs text-green-600 flex items-center mt-1"><Save className="w-3 h-3 mr-1" /> Gambar telah disiapkan</span>}
          </div>
       )}
    </div>
  );
};

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  // Home Content State
  const [homeContent, setHomeContent] = useState<any>({ 
    headline: '', description: '', imageUrl: '', whatsappNumber: '', shopeeUrl: '', tokopediaUrl: '', faviconUrl: '',
    aboutTitle: '', aboutDesc1: '', aboutDesc2: '', aboutImageUrl: ''
  });
  const [savingHome, setSavingHome] = useState(false);

  // Lists State
  const [products, setProducts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
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

       const [prodsSnap, testisSnap, faqsSnap, articlesSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'testimonials')),
          getDocs(collection(db, 'faq')),
          getDocs(collection(db, 'articles'))
       ]);

       setProducts(prodsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
       setTestimonials(testisSnap.docs.map(d => ({ id: d.id, ...d.data() })));
       setFaqs(faqsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
       setArticles(articlesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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

  // Generic List Operations
  const handleAddItem = async (colName: string, defaultData: any, setState: Function, state: any[]) => {
      try {
         const data = { ...defaultData, createdAt: new Date().toISOString() };
         const docRef = await addDoc(collection(db, colName), data);
         setState([{ id: docRef.id, ...data }, ...state]);
      } catch (e) {
         handleFirestoreError(e, OperationType.CREATE, colName);
      }
  };

  const handleDeleteItem = async (colName: string, id: string, setState: Function, state: any[]) => {
      if (!confirm('Yakin ingin menghapus?')) return;
      try {
         await deleteDoc(doc(db, colName, id));
         setState(state.filter(item => item.id !== id));
      } catch (e) {
         handleFirestoreError(e, OperationType.DELETE, `${colName}/${id}`);
      }
  };

  const handleUpdateItemField = (id: string, field: string, value: any, setState: Function, state: any[]) => {
     setState(state.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSaveItem = async (colName: string, id: string, state: any[]) => {
      const item = state.find(i => i.id === id);
      if (!item) return;
      try {
         const { id: _, ...dataToSave } = item;
         await updateDoc(doc(db, colName, id), dataToSave);
         alert('Data disimpan');
      } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `${colName}/${id}`);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
       {/* Sidebar */}
       <div className="w-64 bg-brand-dark text-white p-6 shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto">
          <div className="font-serif font-bold text-2xl mb-10 text-brand-caramel-light">CMS Gipang</div>
          <nav className="space-y-2 flex-1">
             <button onClick={() => setActiveTab('home')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'home' ? 'bg-brand-caramel-dark' : 'hover:bg-white/10'}`}>
                <LayoutDashboard className="w-5 h-5" /> <span>Halaman Utama</span>
             </button>
             <button onClick={() => setActiveTab('products')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-brand-caramel-dark' : 'hover:bg-white/10'}`}>
                <Package className="w-5 h-5" /> <span>Produk</span>
             </button>
             <button onClick={() => setActiveTab('articles')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'articles' ? 'bg-brand-caramel-dark' : 'hover:bg-white/10'}`}>
                <FileText className="w-5 h-5" /> <span>Artikel</span>
             </button>
             <button onClick={() => setActiveTab('testimonials')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'testimonials' ? 'bg-brand-caramel-dark' : 'hover:bg-white/10'}`}>
                <MessageSquare className="w-5 h-5" /> <span>Testimoni</span>
             </button>
             <button onClick={() => setActiveTab('faq')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'faq' ? 'bg-brand-caramel-dark' : 'hover:bg-white/10'}`}>
                <HelpCircle className="w-5 h-5" /> <span>FAQ</span>
             </button>
             <button onClick={() => setActiveTab('scripts')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'scripts' ? 'bg-brand-caramel-dark' : 'hover:bg-white/10'}`}>
                <Save className="w-5 h-5" /> <span>SEO & Script</span>
             </button>
          </nav>
          <div className="mt-auto border-t border-white/10 pt-6">
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
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                   
                   {/* Hero Section settings */}
                   <div>
                      <h2 className="text-xl font-bold text-brand-dark mb-4 border-b pb-2">Bagian Hero & Kontak</h2>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Headline</label>
                            <input type="text" value={homeContent.headline} onChange={e => setHomeContent({...homeContent, headline: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel" />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi</label>
                            <textarea value={homeContent.description} onChange={e => setHomeContent({...homeContent, description: e.target.value})} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel"></textarea>
                         </div>
                         <ImageInput label="URL Gambar Utama (Hero)" value={homeContent.imageUrl || ''} onChange={v => setHomeContent({...homeContent, imageUrl: v})} />
                         <div className="grid grid-cols-2 gap-4">
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
                            <div className="col-span-2 md:col-span-1">
                               <ImageInput label="Logo/Favicon URL" value={homeContent.faviconUrl || ''} onChange={v => setHomeContent({...homeContent, faviconUrl: v})} />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* About Us settings */}
                   <div>
                      <h2 className="text-xl font-bold text-brand-dark mb-4 border-b pb-2">Bagian "Tentang Kami" (Cerita Rasa)</h2>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Cerita</label>
                            <input type="text" value={homeContent.aboutTitle || ''} onChange={e => setHomeContent({...homeContent, aboutTitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Contoh: Cerita Rasa Kami" />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Paragraf 1</label>
                            <textarea value={homeContent.aboutDesc1 || ''} onChange={e => setHomeContent({...homeContent, aboutDesc1: e.target.value})} rows={3} className="w-full px-4 py-2 border rounded-lg"></textarea>
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Paragraf 2</label>
                            <textarea value={homeContent.aboutDesc2 || ''} onChange={e => setHomeContent({...homeContent, aboutDesc2: e.target.value})} rows={3} className="w-full px-4 py-2 border rounded-lg"></textarea>
                         </div>
                         <ImageInput label="URL Gambar Tentang Kami" value={homeContent.aboutImageUrl || ''} onChange={v => setHomeContent({...homeContent, aboutImageUrl: v})} />
                      </div>
                   </div>

                   <div className="pt-4 border-t">
                      <button onClick={handleSaveHome} disabled={savingHome} className="flex items-center justify-center px-8 py-3 bg-brand-terracotta text-white rounded-xl hover:bg-brand-caramel-dark font-medium w-full md:w-auto md:ml-auto transition-colors">
                         <Save className="w-5 h-5 mr-2" /> {savingHome ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'products' && (
             <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                   <h1 className="text-3xl font-bold text-brand-dark">Daftar Produk</h1>
                   <button onClick={() => handleAddItem('products', { name: 'Produk Baru', description: 'Deskripsi singkat produk', price: 10000, imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80', variant: 'Original', galleryUrls: [] }, setProducts, products)} className="flex items-center px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-caramel-dark">
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
                               <input type="text" value={p.name} onChange={e => handleUpdateItemField(p.id, 'name', e.target.value, setProducts, products)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Harga (Rp)</label>
                               <input type="number" value={p.price} onChange={e => handleUpdateItemField(p.id, 'price', Number(e.target.value), setProducts, products)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Varian / Kategori</label>
                               <input type="text" value={p.variant} onChange={e => handleUpdateItemField(p.id, 'variant', e.target.value, setProducts, products)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel" />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                               <ImageInput label="Gambar Utama Produk" value={p.imageUrl || ''} onChange={v => handleUpdateItemField(p.id, 'imageUrl', v, setProducts, products)} />
                            </div>
                            <div className="col-span-2">
                               <label className="block text-xs font-bold text-gray-500 mb-1">Deskripsi Singkat</label>
                               <input type="text" value={p.description} onChange={e => handleUpdateItemField(p.id, 'description', e.target.value, setProducts, products)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel" />
                            </div>
                            <div className="col-span-2 mt-2">
                               <label className="block text-xs font-bold text-gray-500 mb-2">Galeri Tambahan (Opsional)</label>
                               <div className="space-y-3">
                                  {(p.galleryUrls || []).map((url: string, index: number) => (
                                     <div key={index} className="flex flex-col md:flex-row items-start gap-2 border border-gray-200 p-3 rounded-lg relative bg-white">
                                        <div className="flex-1 w-full">
                                           <ImageInput label={`Gambar Galeri ${index + 1}`} value={url} onChange={v => {
                                              const newG = [...(p.galleryUrls || [])];
                                              newG[index] = v;
                                              handleUpdateItemField(p.id, 'galleryUrls', newG, setProducts, products);
                                           }} />
                                        </div>
                                        <button onClick={() => {
                                              const newG = (p.galleryUrls || []).filter((_: any, idx: number) => idx !== index);
                                              handleUpdateItemField(p.id, 'galleryUrls', newG, setProducts, products);
                                           }} className="p-2 mt-7 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 shrink-0 md:self-start">
                                           <Trash2 className="w-5 h-5" />
                                        </button>
                                     </div>
                                  ))}
                                  <button onClick={() => {
                                     const newG = [...(p.galleryUrls || []), ''];
                                     handleUpdateItemField(p.id, 'galleryUrls', newG, setProducts, products);
                                  }} className="px-4 py-2 text-sm bg-gray-100 text-brand-dark rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                                     <Plus className="w-4 h-4 mr-1" /> Tambah Gambar Galeri
                                  </button>
                               </div>
                            </div>
                            <div className="col-span-2 flex justify-end space-x-3 mt-4 border-t pt-4">
                               <button onClick={() => handleDeleteItem('products', p.id, setProducts, products)} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors">
                                  <Trash2 className="w-4 h-4 mr-1" /> Hapus
                               </button>
                               <button onClick={() => handleSaveItem('products', p.id, products)} className="px-6 py-2 bg-brand-dark text-white rounded-lg flex items-center hover:bg-brand-caramel-dark transition-colors">
                                  <Save className="w-4 h-4 mr-2" /> Simpan
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                   {products.length === 0 && <div className="text-gray-500 bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm">Belum ada produk. Silakan tambah produk baru.</div>}
                </div>
             </div>
          )}

          {activeTab === 'articles' && (
             <div className="max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                   <h1 className="text-3xl font-bold text-brand-dark">Daftar Artikel</h1>
                   <button onClick={() => handleAddItem('articles', { title: 'Judul Artikel', summary: 'Ringkasan singkat artikel', content: 'Isi konten artikel lengkap...', imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80' }, setArticles, articles)} className="flex items-center px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-caramel-dark">
                      <Plus className="w-5 h-5 mr-2" /> Tambah Artikel
                   </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   {articles.map(a => (
                      <div key={a.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                         <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                            <img src={a.imageUrl} alt="preview" className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Judul Artikel</label>
                                  <input type="text" value={a.title} onChange={e => handleUpdateItemField(a.id, 'title', e.target.value, setArticles, articles)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel" />
                               </div>
                               <div className="md:col-span-1">
                                  <ImageInput label="Gambar Artikel" value={a.imageUrl || ''} onChange={v => handleUpdateItemField(a.id, 'imageUrl', v, setArticles, articles)} />
                               </div>
                               <div className="md:col-span-2">
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Ringkasan Singkat</label>
                                  <input type="text" value={a.summary} onChange={e => handleUpdateItemField(a.id, 'summary', e.target.value, setArticles, articles)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel" />
                               </div>
                               <div className="md:col-span-2">
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Konten Lengkap</label>
                                  <textarea value={a.content} rows={5} onChange={e => handleUpdateItemField(a.id, 'content', e.target.value, setArticles, articles)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel text-sm"></textarea>
                               </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                               <button onClick={() => handleDeleteItem('articles', a.id, setArticles, articles)} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors">
                                  <Trash2 className="w-4 h-4 mr-1" /> Hapus
                               </button>
                               <button onClick={() => handleSaveItem('articles', a.id, articles)} className="px-6 py-2 bg-brand-dark text-white rounded-lg flex items-center hover:bg-brand-caramel-dark transition-colors">
                                  <Save className="w-4 h-4 mr-2" /> Simpan
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                   {articles.length === 0 && (
                      <div className="text-gray-500 bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                         <p className="mb-4">Belum ada artikel. Silakan tambah artikel baru atau buat 6 artikel default.</p>
                         <button onClick={async () => {
                            const defaultArticles = [
                               { title: 'Sejarah Gipang: Camilan Khas Banten yang Melegenda', summary: 'Mengenal lebih dekat sejarah panjang gipang dari masa ke masa sebagai primadona oleh-oleh khas Cilegon.', content: 'Gipang merupakan camilan legendaris khas Banten yang terbuat dari beras ketan pilihan yang dicampur dengan karamel lezat. Sejak puluhan tahun lalu, camilan ini terus menjadi favorit masyarakat... \n\nSemua proses pembuatan hingga hari ini masih mengikuti resep asli dari leluhur, yang memastikan setiap gigitan terasa otentik.', imageUrl: 'https://images.unsplash.com/photo-1600854291157-5ffcddfb2ac0?auto=format&fit=crop&q=80' },
                               { title: 'Cara Membuat Gipang Rumahan', summary: 'Ingin mencoba membuat gipang sendiri di rumah? Ikuti resep mudah berikut ini!', content: 'Membuat gipang yang renyah dan gurih tidak sesulit yang dibayangkan. Pertama-tama, siapkan beras ketan yang sudah dikukus hingga matang, kemudian jemur hingga kering... \n\nSetelah itu, goreng ketan kering dalam minyak panas, dan campurkan dengan gula merah cair atau karamel. Hasilnya adalah gipang yang nikmat disajikan bersama teh hangat.', imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80' },
                               { title: 'Manfaat Ketan Bagi Kesehatan Tubuh', summary: 'Selain memiliki tekstur yang kenyal, bahan dasar gipang yaitu ketan juga memiliki segudang manfaat menarik.', content: 'Beras ketan yang menjadi bahan baku gipang adalah sumber karbohidrat yang sangat baik untuk energi... \n\nMeski begitu, karena proses pembuatan gipang memakai karamel manis, sangat disarankan untuk mengonsumsinya dalam batas wajar agar keseimbangan asupan gula tetap terjaga.', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80' },
                               { title: 'Perbedaan Gipang Original dan Kacang', summary: 'Temukan pilihan varian mana yang paling cocok bagi lidah dan selera Anda.', content: 'Bagi penikmat otentik, varian original sangat menonjolkan aroma ketan murni berpadu dengan karamel. Sedangkan bagi pecinta tekstur ekstra renyah dan sensasi gurih, taburan kacang tanah yang telah disangrai sempurna sangat pas menjadi pilihan utama... \n\nKeduanya memiliki karakteristik tersendiri, namun kualitas dan kerenyahannya tetap sama.', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80' },
                               { title: '5 Olahan Camilan Cilegon Paling Dicari', summary: 'Selain Gipang, Cilegon Banten juga menyimpan banyak kuliner lainnya lho! Cek ulasan berikut.', content: 'Kota Baja ini tak hanya dikenal dengan kawasan industrinya, tapi juga kulinernya yang menarik. Mulai dari Sate Bandeng, Rabeg Banten, Kue Ketan Bintul, hingga kue Pasung... \n\nDan pastinya Gipang selalu menduduki posisi teratas sebagai camilan yang tahan lama dan praktis untuk dibawa pulang.', imageUrl: 'https://images.unsplash.com/photo-1588636181729-19cc8eb1cecc?auto=format&fit=crop&q=80' },
                               { title: 'Inovasi Kemasan Gipang Menuju Era Modern', summary: 'Bagaimana Gipang beradaptasi dari kemasan tradisional hingga pouch praktis saat ini.', content: 'Zaman dahulu, gipang hanya dikemas menggunakan plastik tipis atau kertas. Namun agar menjaga kualitas dan ketahanan renyahnya, kini Gipang Premium menggunakan zip-lock pouch! \n\nIni memastikan udara luar tidak mudah masuk, sehingga kamu bisa menyimpannya lebih lama walau kemasan sudah pernah dibuka.', imageUrl: 'https://images.unsplash.com/photo-1505253304499-671c55fb57fe?auto=format&fit=crop&q=80' }
                            ];
                            for (const a of defaultArticles) {
                               await handleAddItem('articles', a, setArticles, articles);
                            }
                            fetchData(); // reload
                         }} className="px-6 py-2 bg-brand-terracotta text-white rounded-lg flex items-center hover:bg-brand-caramel-dark transition-colors">
                            Generate 6 Artikel Default
                         </button>
                      </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'testimonials' && (
             <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                   <h1 className="text-3xl font-bold text-brand-dark">Testimoni Pelanggan</h1>
                   <button onClick={() => handleAddItem('testimonials', { name: 'Nama Pelanggan', review: 'Review yang sangat memuaskan!', rating: 5 }, setTestimonials, testimonials)} className="flex items-center px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-caramel-dark">
                      <Plus className="w-5 h-5 mr-2" /> Tambah Testimoni
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {testimonials.map(t => (
                      <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <div className="space-y-4">
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Nama Pelanggan</label>
                               <input type="text" value={t.name} onChange={e => handleUpdateItemField(t.id, 'name', e.target.value, setTestimonials, testimonials)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Rating (1-5)</label>
                               <input type="number" min="1" max="5" value={t.rating} onChange={e => handleUpdateItemField(t.id, 'rating', Number(e.target.value), setTestimonials, testimonials)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Ulasan</label>
                               <textarea value={t.review} rows={4} onChange={e => handleUpdateItemField(t.id, 'review', e.target.value, setTestimonials, testimonials)} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-brand-caramel"></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                               <button onClick={() => handleDeleteItem('testimonials', t.id, setTestimonials, testimonials)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors">
                                  <Trash2 className="w-4 h-4 mr-1" /> Hapus
                               </button>
                               <button onClick={() => handleSaveItem('testimonials', t.id, testimonials)} className="px-4 py-2 bg-brand-dark text-white rounded-lg flex items-center hover:bg-brand-caramel-dark transition-colors">
                                  <Save className="w-4 h-4 mr-2" /> Simpan
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                   {testimonials.length === 0 && <div className="col-span-2 text-gray-500 bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm">Belum ada testimoni.</div>}
                </div>
             </div>
          )}

          {activeTab === 'faq' && (
             <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                   <h1 className="text-3xl font-bold text-brand-dark">FAQ (Tanya Jawab)</h1>
                   <button onClick={() => handleAddItem('faq', { question: 'Pertanyaan Baru?', answer: 'Jawaban untuk pertanyaan tersebut' }, setFaqs, faqs)} className="flex items-center px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-caramel-dark">
                      <Plus className="w-5 h-5 mr-2" /> Tambah FAQ
                   </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   {faqs.map(f => (
                      <div key={f.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <div className="space-y-4">
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Pertanyaan</label>
                               <input type="text" value={f.question} onChange={e => handleUpdateItemField(f.id, 'question', e.target.value, setFaqs, faqs)} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-caramel" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Jawaban</label>
                               <textarea value={f.answer} rows={3} onChange={e => handleUpdateItemField(f.id, 'answer', e.target.value, setFaqs, faqs)} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-caramel"></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                               <button onClick={() => handleDeleteItem('faq', f.id, setFaqs, faqs)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors">
                                  <Trash2 className="w-4 h-4 mr-1" /> Hapus
                               </button>
                               <button onClick={() => handleSaveItem('faq', f.id, faqs)} className="px-4 py-2 bg-brand-dark text-white rounded-lg flex items-center hover:bg-brand-caramel-dark transition-colors">
                                  <Save className="w-4 h-4 mr-2" /> Simpan
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                   {faqs.length === 0 && <div className="text-gray-500 bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm">Belum ada FAQ.</div>}
                </div>
             </div>
          )}

          {activeTab === 'scripts' && (
             <div className="max-w-3xl">
                <h1 className="text-3xl font-bold text-brand-dark mb-8">Pengaturan SEO & Script</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                   <div>
                      <h2 className="text-xl font-bold text-brand-dark mb-2">Meta Tag SEO Bawaan</h2>
                      <p className="text-sm text-gray-500 mb-6">Atur meta tag title, description, dan keywords yang akan dimuat untuk keperluan SEO.</p>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">SEO Title</label>
                            <input type="text" value={homeContent.seoTitle || ''} onChange={e => setHomeContent({...homeContent, seoTitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel" placeholder="Contoh: Gipang Cilegon - Oleh Oleh Khas Banten" />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">SEO Description</label>
                            <textarea value={homeContent.seoDescription || ''} onChange={e => setHomeContent({...homeContent, seoDescription: e.target.value})} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel" placeholder="Deskripsi singkat yang akan muncul di hasil pencarian Google..."></textarea>
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">SEO Keywords</label>
                            <input type="text" value={homeContent.seoKeywords || ''} onChange={e => setHomeContent({...homeContent, seoKeywords: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel" placeholder="Contoh: gipang, cilegon, oleh-oleh banten, jajanan manis" />
                            <p className="text-xs text-gray-500 mt-1">Pisahkan kata kunci dengan koma.</p>
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-gray-100">
                      <h2 className="text-xl font-bold text-brand-dark mb-2">Inject Head / Body Script</h2>
                      <p className="text-sm text-gray-500 mb-6">Gunakan area ini untuk memasukkan script Google Analytics, Google Tag Manager, Meta Pixel, atau Search Console. Pastikan menyertakan tag HTML dengan benar.</p>
                      <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Custom Script &lt;head&gt;</label>
                            <textarea value={homeContent.headScripts || ''} onChange={e => setHomeContent({...homeContent, headScripts: e.target.value})} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel font-mono text-sm" placeholder="<!-- Masukkan meta tags, analytics, dll di sini -->"></textarea>
                            <p className="text-xs text-gray-500 mt-1">Sangat cocok untuk meta tag verifikasi Google Search Console, script Analytics, dan Pixel.</p>
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Custom Script &lt;body&gt;</label>
                            <textarea value={homeContent.bodyScripts || ''} onChange={e => setHomeContent({...homeContent, bodyScripts: e.target.value})} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-brand-caramel focus:border-brand-caramel font-mono text-sm" placeholder="<!-- Masukkan body scripts, noscript, dll di sini -->"></textarea>
                            <p className="text-xs text-gray-500 mt-1">Sangat cocok untuk script tambahan yang butuh diload di bagian bawah body.</p>
                         </div>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-gray-100">
                      <button onClick={handleSaveHome} disabled={savingHome} className="flex items-center justify-center px-8 py-3 bg-brand-terracotta text-white rounded-xl hover:bg-brand-caramel-dark font-medium w-full md:w-auto md:ml-auto transition-colors">
                         <Save className="w-5 h-5 mr-2" /> {savingHome ? 'Menyimpan...' : 'Simpan Pengaturan'}
                      </button>
                   </div>
                </div>
             </div>
          )}

       </div>
    </div>
  );
}
