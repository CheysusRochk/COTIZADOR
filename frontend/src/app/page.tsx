'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, Trash2, FileText, Loader2, ChevronDown, ChevronUp, PlusCircle, Settings, Save, Users, Calculator, BarChart3, TrendingUp, AlertTriangle, DollarSign, Eye } from 'lucide-react';
import { calcCreator, calcAuditor } from './calculadora/calcEngine';

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

// Utility: Convert a number to Spanish literal text for Bolivian currency
function numberToSpanish(amount: number): string {
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (amount === 0) return 'CERO 00/100 BOLIVIANOS';

  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 30) {
      if (n === 20) return 'VEINTE';
      return 'VEINTI' + units[n - 20];
    }
    if (n < 100) {
      const t = Math.floor(n / 10);
      const u = n % 10;
      return tens[t] + (u > 0 ? ' Y ' + units[u] : '');
    }
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return hundreds[h] + (rest > 0 ? ' ' + convertGroup(rest) : '');
  }

  function convertNumber(n: number): string {
    if (n === 0) return '';
    if (n < 1000) return convertGroup(n);
    if (n < 2000) return 'MIL ' + convertGroup(n - 1000);
    if (n < 1000000) {
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;
      return convertGroup(thousands) + ' MIL' + (rest > 0 ? ' ' + convertGroup(rest) : '');
    }
    if (n < 2000000) {
      const rest = n % 1000000;
      return 'UN MILLON' + (rest > 0 ? ' ' + convertNumber(rest) : '');
    }
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    return convertGroup(millions) + ' MILLONES' + (rest > 0 ? ' ' + convertNumber(rest) : '');
  }

  const literal = convertNumber(intPart).trim();
  const decStr = decPart.toString().padStart(2, '0');
  return `${literal} ${decStr}/100 BOLIVIANOS`;
}

