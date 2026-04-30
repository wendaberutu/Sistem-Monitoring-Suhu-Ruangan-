import { useState } from "react";
import Layout from "../../layout/servicesLayout";

const dummySpareparts = [
  { id: 1, code: "SP001", name: "Bearing 6205", category: "Bearing", stock: 20, price: 45000 },
  { id: 2, code: "SP002", name: "V-Belt A-40", category: "Belt", stock: 15, price: 35000 },
  { id: 3, code: "SP003", name: "Oli Mesin 1L", category: "Pelumas", stock: 30, price: 80000 },
  { id: 4, code: "SP004", name: "Baut M10x30", category: "Fastener", stock: 100, price: 2500 },
];

export default function SparepartPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const filtered = dummySpareparts.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item) => {
    setCart((prev) => {
      const exist = prev.find((c) => c.id === item.id);
      if (exist) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Toko Sparepart</h1>
            <p className="text-sm text-slate-400">Beli sparepart untuk kebutuhan maintenance</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 bg-[#0f2a56] hover:bg-[#123d7a] text-[#4da3ff] px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            🛒 Keranjang
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari sparepart..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0b1222] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#4da3ff]"
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#0b1222] border border-slate-800 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500">{item.code}</p>
                  <p className="text-sm font-semibold text-slate-100 mt-0.5">{item.name}</p>
                  <span className="inline-block mt-1 text-xs bg-[#0f2a56] text-[#4da3ff] px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
                <span className="text-2xl">🔩</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Stok: <span className={item.stock <= 5 ? "text-red-400 font-semibold" : "text-slate-300"}>{item.stock}</span></span>
                <span className="text-[#4da3ff] font-semibold text-sm">{formatRupiah(item.price)}</span>
              </div>

              <button
                onClick={() => addToCart(item)}
                disabled={item.stock === 0}
                className="w-full bg-[#0f2a56] hover:bg-[#123d7a] text-[#4da3ff] py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Tambah
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-12 text-sm">
              Tidak ada sparepart ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0b1222] border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100">Keranjang Belanja</h2>
              <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-slate-200 text-lg">✕</button>
            </div>

            {cart.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">Keranjang kosong.</p>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-[#0f1a30] rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm text-slate-200 font-medium">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.qty} x {formatRupiah(c.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#4da3ff]">{formatRupiah(c.price * c.qty)}</span>
                        <button onClick={() => removeFromCart(c.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
                  <span className="text-slate-300 text-sm font-medium">Total</span>
                  <span className="text-[#4da3ff] font-bold">{formatRupiah(totalPrice)}</span>
                </div>

                <button className="w-full bg-[#4da3ff] hover:bg-[#3b8fe0] text-[#0b1222] font-bold py-2.5 rounded-lg text-sm transition-all">
                  Proses Pembelian
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
