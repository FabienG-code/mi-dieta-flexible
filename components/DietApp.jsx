import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Leaf, Plus, X, Check, ChevronRight, Sunrise, Sun, Moon, Sunset, Info,
  CalendarDays, User2, History as HistoryIcon, Activity, Users, UserPlus,
  Ruler, TrendingUp, ChefHat, Share2
} from "lucide-react";

/* ---------------------------------------------------------------------
   DATOS BASE — sistema de "bloques de alimentos" del libro
   "Quema tu dieta" (Ismael Galancho), capítulo 6: Construye tu propia dieta.
   Cantidades en gramos en crudo, según peso corporal:
   columna 0 = <60kg · columna 1 = 60-80kg · columna 2 = >80kg

   Los alimentos marcados con custom:true son AÑADIDOS por esta app para
   ampliar variedad (no aparecen en la tabla original del libro); sus
   cantidades son estimaciones orientativas por analogía con alimentos
   similares de la tabla original.
--------------------------------------------------------------------- */

const TAGS = {
  P: { label: "Proteína", color: "#9C3B2E", soft: "#F3DEDA" },
  G: { label: "Grasa", color: "#B9762B", soft: "#F2E3D0" },
  C: { label: "Carbohidrato", color: "#C79A2A", soft: "#F5EAC9" },
  F: { label: "Fruta", color: "#B4506F", soft: "#F3DDE5" },
  V: { label: "Verdura", color: "#4C7A52", soft: "#DCEBDD" },
};

const PROTEINS = [
  { n: "Almejas", tags: ["P"], q: [190, 220, 260] },
  { n: "Atún en lata al natural", tags: ["P"], q: [60, 90, 90], note: "Máx. 6 latas/semana" },
  { n: "Atún fresco", tags: ["P", "G"], q: [110, 140, 165] },
  { n: "Berberechos al natural", tags: ["P"], q: [180, 220, 250] },
  { n: "Clara de huevo", tags: ["P"], q: [120, 180, 180] },
  { n: "Cordero", tags: ["P", "G"], q: [100, 130, 150], note: "Carne roja: máx. 2-3 raciones/semana" },
  { n: "Entrecote de ternera", tags: ["P", "G"], q: [100, 130, 150], note: "Carne roja: máx. 2-3 raciones/semana" },
  { n: "Fiambre de pavo/pollo", tags: ["P"], q: [60, 70, 80], note: "Mín. 90-95% carne" },
  { n: "Gambas o langostinos cocidos", tags: ["P"], q: [120, 150, 170] },
  { n: "Jamón serrano (sin grasa visible)", tags: ["P", "G"], q: [75, 90, 110], note: "Máx. 2-3 raciones/semana" },
  { n: "Kéfir desnatado + yogur 0%", tags: ["P", "C"], q: ["200+125", "250+125", "300+125"] },
  { n: "Kéfir entero + yogur 0%", tags: ["P", "C", "G"], q: ["160+125", "200+125", "270+125"] },
  { n: "Leche desnatada + yogur 0%", tags: ["P", "C"], q: ["200+125", "250+125", "300+125"] },
  { n: "Leche entera + yogur 0%", tags: ["P", "C", "G"], q: ["200+125", "250+125", "340+125"] },
  { n: "Mejillones", tags: ["P"], q: [140, 170, 200] },
  { n: "Tilapia", tags: ["P"], q: [150, 190, 220] },
  { n: "Bacalao", tags: ["P"], q: [150, 190, 220] },
  { n: "Merluza", tags: ["P"], q: [150, 190, 220] },
  { n: "Calamar", tags: ["P"], q: [150, 190, 220] },
  { n: "Sepia", tags: ["P"], q: [150, 190, 220] },
  { n: "Corvina", tags: ["P"], q: [150, 190, 220] },
  { n: "Dorada", tags: ["P"], q: [150, 190, 220] },
  { n: "Pollo", tags: ["P"], q: [110, 140, 160] },
  { n: "Proteína en polvo", tags: ["P"], q: [30, 35, 40] },
  { n: "Queso fresco batido 0%", tags: ["P"], q: [300, 390, 440] },
  { n: "Salmón", tags: ["P", "G"], q: [120, 145, 170] },
  { n: "Salmón ahumado", tags: ["P", "G"], q: [100, 120, 140] },
  { n: "Sardina", tags: ["P", "G"], q: [140, 170, 200] },
  { n: "Secreto ibérico", tags: ["P", "G"], q: [100, 130, 150], note: "Carne roja: máx. 2-3 raciones/semana" },
  { n: "Seitán", tags: ["P"], q: [100, 130, 150] },
  { n: "Soja texturizada", tags: ["P", "C"], q: [50, 60, 70] },
  { n: "Solomillo de cerdo", tags: ["P", "G"], q: [110, 130, 150], note: "Carne roja: máx. 2-3 raciones/semana" },
  { n: "Solomillo de ternera", tags: ["P", "G"], q: [130, 150, 180], note: "Carne roja: máx. 2-3 raciones/semana" },
  { n: "Tofu", tags: ["P", "G"], q: [200, 240, 290] },
  { n: "Trucha", tags: ["P", "G"], q: [130, 160, 190] },
  { n: "Vacío", tags: ["P", "G"], q: [120, 140, 180], note: "Carne roja: máx. 2-3 raciones/semana" },
  // --- añadidos (custom) ---
  { n: "Whey protein (concentrado)", tags: ["P"], q: [30, 35, 40], custom: true, note: "Equivalente a proteína en polvo genérica" },
  { n: "Pechuga de pavo (fresca)", tags: ["P"], q: [110, 140, 160], custom: true },
  { n: "Conejo", tags: ["P"], q: [110, 140, 160], custom: true },
  { n: "Boquerones", tags: ["P", "G"], q: [140, 170, 200], custom: true },
  { n: "Requesón", tags: ["P"], q: [250, 320, 370], custom: true },
  { n: "Yogur griego 0%", tags: ["P"], q: [200, 250, 300], custom: true },
  { n: "Edamame (con vaina)", tags: ["P", "C"], q: [150, 180, 210], custom: true },
];

