'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, FileText, Loader2, ChevronDown, ChevronUp, PlusCircle, Settings } from 'lucide-react';

// Types
interface Product {
  name: string;
  price_raw: string;
  stock: string;
  image_url: string;
}

interface QuoteItem extends Product {
  quantity: number;
  price: number; // Base price
  individualMargin: number;
}

interface ClientData {
  nombre: string;
  direccion: string;
  ciudad: string;
  correo: string;
  telefono: string;
  referencia: string;
}

interface TermsData {
  validez: string;
  entrega: string;
  formaPago: string;
  nota: string;
  precioLiteral: string; // "DOSCIENTOS BOLIVIANOS..."
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<QuoteItem[]>([]);
  const [globalMargin, setGlobalMargin] = useState(30);

  const [client, setClient] = useState<ClientData>({
    nombre: '',
    direccion: '',
    ciudad: 'ORURO',
    correo: '',
    telefono: '',
    referencia: ''
  });

  const [terms, setTerms] = useState<TermsData>({
    validez: '5 DIAS',
    entrega: '3 DIAS CALENDARIO',
    formaPago: 'EFECTIVO O TRANSFERENCIA BANCARIA',
    nota: '',
    precioLiteral: ''
  });

  const [showClientForm, setShowClientForm] = useState(true);
  const [showTermsForm, setShowTermsForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState('Cargando...');
  const [showManualProduct, setShowManualProduct] = useState(false);
  const [manualProduct, setManualProduct] = useState({ name: '', price: 0 });

  useEffect(() => {
    fetch('http://localhost:8000/api/next-quote-number')
      .then(res => res.json())
      .then(data => setQuoteNumber(data.quote_number))
      .catch(() => setQuoteNumber('0000'));
  }, []);

  const searchProducts = async () => {
    if (!query) return;
    setLoading(true);
    // Clean query to avoid confusion
    setResults([]);
    try {
      const res = await fetch(`http://localhost:8000/api/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    let priceStr = product.price_raw.replace('Bs', '').trim();
    const price = parseFloat(priceStr) || 0;

    setCart([...cart, {
      ...product,
      quantity: 1,
      price,
      individualMargin: globalMargin
    }]);
  };

  const addManualProduct = () => {
    if (!manualProduct.name || manualProduct.price <= 0) {
      alert("Ingrese nombre y precio válidos");
      return;
    }

    setCart([...cart, {
      name: manualProduct.name,
      price_raw: `${manualProduct.price.toFixed(2)} Bs`,
      stock: 'Manual',
      image_url: '',
      quantity: 1,
      price: manualProduct.price,
      individualMargin: globalMargin
    }]);

    setManualProduct({ name: '', price: 0 });
    setShowManualProduct(false);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateQuantity = (index: number, val: number) => {
    const newCart = [...cart];
    newCart[index].quantity = val;
    setCart(newCart);
  };

  const updateIndividualMargin = (index: number, margin: number) => {
    const newCart = [...cart];
    newCart[index].individualMargin = margin;
    setCart(newCart);
  };

  const updateName = (index: number, newName: string) => {
    const newCart = [...cart];
    newCart[index].name = newName;
    setCart(newCart);
  };

  const generatePDF = async () => {
    if (!client.nombre || cart.length === 0) {
      alert("Ingrese datos del cliente y productos");
      return;
    }
    setGenerating(true);
    try {
      const payload = {
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          margin_percentage: item.individualMargin,
          image_url: item.image_url
        })),
        client_data: client,
        terms_data: terms,
        quote_number: quoteNumber
      };

      const res = await fetch('http://localhost:8000/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Cotizacion_${quoteNumber}_${client.nombre}.pdf`;
        a.click();
      } else {
        alert("Error generando PDF");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    } finally {
      setGenerating(false);
    }
  };

  const totalCost = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalSales = cart.reduce((acc, item) => {
    const salePrice = item.price * (1 + item.individualMargin / 100);
    return acc + (salePrice * item.quantity);
  }, 0);
  const totalProfit = totalSales - totalCost;

  return (
    <main className="min-h-screen bg-slate-100 p-6 font-sans text-slate-900">
      <header className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Warp6 Cotizador</h1>
          <p className="text-slate-600 font-medium">Sistema Profesional de Cotizaciones</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-500 uppercase">Cotización N°</p>
          <p className="text-3xl font-black text-blue-600 tracking-tight">{quoteNumber}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Search (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <Search className="w-5 h-5 text-blue-600" /> Búsqueda de Productos
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium placeholder-slate-400 text-slate-900"
                placeholder="Escribe para buscar..."
              />
              <button
                onClick={searchProducts}
                disabled={loading}
                className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
            {results.map((product, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 items-center group hover:border-blue-400 transition-all hover:shadow-md">
                <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-100">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-slate-300 text-xs font-bold">Sin Foto</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{product.name}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-black text-blue-700 text-lg">{product.price_raw}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${product.stock !== '00' && product.stock !== '0' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock || 'Consultar'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Quote (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">

            {/* Client Data Form */}
            <div className="border-2 border-slate-100 rounded-xl mb-6 overflow-hidden">
              <button
                onClick={() => setShowClientForm(!showClientForm)}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span className="font-bold text-slate-800">Datos del Cliente</span>
                </div>
                {showClientForm ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>

              {showClientForm && (
                <div className="p-5 grid grid-cols-2 gap-4 bg-white">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre / Razón Social *</label>
                    <input
                      type="text"
                      value={client.nombre}
                      onChange={(e) => setClient({ ...client, nombre: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 placeholder-slate-300 transition-all"
                      placeholder="NOMBRE DEL CLIENTE"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label>
                    <input
                      type="text"
                      value={client.direccion}
                      onChange={(e) => setClient({ ...client, direccion: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-800"
                      placeholder="DIRECCIÓN"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={client.ciudad}
                      onChange={(e) => setClient({ ...client, ciudad: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={client.telefono}
                      onChange={(e) => setClient({ ...client, telefono: e.target.value })}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={client.correo}
                      onChange={(e) => setClient({ ...client, correo: e.target.value })}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-800"
                      placeholder="CORREO@EJEMPLO.COM"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Referencia</label>
                    <input
                      type="text"
                      value={client.referencia}
                      onChange={(e) => setClient({ ...client, referencia: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-800"
                      placeholder="CONTACTO / REF"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Terms Config */}
            <div className="border-2 border-slate-100 rounded-xl mb-6 overflow-hidden">
              <button
                onClick={() => setShowTermsForm(!showTermsForm)}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span className="font-bold text-slate-800">Términos y Condiciones</span>
                </div>
                {showTermsForm ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>
              {showTermsForm && (
                <div className="p-5 grid grid-cols-2 gap-4 bg-white">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio Literal (Opcional)</label>
                    <input type="text" value={terms.precioLiteral} onChange={e => setTerms({ ...terms, precioLiteral: e.target.value })} className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg" placeholder="SON: TRESCIENTOS..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entrega</label>
                    <input type="text" value={terms.entrega} onChange={e => setTerms({ ...terms, entrega: e.target.value })} className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Validez</label>
                    <input type="text" value={terms.validez} onChange={e => setTerms({ ...terms, validez: e.target.value })} className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg" />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Items de la Cotización
            </h3>

            <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[200px]">
              {cart.map((item, idx) => {
                const salePrice = item.price * (1 + item.individualMargin / 100);
                return (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex gap-3 justify-between items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateName(idx, e.target.value)}
                          className="w-full font-bold text-slate-800 text-sm leading-tight bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 transition-all"
                        />
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="text-slate-500">Costo: {item.price.toFixed(2)}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Venta: {salePrice.toFixed(2)} Bs</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-2 rounded-lg">
                      <div className="col-span-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Cantidad</label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(idx, parseInt(e.target.value) || 1)} className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center font-bold text-slate-800" />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Margen %</label>
                        <input type="number" value={item.individualMargin} onChange={(e) => updateIndividualMargin(idx, parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center font-bold text-blue-600" />
                      </div>
                      <div className="col-span-4 text-right">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Subtotal</label>
                        <div className="text-sm font-black text-slate-800">{(salePrice * item.quantity).toFixed(2)} Rs</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className="font-medium">El carrito está vacío</p>
                </div>
              )}
            </div>

            {/* Add Manual */}
            <div className="mb-6">
              {!showManualProduct ? (
                <button
                  onClick={() => setShowManualProduct(true)}
                  className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-blue-600 font-bold"
                >
                  <PlusCircle className="w-5 h-5" />
                  AGREGAR PRODUCTO MANUAL
                </button>
              ) : (
                <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-50 shadow-md">
                  {/* Manual Form inputs */}
                  <div className="space-y-3">
                    <input type="text" placeholder="Nombre del Producto" value={manualProduct.name} onChange={e => setManualProduct({ ...manualProduct, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-bold" />
                    <div className="flex gap-2">
                      <input type="number" placeholder="Precio Bs" value={manualProduct.price || ''} onChange={e => setManualProduct({ ...manualProduct, price: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg font-bold" />
                      <button onClick={addManualProduct} className="bg-blue-600 text-white px-4 rounded-lg font-medium">Agregar</button>
                      <button onClick={() => setShowManualProduct(false)} className="bg-white text-slate-600 px-4 rounded-lg font-medium">Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Totals */}
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-2 opacity-80">
                <span>Costo Total</span>
                <span>{totalCost.toFixed(2)} Bs</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-green-400 font-medium">
                <span>Ganancia Estimada</span>
                <span>{totalProfit.toFixed(2)} Bs</span>
              </div>
              <div className="flex justify-between items-center text-3xl font-black border-t border-slate-700 pt-4 mb-6">
                <span>TOTAL VENTA</span>
                <span>{totalSales.toFixed(2)} Bs</span>
              </div>

              <button
                onClick={generatePDF}
                disabled={generating || cart.length === 0 || !client.nombre}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <><FileText className="w-6 h-6" /> GENERAR PDF COTIZACIÓN</>}
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
