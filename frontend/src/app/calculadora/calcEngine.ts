// Motor de Cálculo Tributario Boliviano
// Todas las fórmulas fiscales para IVA, IT, Crédito Fiscal, Retenciones e IUE

export interface CreatorResult {
    precioVenta: number;
    label: string;
    description: string;
    color: string;
}

export interface AuditorScenario {
    dineroMes: number;
    utilidadGravable: number;
    iueAnual: number;
    gananciaReal: number;
    label: string;
    description: string;
    color: string;
}

// ─── MODO 1: CREADOR ─────────────────────────────────────────────
// Calcula el Precio de Venta necesario para obtener la meta de ganancia neta
export function calcCreator(
    costoFacturado: number,
    costoSinFactura: number,
    metaGanancia: number
): CreatorResult[] {
    // Escenario 1: Sin Respaldo (Informal)
    const precio1 = (metaGanancia + costoFacturado + costoSinFactura) / 0.63;

    // Escenario 2: Híbrido (Solo facturas de compra)
    const precio2 = (metaGanancia + 0.6525 * costoFacturado + costoSinFactura) / 0.63;

    // Escenario 3: Formal (Facturas + Retenciones asumidas)
    const precio3 = (metaGanancia + 0.6525 * costoFacturado + 0.75 * (costoSinFactura / 0.845)) / 0.63;

    return [
        {
            precioVenta: precio1,
            label: 'Sin Respaldo',
            description: 'No se emite factura. Se pagan todos los impuestos sin crédito fiscal ni retenciones.',
            color: 'red',
        },
        {
            precioVenta: precio2,
            label: 'Híbrido',
            description: 'Se usa el crédito fiscal de las facturas de compra. No se retienen servicios sin factura.',
            color: 'amber',
        },
        {
            precioVenta: precio3,
            label: 'Formal',
            description: 'Se usa crédito fiscal de facturas y se retiene impuesto por servicios sin factura (RC-IVA acrecentado).',
            color: 'emerald',
        },
    ];
}

// ─── MODO 2: AUDITOR ─────────────────────────────────────────────
// Calcula la Ganancia Neta Real dado un precio ya cotizado
export function calcAuditor(
    costoFacturado: number,
    costoSinFactura: number,
    precioCotizado: number
): AuditorScenario[] {
    const ivaDebito = precioCotizado * 0.13;
    const it = precioCotizado * 0.03;
    const creditoFiscal = costoFacturado * 0.13;
    const retencionAcrecentada = (costoSinFactura / 0.845) * 0.155;

    // ── Escenario 1: Sin Respaldo ──
    const dineroMes1 = precioCotizado - costoFacturado - costoSinFactura - ivaDebito - it;
    const utilidad1 = precioCotizado - ivaDebito - it;
    const iue1 = utilidad1 > 0 ? utilidad1 * 0.25 : 0;
    const ganancia1 = dineroMes1 - iue1;

    // ── Escenario 2: Híbrido ──
    const dineroMes2 = precioCotizado - costoFacturado - costoSinFactura - ivaDebito + creditoFiscal - it;
    const utilidad2 = precioCotizado - ivaDebito - it - (costoFacturado - creditoFiscal);
    const iue2 = utilidad2 > 0 ? utilidad2 * 0.25 : 0;
    const ganancia2 = dineroMes2 - iue2;

    // ── Escenario 3: Formal ──
    const dineroMes3 = precioCotizado - costoFacturado - costoSinFactura - ivaDebito + creditoFiscal - it - retencionAcrecentada;
    const utilidad3 = dineroMes3;
    const iue3 = utilidad3 > 0 ? utilidad3 * 0.25 : 0;
    const ganancia3 = dineroMes3 - iue3;

    return [
        {
            dineroMes: dineroMes1,
            utilidadGravable: utilidad1,
            iueAnual: iue1,
            gananciaReal: ganancia1,
            label: 'Sin Respaldo',
            description: 'Sin factura emitida. Se paga todo el IVA y IT sin deducción.',
            color: 'red',
        },
        {
            dineroMes: dineroMes2,
            utilidadGravable: utilidad2,
            iueAnual: iue2,
            gananciaReal: ganancia2,
            label: 'Híbrido',
            description: 'Se aprovecha crédito fiscal de facturas de compra, pero no se retiene por servicios.',
            color: 'amber',
        },
        {
            dineroMes: dineroMes3,
            utilidadGravable: utilidad3,
            iueAnual: iue3,
            gananciaReal: ganancia3,
            label: 'Formal',
            description: 'Se maximiza el beneficio fiscal: crédito por facturas + retención acrecentada por servicios.',
            color: 'emerald',
        },
    ];
}

// ─── CONSTANTES TRIBUTARIAS (para mostrar en UI) ──────────────────
export const TAX_RATES = {
    IVA_DEBITO: 0.13,
    IT: 0.03,
    CREDITO_FISCAL: 0.13,
    RETENCION_FACTOR: 0.155,
    RETENCION_DIVISOR: 0.845,
    IUE: 0.25,
} as const;