const CARBS = [
  { n: "Alubias en seco", tags: ["C", "P"], q: [70, 80, 90] },
  { n: "Arroz / noodles / fideos de arroz", tags: ["C"], q: [50, 60, 70] },
  { n: "Arroz / espelta / quinoa inflada", tags: ["C"], q: [45, 55, 65], note: "Sin azúcares añadidos" },
  { n: "Batata / boniato", tags: ["C"], q: [160, 190, 230] },
  { n: "Corn flakes", tags: ["C"], q: [45, 55, 65], note: "Sin azúcares añadidos" },
  { n: "Cuscús", tags: ["C"], q: [50, 60, 70] },
  { n: "Dátiles", tags: ["C"], q: [20, 25, 30], note: "Mejor tras entrenar" },
  { n: "Dulce de leche", tags: ["C"], q: [30, 35, 40], note: "Mejor tras entrenar" },
  { n: "Garbanzos en seco", tags: ["C", "P"], q: [70, 80, 90] },
  { n: "Guisantes", tags: ["C", "P"], q: [250, 280, 320] },
  { n: "Harinas", tags: ["C"], q: [50, 60, 70], note: "Mejor tras entrenar" },
  { n: "Lentejas en seco", tags: ["C", "P"], q: [70, 80, 90] },
  { n: "Maíz en grano / palomitas", tags: ["C"], q: [50, 60, 70] },
  { n: "Mermelada", tags: ["C"], q: [40, 45, 50], note: "Mejor tras entrenar" },
  { n: "Miel", tags: ["C"], q: [25, 30, 35], note: "Mejor tras entrenar" },
  { n: "Mijo / polenta / bulgur", tags: ["C"], q: [50, 60, 70] },
  { n: "Ñoquis", tags: ["C"], q: [100, 120, 140] },
  { n: "Pan integral", tags: ["C"], q: [70, 80, 90], note: "100% integral" },
  { n: "Patata", tags: ["C"], q: [180, 210, 250] },
  { n: "Pasta integral", tags: ["C"], q: [50, 60, 70] },
  { n: "Yuca", tags: ["C"], q: [110, 130, 145] },
  // --- añadidos (custom) ---
  { n: "Arroz blanco", tags: ["C"], q: [50, 60, 70], custom: true },
  { n: "Pasta blanca", tags: ["C"], q: [50, 60, 70], custom: true },
  { n: "Quinoa en seco", tags: ["C"], q: [45, 55, 65], custom: true },
  { n: "Avena en copos", tags: ["C"], q: [45, 55, 65], custom: true },
  { n: "Pan de molde integral", tags: ["C"], q: [70, 80, 90], custom: true },
  { n: "Tortitas de maíz o arroz", tags: ["C"], q: [45, 55, 65], custom: true },
  { n: "Garbanzos cocidos (bote, escurridos)", tags: ["C", "P"], q: [130, 150, 170], custom: true },
  { n: "Alubias cocidas (bote, escurridas)", tags: ["C", "P"], q: [130, 150, 170], custom: true },
  { n: "Lentejas cocidas (bote, escurridas)", tags: ["C", "P"], q: [130, 150, 170], custom: true },
];

const FATS = [
  { n: "Aceite de coco", tags: ["G"], q: [10, 10, 10] },
  { n: "Aceite de oliva", tags: ["G"], q: [10, 10, 10] },
  { n: "Aceitunas", tags: ["G"], q: [60, 60, 60] },
  { n: "Aguacate", tags: ["G"], q: [60, 60, 60] },
  { n: "Almendras", tags: ["G"], q: [20, 20, 20] },
  { n: "Guacamole", tags: ["G"], q: [60, 60, 60] },
  { n: "Huevos", tags: ["G", "P"], q: [1, 1, 1], unit: "ud", note: "Máx. 7 huevos/semana" },
  { n: "Queso parmesano", tags: ["G", "P"], q: [25, 25, 25] },
  { n: "Mozzarella light 0%", tags: ["G", "P"], q: [60, 60, 60] },
  { n: "Hummus", tags: ["G"], q: [35, 35, 35] },
  { n: "Mantequilla", tags: ["G"], q: [15, 15, 15], note: "No confundir con margarina" },
  { n: "Mantequilla de cacahuete", tags: ["G"], q: [20, 20, 20] },
  { n: "Nueces", tags: ["G"], q: [15, 15, 15] },
  { n: "Avellanas", tags: ["G"], q: [15, 15, 15] },
  { n: "Pistachos", tags: ["G"], q: [20, 20, 20] },
  { n: "Tahini", tags: ["G"], q: [15, 15, 15] },
  // --- añadidos (custom) ---
  { n: "Pipas de girasol (peladas)", tags: ["G"], q: [20, 20, 20], custom: true },
  { n: "Semillas de chía", tags: ["G"], q: [15, 15, 15], custom: true },
  { n: "Semillas de lino", tags: ["G"], q: [15, 15, 15], custom: true },
  { n: "Coco rallado", tags: ["G"], q: [20, 20, 20], custom: true },
  { n: "Anacardos", tags: ["G"], q: [20, 20, 20], custom: true },
];

const FRUITS = [
  { n: "Albaricoque", q: 5, unit: "ud" },
  { n: "Arándanos", q: 160 },
  { n: "Caquis", q: 150 },
  { n: "Cerezas", q: 180 },
  { n: "Chirimoyas", q: 170 },
  { n: "Ciruelas", q: 3, unit: "ud" },
  { n: "Frambuesas", q: 160 },
  { n: "Fresas", q: 300 },
  { n: "Higos", q: 140 },
  { n: "Kiwis", q: 2, unit: "ud" },
  { n: "Mandarinas", q: 2, unit: "ud" },
  { n: "Mango", q: 200 },
  { n: "Manzana", q: 200 },
  { n: "Melocotón", q: 240 },
  { n: "Melón", q: 190 },
  { n: "Moras", q: 240 },
  { n: "Naranjas", q: 200 },
  { n: "Níspero", q: 4, unit: "ud" },
  { n: "Papaya", q: 245 },
  { n: "Pera", q: 180 },
  { n: "Piña", q: 230 },
  { n: "Plátano", q: 100 },
  { n: "Sandía", q: 300 },
  { n: "Uvas", q: 150 },
  { n: "Pomelo", q: 220, custom: true },
  { n: "Granada", q: 150, custom: true },
].map((f) => ({ ...f, tags: ["F"] }));

const VEGETABLES = [
  "Lechuga", "Canónigos", "Rúcula", "Escarola", "Kale", "Espinacas", "Acelgas",
  "Brócoli", "Bimi", "Calabacín", "Pimiento verde", "Pimiento rojo", "Puerro",
  "Berenjena", "Cebolla", "Zanahoria", "Calabaza", "Col", "Coliflor", "Tomate",
  "Alcachofas", "Apio", "Pepino", "Ajos", "Espárragos", "Setas", "Champiñones",
  "Nabo", "Coles de Bruselas",
];

// Platos compuestos — estimación orientativa en bloques, no del libro
const PLATOS = [
  { n: "Tortilla española (ración ~250 g)", tags: ["P", "G", "C"], custom: true, unit: "racion", q: "1 ración" },
  { n: "Lasaña de carne (ración ~300 g)", tags: ["P", "P", "C", "G"], custom: true, unit: "racion", q: "1 ración" },
  { n: "Paella de marisco (ración ~300 g)", tags: ["P", "C", "C"], custom: true, unit: "racion", q: "1 ración" },
  { n: "Pizza margarita (2 porciones)", tags: ["P", "G", "C", "C"], custom: true, unit: "racion", q: "1 ración" },
  { n: "Hamburguesa completa con pan", tags: ["P", "P", "G", "C"], custom: true, unit: "racion", q: "1 ración" },
  { n: "Bocadillo de jamón serrano", tags: ["P", "C"], custom: true, unit: "racion", q: "1 ración" },
  { n: "Ensalada de pasta con atún", tags: ["P", "C", "G"], custom: true, unit: "racion", q: "1 ración" },
  { n: "Revuelto de setas y jamón", tags: ["P", "G"], custom: true, unit: "racion", q: "1 ración" },
  { n: "Fajitas de pollo (2 unidades)", tags: ["P", "C", "G"], custom: true, unit: "racion", q: "1 ración" },
  { n: "Poke bowl de salmón", tags: ["P", "G", "C", "V"], custom: true, unit: "racion", q: "1 ración" },
];

const FOODS_BY_TAG = { P: PROTEINS, G: FATS, C: CARBS, F: FRUITS };

const TARGETS_BASE = {
  H: { P: 4, G: 2, C: 3, F: 2, V: 2 },
  M: { P: 4, G: 2, C: 2, F: 2, V: 2 },
};

