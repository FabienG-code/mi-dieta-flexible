// Reimplementa la misma interfaz que window.storage ofrece dentro de un
// artefacto de Claude (get/set/delete/list), pero respaldada por nuestra
// propia API en /api/kv (que a su vez habla con una base de datos Redis
// conectada al proyecto de Vercel). Así, todo el código de la app que ya
// usa `await window.storage.get(...)` funciona sin cambios, tanto dentro
// de Claude como desplegado de forma independiente.
//
// Al no depender de qué navegador o dispositivo la abre, los datos quedan
// compartidos entre todos los dispositivos que visiten esta misma URL.

async function apiGet(params) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`/api/kv?${qs}`);
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.error || `storage error (${r.status})`);
  }
  return r.json();
}

async function apiPost(body) {
  const r = await fetch("/api/kv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const b = await r.json().catch(() => ({}));
    throw new Error(b.error || `storage error (${r.status})`);
  }
  return r.json();
}

function install() {
  if (typeof window === "undefined" || window.storage) return;
  window.storage = {
    async get(key) {
      const data = await apiGet({ op: "get", key });
      if (data.value == null) return null;
      return { key, value: data.value };
    },
    async set(key, value) {
      await apiPost({ op: "set", key, value });
      return { key, value };
    },
    async delete(key) {
      await apiPost({ op: "delete", key });
      return { key, deleted: true };
    },
    async list(prefix) {
      const data = await apiGet({ op: "list", prefix: prefix || "" });
      return { keys: data.keys || [] };
    },
  };
}

install();

export default install;
