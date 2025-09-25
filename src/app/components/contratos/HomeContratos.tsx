// src/app/components/contratos/HomeContratos.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "../../styles/pages/HomeContrato.scss"; // ← Sass “por componente”

type PuntoMensual = { mes: string; ventas: number; firmados: number };

const CONTRATOS = [
  { id: "acto-ap", titulo: "Área Protegida — ACTO", proveedor: "ACTO S.A.", etiqueta: "Área Protegida" },
  { id: "mesmera-ap", titulo: "Área Protegida — MESMERA", proveedor: "MESMERA", etiqueta: "Área Protegida" },
  { id: "medom-laboral-socio", titulo: "Medicina Laboral — Socio Nº", proveedor: "MEDOM S.A.", etiqueta: "Medicina Laboral" },
  { id: "medom-laboral-ap", titulo: "Medicina Laboral + Área Protegida", proveedor: "MEDOM S.A.", etiqueta: "Medicina Laboral / AP" },
];

const ATALHOS = [
  { href: "/reportes/contratos-firmados", label: "Ver contratos firmados" },
  { href: "/reportes/contratos-mas-vendidos", label: "Contratos más vendidos" },
  { href: "/reportes/planes-mas-vendidos", label: "Planes más vendidos" },
  { href: "/reportes/historial-comercial", label: "Historial de comercial" },
];

export default function HomeContratos({ role: roleProp }: { role?: "admin" | "comercial" } = {}) {
  const router = useRouter();
  const params = useSearchParams();
  const role = (roleProp ?? (params?.get("role") ?? "admin")) as "admin" | "comercial";
  const nombresComerciales = "LILIANA/CLAUDIO/PAMELA COMERCIAL";

  const [datos, setDatos] = useState<PuntoMensual[]>([
    { mes: "Ene", ventas: 14, firmados: 9 },
    { mes: "Feb", ventas: 11, firmados: 8 },
    { mes: "Mar", ventas: 18, firmados: 13 },
    { mes: "Abr", ventas: 20, firmados: 15 },
    { mes: "May", ventas: 22, firmados: 18 },
    { mes: "Jun", ventas: 25, firmados: 20 },
  ]);

  useEffect(() => {
    let cancelado = false;
    async function fetchDatos() {
      try {
        const r = await fetch("/api/metrics/mensuales");
        if (!r.ok) return;
        const payload = (await r.json()) as PuntoMensual[];
        if (!cancelado && Array.isArray(payload)) setDatos(payload);
      } catch {}
    }
    fetchDatos();
    const id = setInterval(fetchDatos, 15000);
    return () => { cancelado = true; clearInterval(id); };
  }, []);

  const tituloRol = role === "admin" ? "GERENCIA DE VENTAS" : nombresComerciales;
  const tituloMetricas = role === "admin" ? "MÉTRICAS MENSUALES" : "MIS MÉTRICAS MENSUALES";
  const onSelectContrato = (id: string) => router.push(`/contratos/nuevo?plantilla=${id}`);

  return (
    <div className="hc">
      <header className="hc__header">
        <div className="hc__headerTitle">INTERFAZ DE CONTRATOS DIGITALES</div>
        <div className="hc__headerRight">
          <div className="hc__headerRole">{tituloRol}</div>
          <div className="hc__avatar" aria-hidden />
        </div>
      </header>

      <main className="hc__main">
        {/* Izquierda */}
        <section className="hc__section">
          <h2 className="hc__sectionTitle">ELEGIR TIPO DE CONTRATO</h2>
          <div className="hc__cardGrid">
            {CONTRATOS.map((c) => (
              <button key={c.id} onClick={() => onSelectContrato(c.id)} className="hc-card">
                <div className="hc-card__thumb">
                  <img src="/gv-icon-outline.svg" alt="" />
                </div>
                <div className="hc-card__title">{c.titulo}</div>
                <div className="hc-card__meta">{c.proveedor} · {c.etiqueta}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Centro */}
        <section className="hc__section">
          <h2 className="hc__sectionTitle">{tituloMetricas}</h2>
          <div className="hc__metrics">
            <GraficoLineas datos={datos} width={920} height={520} />
          </div>
        </section>

        {/* Sidebar */}
        <aside className="hc-sidebar">
          <div className="hc-sidebar__title">ACCESOS RÁPIDOS</div>
          <div className="hc-sidebar__btns">
            {ATALHOS.map((a) => (
              <Link key={a.href} href={a.href} className="hc-sidebar__btn">
                {a.label}
              </Link>
            ))}
          </div>
          <div className="hc-sidebar__divider" />
          <div className="hc-sidebar__footer">
            <div>DataDevInk.</div>
            <div>Ver: 0.0.1</div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function GraficoLineas({ datos, width = 720, height = 360 }: { datos: PuntoMensual[]; width?: number; height?: number; }) {
  const padding = { t: 16, r: 16, b: 36, l: 44 };
  const maxY = useMemo(() => {
    const maxV = Math.max(...datos.flatMap((d) => [d.ventas, d.firmados]));
    return Math.ceil(maxV / 5) * 5;
  }, [datos]);
  const toX = (i: number) => {
    const w = width - padding.l - padding.r;
    return datos.length <= 1 ? padding.l : padding.l + (w * i) / (datos.length - 1);
  };
  const toY = (v: number) => {
    const h = height - padding.t - padding.b;
    const ratio = v / (maxY || 1);
    return padding.t + h - h * ratio;
  };
  const pathVentas = datos.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.ventas)}`).join(" ");
  const pathFirmados = datos.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.firmados)}`).join(" ");

  return (
    <div className="hc-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="hc-chart__svg">
        <line x1={padding.l} y1={height - padding.b} x2={width - padding.r} y2={height - padding.b} stroke="#CBD5E1" />
        <line x1={padding.l} y1={padding.t} x2={padding.l} y2={height - padding.b} stroke="#CBD5E1" />
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding.t + ((height - padding.t - padding.b) * i) / 4;
          const val = Math.round(maxY - (maxY * i) / 4);
          return (
            <g key={i}>
              <line x1={padding.l} x2={width - padding.r} y1={y} y2={y} stroke="#E2E8F0" />
              <text x={10} y={y + 4} fontSize={12} fill="#64748B">{val}</text>
            </g>
          );
        })}
        {datos.map((d, i) => (
          <text key={i} x={toX(i)} y={height - padding.b + 18} fontSize={12} textAnchor="middle" fill="#64748B">
            {d.mes}
          </text>
        ))}
        <path d={pathVentas} fill="none" stroke="#6366F1" strokeWidth={2.5} />
        {datos.map((d, i) => <circle key={`v-${i}`} cx={toX(i)} cy={toY(d.ventas)} r={3.8} fill="#6366F1" />)}
        <path d={pathFirmados} fill="none" stroke="#0EA5E9" strokeWidth={2.5} />
        {datos.map((d, i) => <circle key={`f-${i}`} cx={toX(i)} cy={toY(d.firmados)} r={3.8} fill="#0EA5E9" />)}
        <g>
          <rect x={width - 208} y={padding.t} width={192} height={36} rx={10} fill="#F8FAFC" stroke="#E2E8F0" />
          <circle cx={width - 190} cy={padding.t + 18} r={5} fill="#6366F1" />
          <text x={width - 176} y={padding.t + 22} fontSize={12} fill="#334155">Ventas</text>
          <circle cx={width - 118} cy={padding.t + 18} r={5} fill="#0EA5E9" />
          <text x={width - 104} y={padding.t + 22} fontSize={12} fill="#334155">Firmados</text>
        </g>
      </svg>
    </div>
  );
}