// Ajuste de bloques según objetivo — NO proviene del libro (que solo cubre
// pérdida de grasa); es una extrapolación orientativa de esta app.
const OBJETIVOS = {
  perder: { label: "Perder grasa", delta: {} },
  mantenimiento: { label: "Mantenimiento", delta: { C: 1 } },
  ganar: { label: "Ganar masa muscular", delta: { P: 1, C: 2, G: 1 } },
};

function getTargets(sexKey, objetivo) {
  const base = TARGETS_BASE[sexKey];
  const delta = (OBJETIVOS[objetivo] || OBJETIVOS.perder).delta;
  const out = {};
  Object.keys(base).forEach((k) => (out[k] = base[k] + (delta[k] || 0)));
  return out;
}

// Plantillas de reparto de bloques por comida — libro cap. 6
const TEMPLATES = {
  manana: {
    4: {
      M: [
        { meal: "Desayuno", icon: "sunrise", tags: ["P", "C", "F"] },
        { meal: "Media mañana", icon: "sun", tags: ["P", "F"] },
        { meal: "Almuerzo", icon: "sunset", tags: ["P", "C", "G", "V"] },
        { meal: "Cena", icon: "moon", tags: ["P", "G", "V"] },
      ],
      H: [
        { meal: "Desayuno", icon: "sunrise", tags: ["P", "C", "F"] },
        { meal: "Media mañana", icon: "sun", tags: ["P", "F"] },
        { meal: "Almuerzo", icon: "sunset", tags: ["P", "G", "C", "V"] },
        { meal: "Cena", icon: "moon", tags: ["P", "G", "V"] },
      ],
    },
    3: {
      M: [
        { meal: "Desayuno", icon: "sunrise", tags: ["P", "C", "F"] },
        { meal: "Almuerzo", icon: "sunset", tags: ["P", "P", "C", "G", "V"] },
        { meal: "Cena", icon: "moon", tags: ["P", "G", "V", "F"] },
      ],
      H: [
        { meal: "Desayuno", icon: "sunrise", tags: ["P", "C", "F"] },
        { meal: "Almuerzo", icon: "sunset", tags: ["P", "P", "G", "C", "V", "F"] },
        { meal: "Cena", icon: "moon", tags: ["P", "C", "G", "V", "F"] },
      ],
    },
  },
  tarde: {
    4: {
      M: [
        { meal: "Desayuno", icon: "sunrise", tags: ["P", "G", "F"] },
        { meal: "Almuerzo", icon: "sun", tags: ["P", "C", "V"] },
        { meal: "Merienda", icon: "sunset", tags: ["P", "F"] },
        { meal: "Cena", icon: "moon", tags: ["P", "C", "G", "V"] },
      ],
      H: [
        { meal: "Desayuno", icon: "sunrise", tags: ["P", "G", "F"] },
        { meal: "Almuerzo", icon: "sun", tags: ["P", "C", "G", "V"] },
        { meal: "Merienda", icon: "sunset", tags: ["P", "C", "F"] },
        { meal: "Cena", icon: "moon", tags: ["P", "C", "V"] },
      ],
    },
    3: {
      M: [
        { meal: "Desayuno", icon: "sunrise", tags: ["P", "G", "F"] },
        { meal: "Almuerzo", icon: "sun", tags: ["P", "C", "V", "F"] },
        { meal: "Cena", icon: "moon", tags: ["P", "P", "C", "G", "V"] },
      ],
      H: [
        { meal: "Desayuno", icon: "sunrise", tags: ["P", "G", "C"] },
        { meal: "Almuerzo", icon: "sun", tags: ["P", "C", "G", "V", "F"] },
        { meal: "Cena", icon: "moon", tags: ["P", "P", "C", "V", "F"] },
      ],
    },
  },
};

const MEAL_ICONS = { sunrise: Sunrise, sun: Sun, sunset: Sunset, moon: Moon };

/* ------------------------------ utilidades --------------------------- */

function pesoCategoria(peso) {
  if (peso < 60) return 0;
  if (peso <= 80) return 1;
  return 2;
}
function catLabel(cat) {
  return ["Menos de 60 kg", "Entre 60-80 kg", "Más de 80 kg"][cat];
}
function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tz * 60000);
  return local.toISOString().slice(0, 10);
}
function formatQty(food, cat) {
  if (!food) return "";
  if (food.unit === "racion") return food.q;
  if (food.unit === "ud") {
    const v = Array.isArray(food.q) ? food.q[cat] : food.q;
    return `${v} ud`;
  }
  const v = Array.isArray(food.q) ? food.q[cat] : food.q;
  return `${v} g`;
}

// Fórmula U.S. Navy (Hodgdon & Beckett) — requiere medidas en cm, convierte
// internamente a pulgadas porque la fórmula original está calibrada en inches.
function bodyFatNavy({ sexo, alturaCm, cuelloCm, cinturaCm, caderaCm }) {
  const cm2in = (v) => v / 2.54;
  const height = cm2in(alturaCm);
  const neck = cm2in(cuelloCm);
  const waist = cm2in(cinturaCm);
  if (!height || !neck || !waist) return null;
  if (sexo === "H") {
    if (waist - neck <= 0) return null;
    const bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    return Math.round(bf * 10) / 10;
  } else {
    const hip = cm2in(caderaCm);
    if (!hip || waist + hip - neck <= 0) return null;
    const bf = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    return Math.round(bf * 10) / 10;
  }
}

function bfCategory(sexo, bf) {
  if (bf == null) return null;
  const ranges =
    sexo === "H"
      ? [[0, 5, "Grasa esencial"], [6, 13, "Atlético"], [14, 17, "Forma física"], [18, 24, "Aceptable"], [25, 99, "Elevado"]]
      : [[0, 13, "Grasa esencial"], [14, 20, "Atlético"], [21, 24, "Forma física"], [25, 31, "Aceptable"], [32, 99, "Elevado"]];
  const found = ranges.find(([lo, hi]) => bf >= lo && bf <= hi);
  return found ? found[2] : null;
}

/* -------------------------- capa de almacenamiento -------------------- */

async function loadProfile(user) {
  try {
    const r = await window.storage.get(`profile-${user}`, false);
    if (r?.value) return JSON.parse(r.value);
  } catch (e) {}
  // fallback de migración: perfil antiguo sin usuario (solo para "yo")
  if (user === "yo") {
    try {
      const legacy = await window.storage.get("profile", false);
      if (legacy?.value) return JSON.parse(legacy.value);
    } catch (e) {}
  }
  return null;
}

async function saveProfileStorage(user, profile) {
  try {
    await window.storage.set(`profile-${user}`, JSON.stringify(profile), false);
  } catch (e) {}
}

async function loadLog(user, date) {
  try {
    const r = await window.storage.get(`log-${user}-${date}`, false);
    if (r?.value) return JSON.parse(r.value);
  } catch (e) {}
  if (user === "yo") {
    try {
      const legacy = await window.storage.get(`log-${date}`, false);
      if (legacy?.value) return JSON.parse(legacy.value);
    } catch (e) {}
  }
  return [];
}

async function saveLogStorage(user, date, entries) {
  try {
    await window.storage.set(`log-${user}-${date}`, JSON.stringify(entries), false);
  } catch (e) {}
}

