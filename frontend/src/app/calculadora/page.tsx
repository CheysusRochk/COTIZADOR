'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Calculator,
    ArrowLeft,
    TrendingUp,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Eye,
    PenTool,
    DollarSign,
    AlertTriangle,
    Info,
    BarChart3,
} from 'lucide-react';
import { calcCreator, calcAuditor, TAX_RATES } from './calcEngine';
import type { CreatorResult, AuditorScenario } from './calcEngine';

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; icon: string; glow: string }> = {
    red: {
        bg: 'bg-red-950/40',
        border: 'border-red-500/30',
        text: 'text-red-400',
        badge: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: 'text-red-400',
        glow: 'shadow-red-500/10',
    },
    amber: {
        bg: 'bg-amber-950/40',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: 'text-amber-400',
        glow: 'shadow-amber-500/10',
    },
    emerald: {
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: 'text-emerald-400',
        glow: 'shadow-emerald-500/10',
    },
};

const scenarioIcons = [ShieldAlert, Shield, ShieldCheck];

function fmt(n: number): string {
    return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CalculadoraPage() {
    const [mode, setMode] = useState<'creator' | 'auditor'>('creator');

    // Inputs
    const [costoFacturado, setCostoFacturado] = useState<string>('');
    const [costoSinFactura, setCostoSinFactura] = useState<string>('');
    const [metaGanancia, setMetaGanancia] = useState<string>('');
    const [precioCotizado, setPrecioCotizado] = useState<string>('');

    const cf = parseFloat(costoFacturado) || 0;
    const csf = parseFloat(costoSinFactura) || 0;
    const mg = parseFloat(metaGanancia) || 0;
    const pc = parseFloat(precioCotizado) || 0;

    const hasInputs = cf > 0 || csf > 0;
    const canCalcCreator = hasInputs && mg > 0;
    const canCalcAuditor = hasInputs && pc > 0;

    const creatorResults: CreatorResult[] | null = useMemo(() => {
        if (mode !== 'creator' || !canCalcCreator) return null;
        return calcCreator(cf, csf, mg);
    }, [mode, cf, csf, mg, canCalcCreator]);

    const auditorResults: AuditorScenario[] | null = useMemo(() => {
        if (mode !== 'auditor' || !canCalcAuditor) return null;
        return calcAuditor(cf, csf, pc);
    }, [mode, cf, csf, pc, canCalcAuditor]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans">
            {/* ── Header ─────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">Cotizador</span>
                        </Link>
                        <div className="h-6 w-px bg-slate-700" />
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <Calculator className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-extrabold tracking-tight leading-none">
                                    Calculadora Tributaria
                                </h1>
                                <p className="text-[11px] text-slate-500 font-medium">Motor Fiscal Boliviano</p>
                            </div>
                        </div>
                    </div>

                    {/* Tax rates badge */}
                    <div className="hidden md:flex items-center gap-3 text-xs">
                        <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                            IVA {(TAX_RATES.IVA_DEBITO * 100).toFixed(0)}%
                        </span>
                        <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                            IT {(TAX_RATES.IT * 100).toFixed(0)}%
                        </span>
                        <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                            IUE {(TAX_RATES.IUE * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* ── Mode Toggle ──────────────────────────────────── */}
                <div className="flex justify-center">
                    <div className="inline-flex bg-slate-800/60 rounded-2xl p-1.5 border border-slate-700/50 shadow-xl">
                        <button
                            onClick={() => setMode('creator')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${mode === 'creator'
                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                                }`}
                        >
                            <PenTool className="w-4 h-4" />
                            Modo Creador
                        </button>
                        <button
                            onClick={() => setMode('auditor')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${mode === 'auditor'
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                                }`}
                        >
                            <Eye className="w-4 h-4" />
                            Modo Auditor
                        </button>
                    </div>
                </div>

                {/* ── Mode Description ─────────────────────────────── */}
                <div className="text-center max-w-2xl mx-auto">
                    {mode === 'creator' ? (
                        <>
                            <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                ¿A cuánto debo vender?
                            </h2>
                            <p className="text-sm text-slate-500">
                                Ingresa tus costos y la ganancia neta que deseas. El sistema calcula el Precio de Venta
                                necesario en cada escenario fiscal.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                ¿Cuánto ganaré realmente?
                            </h2>
                            <p className="text-sm text-slate-500">
                                Ingresa tus costos y el precio de venta ya definido. El sistema calcula tu Ganancia Neta
                                Real en cada escenario fiscal.
                            </p>
                        </>
                    )}
                </div>

                {/* ── Input Panel ──────────────────────────────────── */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl max-w-3xl mx-auto">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Variables de Entrada
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Costo Facturado */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                <DollarSign className="w-3 h-3" /> Costo Facturado
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={costoFacturado}
                                    onChange={(e) => setCostoFacturado(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/80 border-2 border-slate-600/50 rounded-xl text-white font-bold placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-lg"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">Bs</span>
                            </div>
                            <p className="text-[11px] text-slate-600">Compras con factura (crédito fiscal 13%)</p>
                        </div>

                        {/* Costo Sin Factura */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3 text-amber-500" /> Costo Sin Factura
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={costoSinFactura}
                                    onChange={(e) => setCostoSinFactura(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/80 border-2 border-slate-600/50 rounded-xl text-white font-bold placeholder-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-lg"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">Bs</span>
                            </div>
                            <p className="text-[11px] text-slate-600">Servicios, viáticos o compras sin respaldo</p>
                        </div>

                        {/* Dynamic field based on mode */}
                        <div className="sm:col-span-2 space-y-1.5">
                            {mode === 'creator' ? (
                                <>
                                    <label className="text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5">
                                        <TrendingUp className="w-3 h-3" /> Meta de Ganancia Neta
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={metaGanancia}
                                            onChange={(e) => setMetaGanancia(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-900/80 border-2 border-blue-500/40 rounded-xl text-white font-bold placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-lg"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">Bs</span>
                                    </div>
                                    <p className="text-[11px] text-blue-400/60">¿Cuánto quieres ganar NETO después de todos los impuestos?</p>
                                </>
                            ) : (
                                <>
                                    <label className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                                        <DollarSign className="w-3 h-3" /> Precio Cotizado (Venta)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={precioCotizado}
                                            onChange={(e) => setPrecioCotizado(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-900/80 border-2 border-emerald-500/40 rounded-xl text-white font-bold placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-lg"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">Bs</span>
                                    </div>
                                    <p className="text-[11px] text-emerald-400/60">Precio de venta definido por el cliente o tercero</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Cost summary */}
                    {hasInputs && (
                        <div className="mt-5 pt-4 border-t border-slate-700/50 flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">Costo Total:</span>
                                <span className="font-bold text-white">{fmt(cf + csf)} Bs</span>
                            </div>
                            {cf > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Crédito Fiscal potencial:</span>
                                    <span className="font-bold text-emerald-400">{fmt(cf * TAX_RATES.CREDITO_FISCAL)} Bs</span>
                                </div>
                            )}
                            {csf > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Retención acrecentada:</span>
                                    <span className="font-bold text-red-400">{fmt((csf / TAX_RATES.RETENCION_DIVISOR) * TAX_RATES.RETENCION_FACTOR)} Bs</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Results Panel ────────────────────────────────── */}
                {mode === 'creator' && creatorResults && (
                    <div className="space-y-5">
                        <h3 className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
                            Precio de Venta Requerido por Escenario
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {creatorResults.map((r, i) => {
                                const c = colorMap[r.color];
                                const Icon = scenarioIcons[i];
                                return (
                                    <div
                                        key={i}
                                        className={`relative ${c.bg} backdrop-blur border ${c.border} rounded-2xl p-6 shadow-xl ${c.glow} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <Icon className={`w-5 h-5 ${c.icon}`} />
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${c.badge}`}>
                                                Escenario {i + 1}
                                            </span>
                                        </div>
                                        <h4 className={`text-lg font-bold ${c.text} mb-1`}>{r.label}</h4>
                                        <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">{r.description}</p>

                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-xs text-slate-500 uppercase font-bold">Precio de Venta</span>
                                                <div className={`text-3xl font-black ${c.text} tracking-tight`}>
                                                    {fmt(r.precioVenta)} <span className="text-base font-bold opacity-60">Bs</span>
                                                </div>
                                            </div>

                                            {/* Desglose impuestos */}
                                            <div className="space-y-1.5 pt-3 border-t border-slate-700/30 text-xs">
                                                <div className="flex justify-between text-slate-500">
                                                    <span>IVA Débito (13%)</span>
                                                    <span className="text-red-400 font-mono">-{fmt(r.precioVenta * 0.13)}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-500">
                                                    <span>IT (3%)</span>
                                                    <span className="text-red-400 font-mono">-{fmt(r.precioVenta * 0.03)}</span>
                                                </div>
                                                {i >= 1 && cf > 0 && (
                                                    <div className="flex justify-between text-slate-500">
                                                        <span>Crédito Fiscal</span>
                                                        <span className="text-emerald-400 font-mono">+{fmt(cf * 0.13)}</span>
                                                    </div>
                                                )}
                                                {i === 2 && csf > 0 && (
                                                    <div className="flex justify-between text-slate-500">
                                                        <span>Retención Acrecentada</span>
                                                        <span className="text-red-400 font-mono">-{fmt((csf / 0.845) * 0.155)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-3 border-t border-slate-700/30">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-slate-500 uppercase font-bold">Ganancia Neta Objetivo</span>
                                                    <span className="font-bold text-emerald-400">{fmt(mg)} Bs</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {mode === 'auditor' && auditorResults && (
                    <div className="space-y-5">
                        <h3 className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
                            Ganancia Neta Real por Escenario
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {auditorResults.map((r, i) => {
                                const c = colorMap[r.color];
                                const Icon = scenarioIcons[i];
                                const isPositive = r.gananciaReal >= 0;
                                return (
                                    <div
                                        key={i}
                                        className={`relative ${c.bg} backdrop-blur border ${c.border} rounded-2xl p-6 shadow-xl ${c.glow} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <Icon className={`w-5 h-5 ${c.icon}`} />
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${c.badge}`}>
                                                Escenario {i + 1}
                                            </span>
                                        </div>
                                        <h4 className={`text-lg font-bold ${c.text} mb-1`}>{r.label}</h4>
                                        <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">{r.description}</p>

                                        <div className="space-y-3">
                                            {/* Main result */}
                                            <div>
                                                <span className="text-xs text-slate-500 uppercase font-bold">Ganancia Neta Real</span>
                                                <div className={`text-3xl font-black tracking-tight ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {isPositive ? '' : '-'}{fmt(Math.abs(r.gananciaReal))} <span className="text-base font-bold opacity-60">Bs</span>
                                                </div>
                                            </div>

                                            {/* Step-by-step breakdown */}
                                            <div className="space-y-2 pt-3 border-t border-slate-700/30 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Precio Cotizado</span>
                                                    <span className="text-white font-mono font-bold">{fmt(pc)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">− Costos Totales</span>
                                                    <span className="text-red-400 font-mono">-{fmt(cf + csf)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">− IVA Débito (13%)</span>
                                                    <span className="text-red-400 font-mono">-{fmt(pc * 0.13)}</span>
                                                </div>
                                                {i >= 1 && cf > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">+ Crédito Fiscal</span>
                                                        <span className="text-emerald-400 font-mono">+{fmt(cf * 0.13)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">− IT (3%)</span>
                                                    <span className="text-red-400 font-mono">-{fmt(pc * 0.03)}</span>
                                                </div>
                                                {i === 2 && csf > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">− Retención Acrecentada</span>
                                                        <span className="text-red-400 font-mono">-{fmt((csf / 0.845) * 0.155)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between pt-1 border-t border-slate-700/20">
                                                    <span className="text-slate-400 font-bold">= Dinero Mensual</span>
                                                    <span className={`font-mono font-bold ${r.dineroMes >= 0 ? 'text-slate-200' : 'text-red-400'}`}>
                                                        {fmt(r.dineroMes)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Utilidad Gravable</span>
                                                    <span className="text-slate-400 font-mono">{fmt(r.utilidadGravable)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">− IUE (25%)</span>
                                                    <span className="text-red-400 font-mono">-{fmt(r.iueAnual)}</span>
                                                </div>

                                                <div className="flex justify-between pt-2 border-t border-slate-700/30">
                                                    <span className="text-slate-300 font-bold text-sm">GANANCIA REAL</span>
                                                    <span className={`font-bold text-sm font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {fmt(r.gananciaReal)} Bs
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {((mode === 'creator' && !canCalcCreator) || (mode === 'auditor' && !canCalcAuditor)) && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                        <Info className="w-12 h-12 mb-4 opacity-30" />
                        <p className="font-bold text-lg mb-1">Ingresa los datos para calcular</p>
                        <p className="text-sm max-w-md text-center">
                            {mode === 'creator'
                                ? 'Necesitas al menos un costo (facturado o sin factura) y una meta de ganancia para ver los resultados.'
                                : 'Necesitas al menos un costo (facturado o sin factura) y el precio cotizado para ver los resultados.'}
                        </p>
                    </div>
                )}

                {/* ── Tax Reference Footer ─────────────────────────── */}
                <div className="max-w-3xl mx-auto mt-8 bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 text-xs text-slate-600">
                    <h4 className="text-slate-500 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                        <Info className="w-3 h-3" /> Referencia Tributaria Bolivia
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4">
                        <span><strong className="text-slate-400">IVA (Débito Fiscal):</strong> 13% sobre Precio Venta</span>
                        <span><strong className="text-slate-400">IT:</strong> 3% sobre Precio Venta</span>
                        <span><strong className="text-slate-400">Crédito Fiscal:</strong> 13% sobre Costo Facturado</span>
                        <span><strong className="text-slate-400">Retención Acrecentada:</strong> 15.5% sobre (Costo / 0.845)</span>
                        <span><strong className="text-slate-400">IUE:</strong> 25% sobre Utilidad Gravable (&gt; 0)</span>
                        <span><strong className="text-slate-400">Divisor general:</strong> 0.63 (1 − 0.13 − 0.03 − 0.25×0.84)</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
