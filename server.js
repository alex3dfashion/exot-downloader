/* ===========================================================
   EXOT Downloader · Backend (Node + yt-dlp + ffmpeg)
   -----------------------------------------------------------
   Servidor mínimo que:
     1. Sirve la web (carpeta /public)
     2. Expone POST /api/download  { url, format }
     3. Descarga con yt-dlp y convierte con ffmpeg
     4. Devuelve el archivo al navegador

   Uso responsable: solo para contenido propio o con permiso
   de descarga. Respeta los derechos de autor.
   =========================================================== */

import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import youtubedl from "youtube-dl-exec";
import ffmpegPath from "ffmpeg-static";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Marcador de version para saber que despliegue esta activo (diagnostico temporal).
app.get("/api/version", (req, res) => res.json({ version: "debug-2" }));

// Carpeta temporal donde se generan los archivos antes de enviarlos
const TMP_DIR = path.join(os.tmpdir(), "exot-downloader");
fs.mkdirSync(TMP_DIR, { recursive: true });

// Cookies opcionales para evitar el bloqueo anti-bot de YouTube cuando la app
// corre en un servidor. En Render: crea la variable de entorno COOKIES_B64 con
// el contenido de un cookies.txt (de una sesion de YouTube) codificado en base64.
let COOKIES_PATH = null;
if (process.env.COOKIES_B64) {
  try {
    COOKIES_PATH = path.join(TMP_DIR, "cookies.txt");
    fs.writeFileSync(COOKIES_PATH, Buffer.from(process.env.COOKIES_B64, "base64"));
    console.log("  🍪 Cookies cargadas desde COOKIES_B64.");
  } catch (e) {
    console.error("No se pudieron cargar las cookies:", e.message);
    COOKIES_PATH = null;
  }
}

// Opciones comunes para yt-dlp: prueba varios "clientes" de YouTube (las apps de
// movil/TV suelen estar menos bloqueadas desde la nube que el cliente web).
function baseOptions() {
  const o = {
    ffmpegLocation: ffmpegPath,
    noPlaylist: true,
    extractorArgs: "youtube:player_client=android,ios,tv,web"
  };
  if (COOKIES_PATH) o.cookies = COOKIES_PATH;
  return o;
}

// Validación básica de enlace de YouTube (también se valida en el frontend)
function isValidYouTubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{11}/i.test(url);
}

/* -----------------------------------------------------------
   POST /api/download
   body: { url, format: "mp4" | "mp3" | "wav" }
   Responde con el archivo (attachment) para que el navegador
   lo descargue directamente.
----------------------------------------------------------- */
app.post("/api/download", async (req, res) => {
  const { url, format } = req.body || {};

  // Validaciones
  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).json({ error: "Enlace de YouTube no válido." });
  }
  if (!["mp4", "mp3", "wav"].includes(format)) {
    return res.status(400).json({ error: "Formato no válido." });
  }

  const id = crypto.randomBytes(6).toString("hex");
  const outBase = path.join(TMP_DIR, id);

  try {
    let finalPath;

    if (format === "mp4") {
      // Vídeo: mejor calidad de vídeo + audio combinados en MP4
      finalPath = `${outBase}.mp4`;
      await youtubedl(url, {
        ...baseOptions(),
        output: finalPath,
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        mergeOutputFormat: "mp4"
      });
    } else {
      // Audio: extraer y convertir a mp3 o wav
      finalPath = `${outBase}.${format}`;
      await youtubedl(url, {
        ...baseOptions(),
        output: `${outBase}.%(ext)s`,
        extractAudio: true,
        audioFormat: format,          // "mp3" o "wav"
        audioQuality: 0               // mejor calidad
      });
    }

    // Comprobar que el archivo existe
    if (!fs.existsSync(finalPath)) {
      throw new Error("No se generó el archivo de salida.");
    }

    // Enviar el archivo y borrarlo después
    res.download(finalPath, `exot-download.${format}`, (err) => {
      fs.unlink(finalPath, () => {});
      if (err) console.error("Error enviando el archivo:", err.message);
    });
  } catch (err) {
    const detail = (err.stderr || err.message || "").toString();
    console.error("Error procesando la descarga:", detail);
    // Limpieza de posibles restos
    ["mp4", "mp3", "wav", "m4a", "webm"].forEach((ext) => {
      fs.unlink(`${outBase}.${ext}`, () => {});
    });
    let userMsg = "No se pudo procesar el enlace.";
    if (/sign in to confirm|not a bot|confirm.+bot|cookies/i.test(detail)) {
      userMsg = "YouTube ha bloqueado la descarga desde el servidor (protección anti-bot). " +
                "Usa la versión de escritorio, o configura cookies en el servidor (ver README).";
    }
    res.status(500).json({ error: userMsg, detail: detail.slice(0, 900) });
  }
});

app.listen(PORT, () => {
  console.log(`\n  ✅ EXOT Downloader funcionando`);
  console.log(`  → Abre en el navegador:  http://localhost:${PORT}\n`);
});
