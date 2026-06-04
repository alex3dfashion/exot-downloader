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

// Carpeta temporal donde se generan los archivos antes de enviarlos
const TMP_DIR = path.join(os.tmpdir(), "exot-downloader");
fs.mkdirSync(TMP_DIR, { recursive: true });

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
        output: finalPath,
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        mergeOutputFormat: "mp4",
        ffmpegLocation: ffmpegPath,
        noPlaylist: true
      });
    } else {
      // Audio: extraer y convertir a mp3 o wav
      finalPath = `${outBase}.${format}`;
      await youtubedl(url, {
        output: `${outBase}.%(ext)s`,
        extractAudio: true,
        audioFormat: format,          // "mp3" o "wav"
        audioQuality: 0,              // mejor calidad
        ffmpegLocation: ffmpegPath,
        noPlaylist: true
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
    console.error("Error procesando la descarga:", err.message);
    // Limpieza de posibles restos
    ["mp4", "mp3", "wav", "m4a", "webm"].forEach((ext) => {
      fs.unlink(`${outBase}.${ext}`, () => {});
    });
    res.status(500).json({ error: "No se pudo procesar el enlace." });
  }
});

app.listen(PORT, () => {
  console.log(`\n  ✅ EXOT Downloader funcionando`);
  console.log(`  → Abre en el navegador:  http://localhost:${PORT}\n`);
});