async function saveMeasurementStorage(user, date, data) {
  try {
    await window.storage.set(`measure-${user}-${date}`, JSON.stringify(data), false);
  } catch (e) {}
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Exporta todo lo guardado (comidas + medidas, de ambos perfiles si existen)
// a un único CSV descargable — pensado para importar en Google Sheets
// (Archivo > Importar > Subir, en Sheets) ya que la app no puede
// autenticarse contra Google desde este entorno aislado.
async function exportAllDataCSV(date) {
  const rows = [
    ["tipo", "usuario", "fecha", "comida", "alimento", "bloques", "cantidad", "peso_kg", "cuello_cm", "cintura_cm", "cadera_cm", "grasa_corporal_pct"],
  ];
  for (const user of ["yo", "pareja"]) {
    try {
      const listRes = await window.storage.list(`log-${user}-`, false);
      for (const k of listRes?.keys || []) {
        const r = await window.storage.get(k, false);
        if (!r?.value) continue;
        const day = k.replace(`log-${user}-`, "");
        const entries = JSON.parse(r.value);
        entries.forEach((e) => {
          rows.push(["comida", user, day, e.meal, e.name, (e.tags || []).join("+"), e.qty, "", "", "", "", ""]);
        });
      }
    } catch (e) {}
    try {
      const listRes = await window.storage.list(`measure-${user}-`, false);
      for (const k of listRes?.keys || []) {
        const r = await window.storage.get(k, false);
        if (!r?.value) continue;
        const day = k.replace(`measure-${user}-`, "");
        const m = JSON.parse(r.value);
        rows.push(["medida", user, day, "", "", "", "", m.peso ?? "", m.cuello ?? "", m.cintura ?? "", m.cadera ?? "", m.bf ?? ""]);
      }
    } catch (e) {}
  }
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  downloadTextFile(`mi-dieta-export-${date}.csv`, csv);
}

async function loadMeasurementHistory(user, excludeDate) {
  try {
    const listRes = await window.storage.list(`measure-${user}-`, false);
    const keys = (listRes?.keys || [])
      .filter((k) => k !== `measure-${user}-${excludeDate}`)
      .sort()
      .reverse()
      .slice(0, 60);
    const days = [];
    for (const k of keys) {
      try {
        const r = await window.storage.get(k, false);
        if (!r?.value) continue;
        days.push({ date: k.replace(`measure-${user}-`, ""), ...JSON.parse(r.value) });
      } catch (e) {}
    }
    return days;
  } catch (e) {
    return [];
  }
}

/* ------------------------------ App -------------------------------- */

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [profiles, setProfiles] = useState({ yo: null, pareja: null });
  const [activeUser, setActiveUser] = useState("yo");
  const [tab, setTab] = useState("hoy");
  const [entries, setEntries] = useState([]);
  const [picker, setPicker] = useState(null);
  const [foodsTab, setFoodsTab] = useState("P");
  const [saveState, setSaveState] = useState("idle");
  const [history, setHistory] = useState(null);
  const [measurements, setMeasurements] = useState(null);
  const [exporting, setExporting] = useState(false);

  const date = todayISO();
  const profile = profiles[activeUser];
  const partner = activeUser === "yo" ? profiles.pareja : profiles.yo;

  // carga inicial de ambos perfiles + log del usuario activo
  useEffect(() => {
    (async () => {
      const [yo, pareja] = await Promise.all([loadProfile("yo"), loadProfile("pareja")]);
      setProfiles({ yo, pareja });
      const l = await loadLog("yo", date);
      setEntries(l);
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recarga el log al cambiar de usuario activo
  // (con guarda anti-carrera: si el usuario cambia de pestaña otra vez antes
  // de que termine esta carga, el resultado obsoleto se descarta en vez de
  // sobrescribir el estado — evita que los alimentos "desaparezcan")
  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    (async () => {
      const l = await loadLog(activeUser, date);
      if (!cancelled) setEntries(l);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUser, loaded]);

  const persistEntries = useCallback(
    async (next) => {
      setEntries(next);
      setSaveState("saving");
      await saveLogStorage(activeUser, date, next);
      setSaveState("saved");
    },
    [activeUser, date]
  );

  const saveProfile = useCallback(
    async (user, p) => {
      setProfiles((prev) => ({ ...prev, [user]: p }));
      await saveProfileStorage(user, p);
    },
    []
  );

  const cat = profile ? pesoCategoria(profile.peso) : 1;
  const sexKey = profile?.sexo === "H" ? "H" : "M";
  const targets = getTargets(sexKey, profile?.objetivo || "perder");
  const template = profile ? TEMPLATES[profile.momento][profile.comidas][sexKey] : null;

  const consumed = useMemo(() => {
    const c = { P: 0, G: 0, C: 0, F: 0, V: 0 };
    entries.forEach((e) => (e.tags || []).forEach((t) => { if (c[t] !== undefined) c[t] += 1; }));
    return c;
  }, [entries]);

  const loadHistory = useCallback(async () => {
    setHistory("loading");
    try {
      const listRes = await window.storage.list(`log-${activeUser}-`, false);
      const keys = (listRes?.keys || [])
        .filter((k) => k !== `log-${activeUser}-${date}`)
        .sort()
        .reverse()
        .slice(0, 14);
      const days = [];
      for (const k of keys) {
        try {
          const r = await window.storage.get(k, false);
          if (!r?.value) continue;
          const parsed = JSON.parse(r.value);
          const c = { P: 0, G: 0, C: 0, F: 0, V: 0 };
          parsed.forEach((e) => (e.tags || []).forEach((t) => { if (c[t] !== undefined) c[t] += 1; }));
          const totalTarget = Object.values(targets).reduce((a, b) => a + b, 0);
          const totalDone = Object.keys(targets).reduce((a, t) => a + Math.min(c[t] || 0, targets[t]), 0);
          days.push({ date: k.replace(`log-${activeUser}-`, ""), pct: Math.round((totalDone / totalTarget) * 100) });
        } catch (e) {}
      }
      setHistory(days);
    } catch (e) {
      setHistory([]);
    }
  }, [activeUser, date, targets]);

  const loadProgress = useCallback(async () => {
    setMeasurements("loading");
    const days = await loadMeasurementHistory(activeUser, date);
    setMeasurements(days);
  }, [activeUser, date]);

  async function addMeasurement(data) {
    await saveMeasurementStorage(activeUser, date, data);
    loadProgress();
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportAllDataCSV(date);
    } finally {
      setExporting(false);
    }
  }

  function addEntry(meal, food, isVeg) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      meal,
      name: food ? food.n : "Verdura",
      tags: isVeg ? ["V"] : food.tags,
      qty: isVeg ? "libre" : formatQty(food, cat),
    };
    persistEntries([...entries, entry]);
  }

  async function addEntryToPartner(meal, food, isVeg) {
    if (!partner) return;
    const partnerUser = activeUser === "yo" ? "pareja" : "yo";
    const partnerCat = pesoCategoria(partner.peso);
    const current = await loadLog(partnerUser, date);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-p`,
      meal,
      name: food ? food.n : "Verdura",
      tags: isVeg ? ["V"] : food.tags,
      qty: isVeg ? "libre" : formatQty(food, partnerCat),
    };
    await saveLogStorage(partnerUser, date, [...current, entry]);
  }

  function removeEntry(id) {
    persistEntries(entries.filter((e) => e.id !== id));
  }

  if (!loaded) {
    return (
      <div style={styles.appShell}>
        <div style={{ padding: 40, textAlign: "center", color: COLORS.mutedInk }}>Cargando…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Shell>
        <Onboarding onSave={(p) => saveProfile("yo", p)} />
      </Shell>
    );
  }

  return (
    <Shell>
      {profiles.pareja && (
        <UserSwitch
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          nombreYo={profiles.yo?.nombre || "Yo"}
          nombrePareja={profiles.pareja?.nombre || "Pareja"}
        />
      )}

      <Header profile={profile} date={date} />
      <BlockLedger targets={targets} consumed={consumed} objetivo={profile.objetivo} />

      <div style={styles.tabBar}>
        <TabButton active={tab === "hoy"} onClick={() => setTab("hoy")} icon={CalendarDays} label="Hoy" />
        <TabButton active={tab === "alimentos"} onClick={() => setTab("alimentos")} icon={Leaf} label="Alimentos" />
        <TabButton
          active={tab === "progreso"}
          onClick={() => { setTab("progreso"); if (measurements === null) loadProgress(); }}
          icon={TrendingUp}
          label="Progreso"
        />
        <TabButton
          active={tab === "historial"}
          onClick={() => { setTab("historial"); if (history === null) loadHistory(); }}
          icon={HistoryIcon}
          label="Historial"
        />
        <TabButton active={tab === "perfil"} onClick={() => setTab("perfil")} icon={User2} label="Perfil" />
      </div>

      {tab === "hoy" && (
        <Today
          template={template}
          entries={entries}
          cat={cat}
          onPick={(meal, tag) => setPicker({ meal, tag })}
          onRemove={removeEntry}
        />
      )}

      {tab === "alimentos" && <FoodBrowser cat={cat} foodsTab={foodsTab} setFoodsTab={setFoodsTab} />}

      {tab === "progreso" && (
        <Progress
          profile={profile}
          measurements={measurements}
          onAdd={addMeasurement}
          date={date}
        />
      )}

      {tab === "historial" && <HistoryView history={history} />}

      {tab === "perfil" && (
        <ProfileEditor
          profile={profile}
          onSave={(p) => saveProfile(activeUser, p)}
          partner={profiles.pareja}
          onSavePartner={(p) => saveProfile("pareja", p)}
          isPareja={activeUser === "pareja"}
          onExport={handleExport}
          exporting={exporting}
        />
      )}

      {picker && (
        <FoodPicker
          tag={picker.tag}
          meal={picker.meal}
          cat={cat}
          partner={partner}
          onClose={() => setPicker(null)}
          onSelect={async (food, isVeg, shareWithPartner) => {
            addEntry(picker.meal, food, isVeg);
            if (shareWithPartner) await addEntryToPartner(picker.meal, food, isVeg);
            setPicker(null);
          }}
        />
      )}
    </Shell>
  );
}

/* ---------------------------- estilos ------------------------------ */

const COLORS = {
  bg: "#F6F1E4",
  card: "#FFFDF8",
  border: "#E7DCC3",
  ink: "#2A231D",
  mutedInk: "#7A6E5E",
  accent: "#9C3B2E",
};

const styles = {
  appShell: {
    minHeight: "100vh",
    background: COLORS.bg,
    fontFamily: "'Manrope', ui-sans-serif, system-ui, -apple-system, sans-serif",
    color: COLORS.ink,
  },
  container: { maxWidth: 640, margin: "0 auto", padding: "20px 16px 80px" },
  tabBar: {
    display: "flex",
    gap: 4,
    background: "#EFE7D3",
    padding: 4,
    borderRadius: 14,
    marginBottom: 18,
    overflowX: "auto",
  },
};

function Shell({ children }) {
  return (
    <div style={styles.appShell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        input, select { font-family: inherit; }
        ::selection { background: #E3C9A8; }
      `}</style>
      <div style={styles.container}>{children}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: "1 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        padding: "10px 8px",
        borderRadius: 10,
        border: "none",
        background: active ? COLORS.card : "transparent",
        color: active ? COLORS.ink : COLORS.mutedInk,
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
        transition: "all .15s ease",
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function UserSwitch({ activeUser, setActiveUser, nombreYo, nombrePareja }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
      {[["yo", nombreYo], ["pareja", nombrePareja]].map(([v, label]) => (
        <button
          key={v}
          onClick={() => setActiveUser(v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: `1.5px solid ${activeUser === v ? COLORS.accent : COLORS.border}`,
            background: activeUser === v ? "#F3DEDA" : COLORS.card,
            color: activeUser === v ? COLORS.accent : COLORS.mutedInk,
            borderRadius: 999,
            padding: "6px 14px",
            fontWeight: 700,
            fontSize: 12.5,
          }}
        >
          <Users size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}

function Header({ profile, date }) {
  const d = new Date(date + "T00:00:00");
  const fmt = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 600, letterSpacing: -0.3, textTransform: "capitalize" }}>
        {fmt}
      </div>
      <div style={{ color: COLORS.mutedInk, fontSize: 13, marginTop: 2 }}>
        {profile.nombre ? `Hola, ${profile.nombre} · ` : ""}
        {catLabel(pesoCategoria(profile.peso))} · {profile.comidas} comidas · entreno por la{" "}
        {profile.momento === "manana" ? "mañana" : "tarde"} ·{" "}
        {OBJETIVOS[profile.objetivo || "perder"].label.toLowerCase()}
      </div>
    </div>
  );
}

/* ------------------------ Tarjeta de bloques ------------------------ */

function BlockLedger({ targets, consumed, objetivo }) {
  const order = ["P", "G", "C", "F", "V"];
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: "16px 16px 12px", marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: COLORS.mutedInk, marginBottom: 10 }}>
        Bloques de hoy
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {order.map((t) => {
          const total = targets[t];
          const done = consumed[t] || 0;
          const info = TAGS[t];
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 12, color: info.color }}>{t}</div>
              <div style={{ display: "flex", gap: 4, flex: "0 0 auto", flexWrap: "wrap" }}>
                {Array.from({ length: Math.max(total, done) }).map((_, i) => {
                  const filled = i < done;
                  const overflow = i >= total;
                  return (
                    <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: filled ? (overflow ? "#C0392B" : info.color) : info.soft, border: `1px solid ${filled ? "transparent" : COLORS.border}` }} />
                  );
                })}
              </div>
              <div style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.mutedInk }}>{done}/{total}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: COLORS.mutedInk, marginTop: 10 }}>
        La verdura no tiene límite de cantidad — el objetivo es solo de raciones al día.
        {objetivo && objetivo !== "perder" && " Bloques ajustados para " + OBJETIVOS[objetivo].label.toLowerCase() + "."}
      </div>
    </div>
  );
}

