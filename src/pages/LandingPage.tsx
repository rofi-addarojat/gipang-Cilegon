import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { ShoppingBag, ShieldCheck, HeartPulse, Truck, Star, ChevronDown, MessageCircle, Menu, X, ArrowRight } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Dialog from '@radix-ui/react-dialog';

export default function LandingPage() {
  const [homeContent, setHomeContent] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null); // For dialog

  const renderIcon = (iconName: string, className: string = "w-8 h-8") => {
    switch (iconName) {
       case 'ShieldCheck': return <ShieldCheck className={className} />;
       case 'HeartPulse': return <HeartPulse className={className} />;
       case 'Star': return <Star className={className} />;
       case 'Truck': return <Truck className={className} />;
       default: return <Star className={className} />;
    }
  };

  useEffect(() => {
    const unsubHome = onSnapshot(doc(db, 'content', 'home'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHomeContent(data);
        if (data.faviconUrl) {
           let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
           if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
           }
           link.href = data.faviconUrl;
        }
      } else {
        setHomeContent({
          headline: 'Kelezatan Tradisi dalam Kerenyahan Karamel',
          description: 'Nikmati cita rasa otentik Banten dengan balutan karamel manis yang pas, dibuat dari ketan pilihan.',
          imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80',
          whatsappNumber: '6281234567890',
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'content/home'));

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty) {
         setProducts([
            { id: '1', name: 'Gipang Original Varian Besar', description: 'Gipang ketan renyah dengan balutan karamel gula merah manis sedang yang nikmat.', price: 25000, imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80', variant: 'Original' },
            { id: '2', name: 'Gipang Kacang', description: 'Gipang special dengan taburan kacang tanah sangrai untuk sensasi gurih ekstra.', price: 28000, imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80', variant: 'Mix Kacang' },
            { id: '3', name: 'Gipang Pouch', description: 'Kemasan praktis zip lock cocok untuk ngemil di mana saja.', price: 15000, imageUrl: 'https://images.unsplash.com/photo-1600854291157-5ffcddfb2ac0?auto=format&fit=crop&q=80', variant: 'Pouch Mini' }
         ]);
      } else {
         setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      if (snapshot.empty) {
        setTestimonials([
          { id: '1', name: 'Rina S.', review: 'Rasa karamelnya pas banget, gak bikin eneg. Ketannya juga super renyah!', rating: 5 },
          { id: '2', name: 'Budi A.', review: 'Cocok buat temen ngopi sore. Pengirimannya juga cepat dan aman.', rating: 5 },
          { id: '3', name: 'Sinta P.', review: 'Sering beli buat oleh-oleh karena seneng banget sama teksturnya yang crunchy.', rating: 5 },
        ]);
      } else {
        setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'testimonials'));

    const unsubFaqs = onSnapshot(collection(db, 'faq'), (snapshot) => {
      if (snapshot.empty) {
        setFaqs([
          { id: '1', question: 'Berapa lama daya tahan Gipang?', answer: 'Gipang kami tahan hingga 2 bulan di suhu ruang asalkan kemasan tertutup rapat tertutup sinar matahari langsung.' },
          { id: '2', question: 'Apakah menggunakan bahan pengawet?', answer: 'Sama sekali tidak. Gipang Cilegon dibuat menggunakan 100% bahan alami sesuai resep warisan.' },
          { id: '3', question: 'Bagaimana cara pemesanannya?', answer: 'Anda bisa klik tombol WhatsApp, atau pesan melalui marketplace Shopee dan Tokopedia kami.' },
        ]);
      } else {
        setFaqs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'faq'));

    const unsubArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
      if (snapshot.empty) {
        setArticles([
          { id: '1', title: 'Sejarah Gipang: Camilan Khas Banten yang Melegenda', summary: 'Mengenal lebih dekat sejarah panjang gipang dari masa ke masa sebagai primadona oleh-oleh khas Cilegon.', content: 'Gipang merupakan camilan legendaris khas Banten yang terbuat dari beras ketan pilihan yang dicampur dengan karamel lezat. Sejak puluhan tahun lalu, camilan ini terus menjadi favorit masyarakat... \n\nSemua proses pembuatan hingga hari ini masih mengikuti resep asli dari leluhur, yang memastikan setiap gigitan terasa otentik.', imageUrl: 'https://images.unsplash.com/photo-1600854291157-5ffcddfb2ac0?auto=format&fit=crop&q=80' },
          { id: '2', title: 'Cara Membuat Gipang Rumahan', summary: 'Ingin mencoba membuat gipang sendiri di rumah? Ikuti resep mudah berikut ini!', content: 'Membuat gipang yang renyah dan gurih tidak sesulit yang dibayangkan. Pertama-tama, siapkan beras ketan yang sudah dikukus hingga matang, kemudian jemur hingga kering... \n\nSetelah itu, goreng ketan kering dalam minyak panas, dan campurkan dengan gula merah cair atau karamel. Hasilnya adalah gipang yang nikmat disajikan bersama teh hangat.', imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80' },
          { id: '3', title: 'Manfaat Ketan Bagi Kesehatan Tubuh', summary: 'Selain memiliki tekstur yang kenyal, bahan dasar gipang yaitu ketan juga memiliki segudang manfaat menarik.', content: 'Beras ketan yang menjadi bahan baku gipang adalah sumber karbohidrat yang sangat baik untuk energi... \n\nMeski begitu, karena proses pembuatan gipang memakai karamel manis, sangat disarankan untuk mengonsumsinya dalam batas wajar agar keseimbangan asupan gula tetap terjaga.', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80' },
          { id: '4', title: 'Perbedaan Gipang Original dan Kacang', summary: 'Temukan pilihan varian mana yang paling cocok bagi lidah dan selera Anda.', content: 'Bagi penikmat otentik, varian original sangat menonjolkan aroma ketan murni berpadu dengan karamel. Sedangkan bagi pecinta tekstur ekstra renyah dan sensasi gurih, taburan kacang tanah yang telah disangrai sempurna sangat pas menjadi pilihan utama... \n\nKeduanya memiliki karakteristik tersendiri, namun kualitas dan kerenyahannya tetap sama.', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80' },
          { id: '5', title: '5 Olahan Camilan Cilegon Paling Dicari', summary: 'Selain Gipang, Cilegon Banten juga menyimpan banyak kuliner lainnya lho! Cek ulasan berikut.', content: 'Kota Baja ini tak hanya dikenal dengan kawasan industrinya, tapi juga kulinernya yang menarik. Mulai dari Sate Bandeng, Rabeg Banten, Kue Ketan Bintul, hingga kue Pasung... \n\nDan pastinya Gipang selalu menduduki posisi teratas sebagai camilan yang tahan lama dan praktis untuk dibawa pulang.', imageUrl: 'https://images.unsplash.com/photo-1588636181729-19cc8eb1cecc?auto=format&fit=crop&q=80' },
          { id: '6', title: 'Inovasi Kemasan Gipang Menuju Era Modern', summary: 'Bagaimana Gipang beradaptasi dari kemasan tradisional hingga pouch praktis saat ini.', content: 'Zaman dahulu, gipang hanya dikemas menggunakan plastik tipis atau kertas. Namun agar menjaga kualitas dan ketahanan renyahnya, kini Gipang Premium menggunakan zip-lock pouch! \n\nIni memastikan udara luar tidak mudah masuk, sehingga kamu bisa menyimpannya lebih lama walau kemasan sudah pernah dibuka.', imageUrl: 'https://images.unsplash.com/photo-1505253304499-671c55fb57fe?auto=format&fit=crop&q=80' }
        ]);
      } else {
        setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'articles'));

    const unsubFeatures = onSnapshot(collection(db, 'features'), (snapshot) => {
      if (snapshot.empty) {
        setFeatures([
          { id: '1', title: 'Tanpa Pengawet', description: 'Gipang diolah secara alami tanpa bahan kimia, menghasilkan rasa murni yang aman dikonsumsi harian.', icon: 'ShieldCheck' },
          { id: '2', title: 'Resep Asli', description: 'Mempertahankan resep turun temurun sejak puluhan tahun.', icon: 'HeartPulse' },
          { id: '3', title: 'Karamel Premium', description: 'Gula merah pilihan yang menghasilkan karamel dengan tingkat kemanisan yang pas.', icon: 'Star' },
          { id: '4', title: 'Pengiriman Aman', description: 'Dikemas khusus agar gipang tetap utuh dan renyah sampai ke rumah Anda.', icon: 'Truck' },
        ]);
      } else {
        setFeatures(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'features'));

    return () => {
      unsubHome();
      unsubProducts();
      unsubTestimonials();
      unsubFaqs();
      unsubArticles();
      unsubFeatures();
    };
  }, []);

  const waLink = `https://wa.me/${homeContent?.whatsappNumber || '6281234567890'}?text=Halo%20saya%20mau%20pesan%20Gipang%20Cilegon`;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark font-sans selection:bg-brand-caramel selection:text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 start-0 border-b border-brand-dark/10 bg-brand-cream/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4 px-6 md:px-12">
          <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-serif font-bold whitespace-nowrap text-brand-caramel-dark">Gipang Cilegon.</span>
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex text-white bg-brand-terracotta hover:bg-brand-caramel-dark focus:ring-4 focus:outline-none focus:ring-brand-caramel font-medium rounded-full text-sm px-6 py-2.5 text-center transition-colors">
              Pesan Sekarang
            </a>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
               {isMobileMenuOpen ? <X/> : <Menu />}
            </button>
          </div>
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`}>
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-brand-cream/50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
              <li><a href="#home" className="block py-2 px-3 text-brand-dark hover:text-brand-caramel-dark md:p-0">Home</a></li>
              <li><a href="#products" className="block py-2 px-3 text-brand-dark hover:text-brand-caramel-dark md:p-0">Produk</a></li>
              <li><a href="#about" className="block py-2 px-3 text-brand-dark hover:text-brand-caramel-dark md:p-0">Tentang Kami</a></li>
              <li><a href="#articles" className="block py-2 px-3 text-brand-dark hover:text-brand-caramel-dark md:p-0">Artikel</a></li>
              <li><a href="#faq" className="block py-2 px-3 text-brand-dark hover:text-brand-caramel-dark md:p-0">FAQ</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero */}
        <section id="home" className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
           <div>
              <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6 }}
                 className="text-4xl md:text-6xl font-serif font-bold text-brand-dark leading-tight mb-6">
                 {homeContent?.headline || 'Kelezatan Tradisi dalam Kerenyahan Karamel'}
              </motion.h1>
              <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.2 }}
                 className="text-lg md:text-xl text-brand-dark/80 mb-8 max-w-lg">
                 {homeContent?.description || 'Nikmati cita rasa otentik Banten dengan balutan karamel manis yang pas, dibuat dari ketan pilihan.'}
              </motion.p>
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.4 }}
                 className="flex flex-wrap gap-4"
              >
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-brand-caramel-dark rounded-full hover:bg-brand-dark transition-colors">
                     <MessageCircle className="w-5 h-5 mr-2" /> Beli via WhatsApp
                  </a>
                  {homeContent?.shopeeUrl && (
                     <a href={homeContent.shopeeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-brand-caramel-dark border border-brand-caramel-dark rounded-full hover:bg-brand-caramel-dark hover:text-white transition-colors">
                        <ShoppingBag className="w-5 h-5 mr-2" /> Beli di Shopee
                     </a>
                  )}
              </motion.div>
           </div>
           <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
           >
              <img src={homeContent?.imageUrl || 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80'} alt="Gipang Cilegon" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
           </motion.div>
        </section>

        {/* Why Us */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {features.length > 0 ? features.map((feature, i) => (
                  <motion.div key={feature.id} whileHover={{ y: -5 }} className="flex flex-col items-center text-center space-y-3">
                     <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center text-brand-terracotta">
                        {renderIcon(feature.icon)}
                     </div>
                     <h3 className="font-serif font-bold">{feature.title}</h3>
                     <p className="text-sm text-gray-500">{feature.description}</p>
                  </motion.div>
               )) : (
                  <div className="col-span-4 text-center text-gray-500">Belum ada fitur.</div>
               )}
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="py-24 bg-brand-cream">
           <div className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="text-center max-w-2xl mx-auto mb-16">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">Varian Gipang Kami</h2>
                 <p className="text-gray-600">Pilih varian kesukaanmu, masing-masing membawa karakter rasa yang unik namun tetap menyatu dengan kearifan lokal.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 {products.length > 0 ? products.map((product, i) => (
                    <motion.div 
                       key={product.id}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.1 }}
                       className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                       <div className="aspect-square overflow-hidden bg-gray-100">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       </div>
                       <div className="p-6">
                          <div className="mb-2">
                             <span className="inline-block px-3 py-1 text-xs font-medium bg-brand-cream text-brand-caramel-dark rounded-full">{product.variant || 'Original'}</span>
                          </div>
                          <h3 className="text-xl font-bold font-serif mb-2">{product.name}</h3>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                             <span className="text-xl font-bold text-brand-terracotta">Rp {product.price?.toLocaleString('id-ID')}</span>
                             <a href={waLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-brand-dark text-white rounded-full hover:bg-brand-caramel-dark transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                             </a>
                          </div>
                       </div>
                    </motion.div>
                 )) : (
                     <div className="col-span-3 text-center text-gray-500 py-10">Belum ada produk.</div>
                 )}
              </div>
           </div>
        </section>

        {/* About */}
        <section id="about" className="py-24 bg-white overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center">
              <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="order-2 md:order-1"
              >
                 <img src={homeContent?.aboutImageUrl || 'https://images.unsplash.com/photo-1600854291157-5ffcddfb2ac0?auto=format&fit=crop&q=80'} alt="About Gipang" className="rounded-3xl shadow-lg w-full" />
              </motion.div>
              <motion.div 
                 initial={{ opacity: 0, x: 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="order-1 md:order-2"
              >
                 <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-6">{homeContent?.aboutTitle || 'Cerita Rasa Kami'}</h2>
                 <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {homeContent?.aboutDesc1 || 'Bermula dari dapur kecil di sudut kota Cilegon, Gipang yang kami produksi bukan sekadar camilan. Ia adalah representasi dari sejarah panjang dan perpaduan rasa otentik dengan sentuhan gaya hidup modern.'}
                 </p>
                 <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {homeContent?.aboutDesc2 || 'Setiap potong gipang dibuat dengan bahan lokal terbaik, diaduk bersama karamel yang pas agar menghasilkan sensasi "kriuk" saat digigit dan "meleleh" di mulut.'}
                 </p>
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-1 bg-brand-caramel-dark"></div>
                    <span className="font-serif font-bold text-brand-dark">Keluarga Pembuat Gipang</span>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 bg-brand-dark text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
             <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Kata Mereka</h2>
                 <p className="text-gray-400">Jutaan kunyahan bahagia telah terjadi.</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-6">
                {testimonials.length > 0 ? testimonials.map((testi, i) => (
                   <motion.div 
                      key={testi.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm"
                   >
                      <div className="flex text-brand-caramel-light mb-4">
                         {[...Array(testi.rating || 5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                      </div>
                      <p className="text-gray-300 mb-6 font-medium leading-relaxed">"{testi.review}"</p>
                      <div className="flex items-center">
                         <div className="w-10 h-10 bg-brand-terracotta rounded-full flex items-center justify-center font-bold text-white uppercase">{testi.name.charAt(0)}</div>
                         <div className="ml-3">
                            <h4 className="font-bold">{testi.name}</h4>
                            <span className="text-sm text-gray-400">Pembeli Setia</span>
                         </div>
                      </div>
                   </motion.div>
                )) : (
                   <div className="col-span-3 text-center text-gray-400">Belum ada testimonial.</div>
                )}
             </div>
          </div>
        </section>

        {/* Articles */}
        <section id="articles" className="py-24 bg-brand-cream/50">
           <div className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">Artikel & Tips</h2>
                 <p className="text-gray-600 max-w-2xl mx-auto">Kami mengumpulkan cerita dan inspirasi seputar gipang, tradisi Banten, dan tips menarik lainnya.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 {articles.length > 0 ? articles.map((article, i) => (
                    <motion.div 
                       key={article.id}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.1 }}
                       className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                       <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       </div>
                       <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-xl font-bold font-serif mb-3 line-clamp-2">{article.title}</h3>
                          <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-1">{article.summary}</p>
                          <Dialog.Root>
                             <Dialog.Trigger asChild>
                                <button onClick={() => setSelectedArticle(article)} className="flex items-center text-sm font-bold text-brand-terracotta hover:text-brand-caramel-dark transition-colors mt-auto group/btn">
                                   Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                             </Dialog.Trigger>
                             <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-brand-dark/10 bg-white p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col">
                                   <div className="h-64 sm:h-80 w-full relative shrink-0">
                                      <img src={selectedArticle?.imageUrl} alt={selectedArticle?.title} className="w-full h-full object-cover" />
                                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
                                      <Dialog.Close asChild>
                                         <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-brand-dark hover:bg-white transition-colors shadow-sm">
                                            <X className="w-5 h-5" />
                                         </button>
                                      </Dialog.Close>
                                   </div>
                                   <div className="px-6 pb-8 overflow-y-auto">
                                      <Dialog.Title className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark mb-4 leading-tight">{selectedArticle?.title}</Dialog.Title>
                                      <div className="text-sm sm:text-base text-gray-600 space-y-4 whitespace-pre-wrap leading-relaxed">
                                         {selectedArticle?.content}
                                      </div>
                                   </div>
                                </Dialog.Content>
                             </Dialog.Portal>
                          </Dialog.Root>
                       </div>
                    </motion.div>
                 )) : (
                     <div className="col-span-3 text-center text-gray-500 py-10">Belum ada artikel.</div>
                 )}
              </div>
           </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-white">
           <div className="max-w-3xl mx-auto px-6 md:px-12">
              <div className="text-center mb-12">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark">Tanya Jawab (FAQ)</h2>
              </div>
              <Accordion.Root type="single" collapsible className="space-y-4">
                 {faqs.length > 0 ? faqs.map((faq, i) => (
                    <Accordion.Item key={faq.id} value={`item-${i}`} className="bg-brand-cream/50 border border-brand-dark/10 rounded-2xl overflow-hidden">
                       <Accordion.Header>
                          <Accordion.Trigger className="w-full flex items-center justify-between p-6 text-left font-bold text-brand-dark hover:text-brand-caramel-dark transition-colors group">
                             {faq.question}
                             <ChevronDown className="w-5 h-5 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                          </Accordion.Trigger>
                       </Accordion.Header>
                       <Accordion.Content className="px-6 pb-6 text-gray-600 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                          {faq.answer}
                       </Accordion.Content>
                    </Accordion.Item>
                 )) : (
                    <div className="text-center text-gray-500">Belum ada FAQ.</div>
                 )}
              </Accordion.Root>
           </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-white pt-16 pb-8 border-t border-white/10">
         <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
               <h3 className="text-2xl font-serif font-bold text-brand-caramel-light mb-4">Gipang Cilegon.</h3>
               <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Camilan khas pesisir Banten yang memadukan renyahnya ketan dan manisnya karamel pilihan. Diproduksi dengan resep warisan.
               </p>
               <div className="flex space-x-4">
                  <a href={waLink} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-caramel-dark transition-colors">
                     <MessageCircle className="w-5 h-5" />
                  </a>
               </div>
            </div>
            <div>
               <h4 className="font-bold mb-4">Navigasi</h4>
               <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="#products" className="hover:text-white transition-colors">Produk</a></li>
                  <li><a href="#about" className="hover:text-white transition-colors">Tentang Kami</a></li>
                  <li><a href="#articles" className="hover:text-white transition-colors">Artikel</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold mb-4">Kontak</h4>
               <ul className="space-y-2 text-sm text-gray-400">
                  <li>WhatsApp: +{homeContent?.whatsappNumber || '6281234567890'}</li>
                  <li>Buka: Senin - Sabtu (08:00 - 17:00)</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold mb-4">Ikuti Kami</h4>
               <p className="text-sm text-gray-400">Pesan sekarang melalui marketplace favorit Anda.</p>
               <div className="flex mt-4 space-x-3">
                  {homeContent?.shopeeUrl && (
                     <a href={homeContent.shopeeUrl} target="_blank" rel="noopener noreferrer" className="text-sm bg-brand-terracotta text-white px-4 py-2 rounded-lg hover:bg-brand-caramel-dark transition-colors">Shopee</a>
                  )}
                  {homeContent?.tokopediaUrl && (
                     <a href={homeContent.tokopediaUrl} target="_blank" rel="noopener noreferrer" className="text-sm bg-[#00AA5B] text-white px-4 py-2 rounded-lg hover:bg-[#008c4b] transition-colors">Tokopedia</a>
                  )}
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Gipang Cilegon. All rights reserved.</p>
            <div className="mt-4 md:mt-0 space-x-4">
               <a href="/admin/login" className="hover:text-white transition-colors">CMS Login</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
