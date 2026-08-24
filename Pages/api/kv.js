import { Redis } from "@upstash/redis";

// Acepta cualquiera de los dos juegos de nombres de variables de entorno
// que Vercel puede inyectar según cómo conectes la base de datos:
//  - KV_REST_API_URL / KV_REST_API_TOKEN (integraciones estilo "KV" antiguas)
//  - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (Marketplace: Upstash)
function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  // automaticDeserialization:false -> nos devuelve siempre el string tal cual
  // lo guardamos, sin intentar parsear JSON por su cuenta.
  return new Redis({ url, token, automaticDeserialization: false });
}

function toStringOrNull(v) {
  if (v == null) return null;
  return typeof v === "string" ? v : JSON.stringify(v);
}

export default async function handler(req, res) {
  const redis = getRedis();
  if (!redis) {
    return res.status(500).json({
      error:
        "No hay base de datos conectada todavía. En el panel de Vercel: " +
        "Storage → Marketplace Database Integrations → Upstash (Redis) → " +
        "conectar a este proyecto, y vuelve a desplegar.",
    });
  }

  try {
    if (req.method === "GET") {
      const { op, key, prefix } = req.query;

      if (op === "get") {
        if (!key) return res.status(400).json({ error: "falta key" });
        const value = await redis.get(key);
        return res.status(200).json({ value: toStringOrNull(value) });
      }

      if (op === "list") {
        const keys = [];
        let cursor = "0";
        do {
          const [nextCursor, batch] = await redis.scan(cursor, {
            match: `${prefix || ""}*`,
            count: 200,
          });
          keys.push(...batch);
          cursor = nextCursor;
        } while (cursor !== "0");
        return res.status(200).json({ keys });
      }

      return res.status(400).json({ error: "op desconocida" });
    }

    if (req.method === "POST") {
      const { op, key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: "falta key" });

      if (op === "set") {
        await redis.set(key, value);
        return res.status(200).json({ ok: true });
      }
      if (op === "delete") {
        await redis.del(key);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: "op desconocida" });
    }

    return res.status(405).json({ error: "método no permitido" });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