/* ------------------------------ Hoy -------------------------------- */

function Today({ template, entries, cat, onPick, onRemove }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {template.map((m) => {
        const Icon = MEAL_ICONS[m.icon] || Sun;
        const mealEntries = entries.filter((e) => e.meal === m.meal);
        const tagCounts = {};
        m.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1));
        return (
          <div key={m.meal} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={16} color={COLORS.accent} />
              <div style={{ fontWeight: 700, fontSize: 15 }}>{m.meal}</div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: mealEntries.length ? 10 : 0 }}>
              {Object.entries(tagCounts).map(([t, n]) => (
                <button
                  key={t}
                  onClick={() => onPick(m.meal, t)}
                  style={{ display: "flex", alignItems: "center", gap: 6, border: `1px dashed ${TAGS[t].color}`, background: TAGS[t].soft, color: TAGS[t].color, borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}
                >
                  <Plus size={12} />
                  {TAGS[t].label}
                  {n > 1 ? ` ×${n}` : ""}
                </button>
              ))}
            </div>

            {mealEntries.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {mealEntries.map((e) => (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.bg, borderRadius: 10, padding: "7px 10px" }}>
                    <div style={{ display: "flex", gap: 3 }}>
                      {e.tags.map((t, i) => (
                        <span key={i} style={{ width: 8, height: 8, borderRadius: 2, background: TAGS[t].color, display: "inline-block" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 13, flex: 1 }}>{e.name}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.mutedInk }}>{e.qty}</div>
                    <button onClick={() => onRemove(e.id)} style={{ border: "none", background: "none", color: COLORS.mutedInk, padding: 2 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------- FoodPicker ----------------------------- */

function FoodPicker({ tag, meal, cat, partner, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [showPlatos, setShowPlatos] = useState(false);
  const [share, setShare] = useState(false);
  const isVeg = tag === "V";
  const list = showPlatos ? PLATOS : isVeg ? [] : FOODS_BY_TAG[tag] || [];
  const filtered = list.filter((f) => f.n.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(42,35,29,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.card, width: "100%", maxWidth: 640, borderRadius: "20px 20px 0 0", maxHeight: "82vh", display: "flex", flexDirection: "column", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {isVeg ? "Verdura" : showPlatos ? "Platos compuestos" : `Añadir ${TAGS[tag].label.toLowerCase()}`}
            </div>
            <div style={{ fontSize: 12, color: COLORS.mutedInk }}>{meal}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", border: "none", background: "none" }}>
            <X size={20} color={COLORS.mutedInk} />
          </button>
        </div>

        {!isVeg && (
          <button
            onClick={() => setShowPlatos((s) => !s)}
            style={{ display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start", border: `1px solid ${COLORS.border}`, background: showPlatos ? "#F3DEDA" : COLORS.bg, color: showPlatos ? COLORS.accent : COLORS.mutedInk, borderRadius: 999, padding: "5px 11px", fontSize: 11.5, fontWeight: 700, marginBottom: 10 }}
          >
            <ChefHat size={12} />
            {showPlatos ? "Ver alimentos simples" : "Ver platos compuestos"}
          </button>
        )}

        {isVeg ? (
          <div>
            <div style={{ fontSize: 12, color: COLORS.mutedInk, marginBottom: 10 }}>
              Ración libre — sin restricción de cantidad. Elige cualquiera:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, overflowY: "auto" }}>
              {VEGETABLES.map((v) => (
                <button key={v} onClick={() => onSelect({ n: v }, true, share)} style={{ border: `1px solid ${COLORS.border}`, background: COLORS.bg, borderRadius: 10, padding: "6px 10px", fontSize: 13 }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <input autoFocus placeholder="Buscar alimento…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 14, marginBottom: 10, outline: "none" }} />
            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map((f) => (
                <button key={f.n} onClick={() => onSelect(f, false, share)} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${COLORS.border}`, background: COLORS.bg, borderRadius: 12, padding: "10px 12px", textAlign: "left" }}>
                  <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                    {f.tags.map((t, i) => (
                      <span key={i} style={{ width: 8, height: 8, borderRadius: 2, background: TAGS[t].color, display: "inline-block" }} />
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {f.n}
                      {f.custom && <span style={{ color: COLORS.mutedInk, fontWeight: 500, fontSize: 10.5 }}> · añadido</span>}
                    </div>
                    {f.note && <div style={{ fontSize: 11, color: COLORS.mutedInk }}>{f.note}</div>}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.accent, fontWeight: 600, flexShrink: 0 }}>
                    {formatQty(f, cat)}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div style={{ color: COLORS.mutedInk, fontSize: 13, padding: 12, textAlign: "center" }}>Sin resultados.</div>
              )}
            </div>
          </>
        )}

        {partner && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 12px", background: COLORS.bg, borderRadius: 12, fontSize: 12.5, color: COLORS.ink }}>
            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} />
            <Share2 size={14} color={COLORS.mutedInk} />
            Añadir también a {partner.nombre || "tu pareja"}, ajustado a su ración
          </label>
        )}
      </div>
    </div>
  );
}

/* --------------------------- FoodBrowser ---------------------------- */

function FoodBrowser({ cat, foodsTab, setFoodsTab }) {
  const tabs = [
    { key: "P", label: "Proteínas", list: PROTEINS },
    { key: "C", label: "Carbohidratos", list: CARBS },
    { key: "G", label: "Grasas", list: FATS },
    { key: "F", label: "Frutas", list: FRUITS },
    { key: "V", label: "Verduras", list: null },
    { key: "PL", label: "Platos", list: PLATOS },
  ];
  const current = tabs.find((t) => t.key === foodsTab);

  return (
    <div>
      <div style={{ fontSize: 12, color: COLORS.mutedInk, marginBottom: 10 }}>
        Cantidades para tu categoría: <strong style={{ color: COLORS.ink }}>{catLabel(cat)}</strong>
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14, paddingBottom: 4 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFoodsTab(t.key)}
            style={{ flex: "0 0 auto", border: `1px solid ${foodsTab === t.key ? (TAGS[t.key]?.color || COLORS.accent) : COLORS.border}`, background: foodsTab === t.key ? (TAGS[t.key]?.soft || "#F3DEDA") : COLORS.card, color: foodsTab === t.key ? (TAGS[t.key]?.color || COLORS.accent) : COLORS.mutedInk, borderRadius: 999, padding: "7px 13px", fontSize: 12.5, fontWeight: 700 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {foodsTab === "V" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {VEGETABLES.map((v) => (
            <div key={v} style={{ border: `1px solid ${COLORS.border}`, background: COLORS.card, borderRadius: 10, padding: "7px 11px", fontSize: 13 }}>{v}</div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {current.list.map((f) => (
            <div key={f.n} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${COLORS.border}`, background: COLORS.card, borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                {f.tags.map((t, i) => (
                  <span key={i} style={{ width: 8, height: 8, borderRadius: 2, background: TAGS[t].color, display: "inline-block" }} />
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {f.n}
                  {f.custom && <span style={{ color: COLORS.mutedInk, fontWeight: 500, fontSize: 10.5 }}> · añadido</span>}
                </div>
                {f.note && <div style={{ fontSize: 11, color: COLORS.mutedInk }}>{f.note}</div>}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.accent, fontWeight: 600, flexShrink: 0 }}>{formatQty(f, cat)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Progreso ------------------------------- */

function Progress({ profile, measurements, onAdd, date }) {
  const [peso, setPeso] = useState(profile.peso || "");
  const [cuello, setCuello] = useState("");
  const [cintura, setCintura] = useState("");
  const [cadera, setCadera] = useState("");
  const [flash, setFlash] = useState(false);

  const bf = bodyFatNavy({
    sexo: profile.sexo,
    alturaCm: profile.altura,
    cuelloCm: Number(cuello),
    cinturaCm: Number(cintura),
    caderaCm: Number(cadera),
  });
  const cat = bfCategory(profile.sexo, bf);

  function submit() {
    if (!peso) return;
    onAdd({
      peso: Number(peso),
      cuello: cuello ? Number(cuello) : null,
      cintura: cintura ? Number(cintura) : null,
      cadera: cadera ? Number(cadera) : null,
      bf,
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  }

  const list = Array.isArray(measurements) ? measurements : [];
  const withWeight = [...list, { date, peso: Number(peso) || null }]
    .filter((d) => d.peso)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      {!profile.altura && (
        <div style={{ background: "#F3DEDA", color: COLORS.accent, borderRadius: 12, padding: 12, fontSize: 12.5, marginBottom: 14 }}>
          Añade tu altura en Perfil para poder calcular el % de masa grasa.
        </div>
      )}

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Ruler size={16} color={COLORS.accent} /> Registrar medida de hoy
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <MiniField label="Peso (kg)">
            <input type="number" value={peso} onChange={(e) => setPeso(e.target.value)} style={inputStyle} />
          </MiniField>
          <MiniField label="Cuello (cm)">
            <input type="number" value={cuello} onChange={(e) => setCuello(e.target.value)} style={inputStyle} placeholder="opcional" />
          </MiniField>
          <MiniField label="Cintura (cm)">
            <input type="number" value={cintura} onChange={(e) => setCintura(e.target.value)} style={inputStyle} placeholder="opcional" />
          </MiniField>
          {profile.sexo === "M" && (
            <MiniField label="Cadera (cm)">
              <input type="number" value={cadera} onChange={(e) => setCadera(e.target.value)} style={inputStyle} placeholder="opcional" />
            </MiniField>
          )}
        </div>

        {bf != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.bg, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
            <Activity size={16} color={COLORS.accent} />
            <div style={{ fontSize: 13 }}>
              Estimación U.S. Navy: <strong>{bf}%</strong> de grasa corporal
              {cat && <span style={{ color: COLORS.mutedInk }}> · {cat}</span>}
            </div>
          </div>
        )}

        <button onClick={submit} style={primaryButtonStyle}>
          {flash ? <><Check size={16} /> Guardado</> : "Guardar medida de hoy"}
        </button>
        <div style={{ fontSize: 10.5, color: COLORS.mutedInk, marginTop: 8, lineHeight: 1.5 }}>
          Cuello: justo debajo de la nuez. Cintura: parte más estrecha por encima del ombligo.
          Cadera (mujeres): punto más ancho de los glúteos. El % de grasa es una estimación
          orientativa (fórmula U.S. Navy), no un diagnóstico médico.
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Evolución del peso</div>
      {withWeight.length < 2 ? (
        <div style={{ color: COLORS.mutedInk, fontSize: 13, padding: "8px 0 16px" }}>
          Registra al menos dos días para ver la tendencia aquí.
        </div>
      ) : (
        <WeightChart data={withWeight} />
      )}

      {list.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Historial de medidas</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {list.slice(0, 10).map((d) => (
              <div key={d.date} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 12px", fontSize: 12.5 }}>
                <div style={{ width: 78, color: COLORS.mutedInk }}>
                  {new Date(d.date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </div>
                <div style={{ flex: 1 }}>{d.peso} kg</div>
                {d.bf != null && <div style={{ color: COLORS.accent, fontWeight: 600 }}>{d.bf}% MG</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeightChart({ data }) {
  const w = 560, h = 120, pad = 24;
  const weights = data.map((d) => d.peso);
  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
  const x = (i) => pad + (i * (w - pad * 2)) / Math.max(data.length - 1, 1);
  const y = (v) => h - pad - ((v - min) * (h - pad * 2)) / Math.max(max - min, 0.1);
  const points = data.map((d, i) => `${x(i)},${y(d.peso)}`).join(" ");

  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 12 }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <polyline points={points} fill="none" stroke={COLORS.accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.peso)} r="3" fill={COLORS.accent} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.mutedInk, marginTop: 4 }}>
        <span>{new Date(data[0].date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
        <span>{new Date(data[data.length - 1].date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
      </div>
    </div>
  );
}

function MiniField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.mutedInk, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      {children}
    </div>
  );
}

/* --------------------------- HistoryView ----------------------------- */

function HistoryView({ history }) {
  if (history === null || history === "loading") {
    return <div style={{ color: COLORS.mutedInk, fontSize: 13, padding: 20, textAlign: "center" }}>Cargando historial…</div>;
  }
  if (history.length === 0) {
    return <div style={{ color: COLORS.mutedInk, fontSize: 13, padding: 20, textAlign: "center" }}>Todavía no hay días anteriores registrados. Vuelve mañana para ver tu progreso aquí.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, color: COLORS.mutedInk, marginBottom: 4 }}>
        Últimos {history.length} días con registro. El % refleja cuántos de tus bloques objetivo (P/G/C/F/V) completaste, sin contar excesos.
      </div>
      {history.map((d) => {
        const dt = new Date(d.date + "T00:00:00");
        const label = dt.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
        const barColor = d.pct >= 90 ? "#4C7A52" : d.pct >= 60 ? "#C79A2A" : "#9C3B2E";
        return (
          <div key={d.date} style={{ display: "flex", alignItems: "center", gap: 12, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ width: 78, fontSize: 12.5, textTransform: "capitalize", color: COLORS.ink }}>{label}</div>
            <div style={{ flex: 1, height: 8, background: COLORS.bg, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(d.pct, 100)}%`, height: "100%", background: barColor }} />
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, fontWeight: 600, color: barColor, width: 40, textAlign: "right" }}>{d.pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------- Onboarding ------------------------------ */

function Onboarding({ onSave }) {
  const [sexo, setSexo] = useState("M");
  const [peso, setPeso] = useState(70);
  const [altura, setAltura] = useState(165);
  const [comidas, setComidas] = useState(4);
  const [momento, setMomento] = useState("manana");
  const [objetivo, setObjetivo] = useState("perder");
  const [nombre, setNombre] = useState("");

  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 30, fontWeight: 600, marginBottom: 4 }}>Construye tu dieta</div>
      <div style={{ color: COLORS.mutedInk, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
        Basado en el sistema de bloques de <em>Quema tu dieta</em> (Ismael Galancho). Responde esto una vez — podrás cambiarlo luego en Perfil.
      </div>

      <Field label="Tu nombre (opcional)">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Fabien" style={inputStyle} />
      </Field>

      <Field label="Sexo">
        <div style={{ display: "flex", gap: 8 }}>
          {[["M", "Mujer"], ["H", "Hombre"]].map(([v, l]) => (
            <ChoiceButton key={v} active={sexo === v} onClick={() => setSexo(v)} label={l} />
          ))}
        </div>
      </Field>

      <Field label="Peso corporal actual (kg)">
        <input type="number" value={peso} onChange={(e) => setPeso(Number(e.target.value))} style={inputStyle} />
        <div style={{ fontSize: 12, color: COLORS.mutedInk, marginTop: 4 }}>Categoría: {catLabel(pesoCategoria(peso))}</div>
      </Field>

      <Field label="Altura (cm) — para estimar tu % de grasa corporal">
        <input type="number" value={altura} onChange={(e) => setAltura(Number(e.target.value))} style={inputStyle} />
      </Field>

      <Field label="Objetivo">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(OBJETIVOS).map(([k, v]) => (
            <ChoiceButton key={k} active={objetivo === k} onClick={() => setObjetivo(k)} label={v.label} />
          ))}
        </div>
      </Field>

      <Field label="Comidas al día">
        <div style={{ display: "flex", gap: 8 }}>
          {[3, 4].map((n) => (
            <ChoiceButton key={n} active={comidas === n} onClick={() => setComidas(n)} label={`${n} comidas`} />
          ))}
        </div>
      </Field>

      <Field label="¿Cuándo entrenas / haces actividad física?">
        <div style={{ display: "flex", gap: 8 }}>
          <ChoiceButton active={momento === "manana"} onClick={() => setMomento("manana")} label="Mañana" />
          <ChoiceButton active={momento === "tarde"} onClick={() => setMomento("tarde")} label="Tarde" />
        </div>
      </Field>

      <button onClick={() => onSave({ sexo, peso, altura, comidas, momento, objetivo, nombre })} style={primaryButtonStyle}>
        Crear mi dieta <ChevronRight size={16} />
      </button>
    </div>
  );
}

function ProfileEditor({ profile, onSave, partner, onSavePartner, isPareja, onExport, exporting }) {
  const [sexo, setSexo] = useState(profile.sexo);
  const [peso, setPeso] = useState(profile.peso);
  const [altura, setAltura] = useState(profile.altura || "");
  const [comidas, setComidas] = useState(profile.comidas);
  const [momento, setMomento] = useState(profile.momento);
  const [objetivo, setObjetivo] = useState(profile.objetivo || "perder");
  const [nombre, setNombre] = useState(profile.nombre || "");
  const [savedFlash, setSavedFlash] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);

  function save() {
    onSave({ sexo, peso, altura: Number(altura) || null, comidas, momento, objetivo, nombre });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  return (
    <div>
      <Field label="Tu nombre">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Sexo">
        <div style={{ display: "flex", gap: 8 }}>
          {[["M", "Mujer"], ["H", "Hombre"]].map(([v, l]) => (
            <ChoiceButton key={v} active={sexo === v} onClick={() => setSexo(v)} label={l} />
          ))}
        </div>
      </Field>
      <Field label="Peso corporal (kg)">
        <input type="number" value={peso} onChange={(e) => setPeso(Number(e.target.value))} style={inputStyle} />
        <div style={{ fontSize: 12, color: COLORS.mutedInk, marginTop: 4 }}>
          Categoría: {catLabel(pesoCategoria(peso))} — actualízalo cada vez que cambie tu rango de peso.
        </div>
      </Field>
      <Field label="Altura (cm)">
        <input type="number" value={altura} onChange={(e) => setAltura(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Objetivo">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(OBJETIVOS).map(([k, v]) => (
            <ChoiceButton key={k} active={objetivo === k} onClick={() => setObjetivo(k)} label={v.label} />
          ))}
        </div>
      </Field>
      <Field label="Comidas al día">
        <div style={{ display: "flex", gap: 8 }}>
          {[3, 4].map((n) => (
            <ChoiceButton key={n} active={comidas === n} onClick={() => setComidas(n)} label={`${n} comidas`} />
          ))}
        </div>
      </Field>
      <Field label="Entrenas por la…">
        <div style={{ display: "flex", gap: 8 }}>
          <ChoiceButton active={momento === "manana"} onClick={() => setMomento("manana")} label="Mañana" />
          <ChoiceButton active={momento === "tarde"} onClick={() => setMomento("tarde")} label="Tarde" />
        </div>
      </Field>
      <button onClick={save} style={primaryButtonStyle}>
        {savedFlash ? <><Check size={16} /> Guardado</> : "Guardar cambios"}
      </button>

      {!isPareja && (
        <div style={{ marginTop: 22 }}>
          {!partner && !showAddPartner && (
            <button onClick={() => setShowAddPartner(true)} style={{ ...primaryButtonStyle, background: COLORS.card, color: COLORS.accent, border: `1.5px solid ${COLORS.accent}` }}>
              <UserPlus size={16} /> Añadir pareja
            </button>
          )}
          {partner && (
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14, fontSize: 13, color: COLORS.mutedInk }}>
              Pareja configurada: <strong style={{ color: COLORS.ink }}>{partner.nombre || "Pareja"}</strong>.
              Cambia de perfil con el selector de arriba para editar sus datos.
            </div>
          )}
          {showAddPartner && !partner && (
            <PartnerForm onSave={(p) => { onSavePartner(p); setShowAddPartner(false); }} onCancel={() => setShowAddPartner(false)} />
          )}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.mutedInk, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>
          Copia de seguridad
        </div>
        <button
          onClick={onExport}
          disabled={exporting}
          style={{ ...primaryButtonStyle, background: COLORS.card, color: COLORS.accent, border: `1.5px solid ${COLORS.accent}`, opacity: exporting ? 0.6 : 1 }}
        >
          {exporting ? "Preparando archivo…" : "Exportar todo a CSV"}
        </button>
        <div style={{ fontSize: 11.5, color: COLORS.mutedInk, marginTop: 8, lineHeight: 1.55 }}>
          Descarga un .csv con todas las comidas y medidas guardadas (tuyas y de tu
          pareja si la tienes). Para verlo en Google Sheets: abre sheets.google.com →
          Archivo → Importar → Subir → selecciona el archivo descargado → "Crear
          nueva hoja de cálculo". La app no puede escribir directamente en Google
          Sheets porque se ejecuta de forma aislada, sin acceso a tu cuenta de Google.
        </div>
      </div>

      <div style={{ marginTop: 18, padding: 14, background: "#EFE7D3", borderRadius: 14, fontSize: 12.5, color: COLORS.mutedInk, lineHeight: 1.6 }}>
        <Info size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
        Recordatorios del libro: bebe entre 1,5-3 L de agua al día, máx. 3 cafés, prioriza cocinados sin fritura, y una comida libre semanal como máximo si el objetivo es perder grasa.
      </div>
    </div>
  );
}

function PartnerForm({ onSave, onCancel }) {
  const [sexo, setSexo] = useState("H");
  const [peso, setPeso] = useState(75);
  const [altura, setAltura] = useState(175);
  const [comidas, setComidas] = useState(4);
  const [momento, setMomento] = useState("manana");
  const [objetivo, setObjetivo] = useState("perder");
  const [nombre, setNombre] = useState("");

  return (
    <div style={{ marginTop: 12, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14 }}>
      <Field label="Nombre de tu pareja">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Sexo">
        <div style={{ display: "flex", gap: 8 }}>
          {[["M", "Mujer"], ["H", "Hombre"]].map(([v, l]) => (
            <ChoiceButton key={v} active={sexo === v} onClick={() => setSexo(v)} label={l} />
          ))}
        </div>
      </Field>
      <Field label="Peso (kg)">
        <input type="number" value={peso} onChange={(e) => setPeso(Number(e.target.value))} style={inputStyle} />
      </Field>
      <Field label="Altura (cm)">
        <input type="number" value={altura} onChange={(e) => setAltura(Number(e.target.value))} style={inputStyle} />
      </Field>
      <Field label="Objetivo">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(OBJETIVOS).map(([k, v]) => (
            <ChoiceButton key={k} active={objetivo === k} onClick={() => setObjetivo(k)} label={v.label} />
          ))}
        </div>
      </Field>
      <Field label="Comidas al día">
        <div style={{ display: "flex", gap: 8 }}>
          {[3, 4].map((n) => (
            <ChoiceButton key={n} active={comidas === n} onClick={() => setComidas(n)} label={`${n} comidas`} />
          ))}
        </div>
      </Field>
      <Field label="Entrena por la…">
        <div style={{ display: "flex", gap: 8 }}>
          <ChoiceButton active={momento === "manana"} onClick={() => setMomento("manana")} label="Mañana" />
          <ChoiceButton active={momento === "tarde"} onClick={() => setMomento("tarde")} label="Tarde" />
        </div>
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ ...primaryButtonStyle, background: COLORS.bg, color: COLORS.mutedInk }}>Cancelar</button>
        <button onClick={() => onSave({ sexo, peso, altura, comidas, momento, objetivo, nombre })} style={primaryButtonStyle}>Guardar pareja</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.mutedInk, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
      {children}
    </div>
  );
}

function ChoiceButton({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${active ? COLORS.accent : COLORS.border}`, background: active ? "#F3DEDA" : COLORS.card, color: active ? COLORS.accent : COLORS.ink, fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

const inputStyle = { width: "100%", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", background: COLORS.card };

const primaryButtonStyle = { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.accent, color: "#FBF3EC", border: "none", borderRadius: 12, padding: "13px 16px", fontWeight: 700, fontSize: 15, marginTop: 6 };