function fmt(n: number): string {
  return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface TaxPanelProps {
  totalCost: number;
  totalSales: number;
  taxMode: 'creator' | 'auditor';
  setTaxMode: (m: 'creator' | 'auditor') => void;
  costoSinFactura: string;
  setCostoSinFactura: (v: string) => void;
  metaGananciaInput: string;
  setMetaGananciaInput: (v: string) => void;
}

function TaxAnalysisContent({
  totalCost,
  totalSales,
  taxMode,
  setTaxMode,
  costoSinFactura,
  setCostoSinFactura,
  metaGananciaInput,
  setMetaGananciaInput,
}: TaxPanelProps) {
  const csf = parseFloat(costoSinFactura) || 0;
  const mg = parseFloat(metaGananciaInput) || 0;

  const costoFacturado = totalCost; // Cart total = invoiced cost

  const creatorResults = taxMode === 'creator' && mg > 0
    ? calcCreator(costoFacturado, csf, mg)
    : null;

  const auditorResults = taxMode === 'auditor' && totalSales > 0
    ? calcAuditor(costoFacturado, csf, totalSales)
    : null;

  const scenarioColors = [
    { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', accent: 'text-red-600' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', accent: 'text-amber-600' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', accent: 'text-emerald-600' },
  ];

  return (
    <div className="p-5 bg-white space-y-5">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setTaxMode('auditor')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${taxMode === 'auditor'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
        >
          <Eye className="w-4 h-4" />
          ¿Cuánto ganaré?
        </button>
        <button
          onClick={() => setTaxMode('creator')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${taxMode === 'creator'
              ? 'bg-violet-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          ¿A cuánto vender?
        </button>
      </div>

      {/* Inputs row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Costo Facturado (auto) */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
            <DollarSign className="w-3 h-3 inline" /> Costo Facturado (del carrito)
          </label>
          <div className="px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm font-black text-slate-700">
            {fmt(costoFacturado)} Bs
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Suma automática de los productos</p>
        </div>

        {/* Costo sin Factura */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
            <AlertTriangle className="w-3 h-3 inline text-amber-500" /> Costos Sin Factura
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              value={costoSinFactura}
              onChange={(e) => setCostoSinFactura(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all"
              placeholder="Viáticos, servicios..."
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Bs</span>
          </div>
        </div>

        {/* Conditional: meta ganancia or info */}
        {taxMode === 'creator' && (
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-violet-500 uppercase mb-1">
              <TrendingUp className="w-3 h-3 inline" /> Meta de Ganancia Neta
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={metaGananciaInput}
                onChange={(e) => setMetaGananciaInput(e.target.value)}
                className="w-full px-3 py-2 border-2 border-violet-200 rounded-lg text-sm font-bold text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all"
                placeholder="¿Cuánto quieres ganar neto?"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Bs</span>
            </div>
          </div>
        )}

        {taxMode === 'auditor' && totalSales > 0 && (
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-slate-600">
                Analizando precio de venta actual: <strong className="text-blue-700">{fmt(totalSales)} Bs</strong>
                {csf > 0 && <> + viáticos: <strong className="text-amber-600">{fmt(csf)} Bs</strong></>}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Scenario Results */}
      {taxMode === 'auditor' && auditorResults && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ganancia Neta Real por Escenario</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {auditorResults.map((r, i) => {
              const c = scenarioColors[i];
              const isPos = r.gananciaReal >= 0;
              return (
                <div key={i} className={`${c.bg} border ${c.border} rounded-xl p-4 transition-all hover:shadow-md`}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${c.badge}`}>
                      {r.label}
                    </span>
                  </div>
                  <div className={`text-2xl font-black ${isPos ? c.accent : 'text-red-600'} mb-3`}>
                    {fmt(r.gananciaReal)} <span className="text-xs font-bold opacity-60">Bs</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Precio Venta</span>
                      <span className="font-mono font-bold text-slate-700">{fmt(totalSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>− Costos</span>
                      <span className="font-mono text-red-500">-{fmt(costoFacturado + csf)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>− IVA (13%)</span>
                      <span className="font-mono text-red-500">-{fmt(totalSales * 0.13)}</span>
                    </div>
                    {i >= 1 && costoFacturado > 0 && (
                      <div className="flex justify-between">
                        <span>+ Crédito Fiscal</span>
                        <span className="font-mono text-emerald-600">+{fmt(costoFacturado * 0.13)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>− IT (3%)</span>
                      <span className="font-mono text-red-500">-{fmt(totalSales * 0.03)}</span>
                    </div>
                    {i === 2 && csf > 0 && (
                      <div className="flex justify-between">
                        <span>− Retención</span>
                        <span className="font-mono text-red-500">-{fmt((csf / 0.845) * 0.155)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                      <span className="font-bold text-slate-600">Dinero Mes</span>
                      <span className="font-mono font-bold text-slate-700">{fmt(r.dineroMes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>− IUE (25%)</span>
                      <span className="font-mono text-red-500">-{fmt(r.iueAnual)}</span>
                    </div>
                    <div className={`flex justify-between border-t border-slate-200 pt-1 mt-1 font-bold ${isPos ? c.text : 'text-red-700'}`}>
                      <span>NETO REAL</span>
                      <span className="font-mono">{fmt(r.gananciaReal)} Bs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {taxMode === 'creator' && creatorResults && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precio de Venta Requerido por Escenario</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {creatorResults.map((r, i) => {
              const c = scenarioColors[i];
              return (
                <div key={i} className={`${c.bg} border ${c.border} rounded-xl p-4 transition-all hover:shadow-md`}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${c.badge}`}>
                      {r.label}
                    </span>
                  </div>
                  <div className={`text-2xl font-black ${c.accent} mb-3`}>
                    {fmt(r.precioVenta)} <span className="text-xs font-bold opacity-60">Bs</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <div className="flex justify-between">
                      <span>− IVA (13%)</span>
                      <span className="font-mono text-red-500">-{fmt(r.precioVenta * 0.13)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>− IT (3%)</span>
                      <span className="font-mono text-red-500">-{fmt(r.precioVenta * 0.03)}</span>
                    </div>
                    {i >= 1 && costoFacturado > 0 && (
                      <div className="flex justify-between">
                        <span>+ Crédito Fiscal</span>
                        <span className="font-mono text-emerald-600">+{fmt(costoFacturado * 0.13)}</span>
                      </div>
                    )}
                    {i === 2 && csf > 0 && (
                      <div className="flex justify-between">
                        <span>− Retención</span>
                        <span className="font-mono text-red-500">-{fmt((csf / 0.845) * 0.155)}</span>
                      </div>
                    )}
                    <div className={`flex justify-between border-t border-slate-200 pt-1 mt-1 font-bold ${c.text}`}>
                      <span>GANANCIA</span>
                      <span className="font-mono">{fmt(mg)} Bs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {((taxMode === 'creator' && !creatorResults) || (taxMode === 'auditor' && !auditorResults)) && (
        <div className="text-center py-6 text-slate-400">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">
            {taxMode === 'creator'
              ? 'Ingresa la ganancia neta deseada para ver los precios de venta.'
              : 'Agrega productos al carrito para ver el análisis tributario.'}
          </p>
        </div>
      )}
    </div>
  );
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
  const [savedClients, setSavedClients] = useState<ClientData[]>([]);

  // Tax analysis panel state
  const [showTaxPanel, setShowTaxPanel] = useState(false);
  const [taxMode, setTaxMode] = useState<'creator' | 'auditor'>('auditor');
  const [costoSinFactura, setCostoSinFactura] = useState<string>('');
  const [metaGananciaInput, setMetaGananciaInput] = useState<string>('');

  const [config, setConfig] = useState({
    env_mode: 'local',
    require_login: false,
    enable_scraper: true
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
      setIsAuthenticated(true);
    }

    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setAuthChecked(true);
      })
      .catch(err => {
        console.error("Error loading config", err);
        setAuthChecked(true);
      });

    fetch('/api/next-quote-number')
      .then(res => res.json())
      .then(data => setQuoteNumber(data.quote_number))
      .catch(() => setQuoteNumber('0000'));

    // Load saved clients
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setSavedClients(data))
      .catch(() => { });
  }, []);

  const searchProducts = async () => {
    if (!query) return;
    setLoading(true);
    // Clean query to avoid confusion
    setResults([]);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
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

      const res = await fetch('/api/generate-pdf', {
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

  // Auto-fill literal price whenever totalSales changes
  useEffect(() => {
    if (totalSales > 0) {
      setTerms(prev => ({ ...prev, precioLiteral: numberToSpanish(totalSales) }));
    } else {
      setTerms(prev => ({ ...prev, precioLiteral: '' }));
    }
  }, [totalSales]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword })
      });
      if (res.ok) {
        localStorage.setItem('auth_token', 'authorized');
        setIsAuthenticated(true);
      } else {
        setLoginError('Contraseña incorrecta');
      }
    } catch (err) {
      setLoginError('Error de conexión con el servidor');
    }
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-100 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  if (config.require_login && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Warp6 Cotizador</h1>
            <p className="text-slate-500 font-medium">Acceso Restringido</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña de Acceso</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <p className="text-sm font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
            >
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 font-sans text-slate-900">
      <header className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Warp6 Cotizador</h1>
          <p className="text-slate-600 font-medium">Sistema Profesional de Cotizaciones</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/calculadora"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Calculadora Tributaria</span>
          </Link>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-500 uppercase">Cotización N°</p>
            <p className="text-3xl font-black text-blue-600 tracking-tight">{quoteNumber}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Search (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {config.enable_scraper ? (
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
          ) : (
            <div className="bg-amber-50 p-5 rounded-xl shadow-sm border border-amber-200">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-amber-900">
                <Search className="w-5 h-5" /> Búsqueda de Productos
              </h2>
              <p className="text-sm text-amber-700">La búsqueda automática está desactivada en la versión Cloud. Por favor, usa la opción de "Agregar Producto Manual".</p>
            </div>
          )}

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
                <div className="p-5 bg-white">
                  {/* Client selector + save */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1"><Users className="w-3 h-3 inline" /> Cliente Guardado</label>
                      <select
                        className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-800 bg-white"
                        value=""
                        onChange={(e) => {
                          const selected = savedClients[parseInt(e.target.value)];
                          if (selected) setClient(selected);
                        }}
                      >
                        <option value="">-- Seleccionar cliente guardado --</option>
                        {savedClients.map((c, idx) => (
                          <option key={idx} value={idx}>{c.nombre} {c.telefono ? `(${c.telefono})` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        if (!client.nombre) { alert('Ingrese un nombre primero'); return; }
                        try {
                          await fetch('/api/clients', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(client)
                          });
                          const res = await fetch('/api/clients');
                          const data = await res.json();
                          setSavedClients(data);
                          alert(`Cliente "${client.nombre}" guardado correctamente`);
                        } catch { alert('Error al guardar'); }
                      }}
                      className="mt-5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4" /> Guardar
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                        <textarea
                          value={item.name}
                          onChange={(e) => updateName(idx, e.target.value)}
                          className="w-full font-bold text-slate-800 text-sm leading-tight bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 transition-all resize-y min-h-[40px]"
                          rows={item.name.split('\n').length || 1}
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
                    <textarea placeholder="Nombre o Descripción del Producto (Puedes presionar ENTER para múltiples líneas)" value={manualProduct.name} onChange={e => setManualProduct({ ...manualProduct, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-bold resize-y min-h-[80px]" />
                    <div className="flex gap-2">
                      <input type="number" placeholder="Precio Bs" value={manualProduct.price || ''} onChange={e => setManualProduct({ ...manualProduct, price: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg font-bold" />
                      <button onClick={addManualProduct} className="bg-blue-600 text-white px-4 rounded-lg font-medium">Agregar</button>
                      <button onClick={() => setShowManualProduct(false)} className="bg-white text-slate-600 px-4 rounded-lg font-medium">Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tax Analysis Panel */}
            <div className="border-2 border-slate-100 rounded-xl mb-6 overflow-hidden">
              <button
                onClick={() => setShowTaxPanel(!showTaxPanel)}
                className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-violet-50 hover:from-blue-100 hover:to-violet-100 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">$</span>
                  <span className="font-bold text-slate-800">Análisis Tributario</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">IVA · IT · IUE</span>
                </div>
                {showTaxPanel ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>

              {showTaxPanel && (
                <TaxAnalysisContent
                  totalCost={totalCost}
                  totalSales={totalSales}
                  taxMode={taxMode}
                  setTaxMode={setTaxMode}
                  costoSinFactura={costoSinFactura}
                  setCostoSinFactura={setCostoSinFactura}
                  metaGananciaInput={metaGananciaInput}
                  setMetaGananciaInput={setMetaGananciaInput}
                />
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
