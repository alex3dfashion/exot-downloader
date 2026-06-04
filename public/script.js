/* ===========================================================
   EXOT Downloader · Lógica del frontend
   -----------------------------------------------------------
   Este archivo gestiona:
     - Validación del enlace de YouTube
     - Selección de formato (MP4 / MP3 / WAV)
     - Mensajes de estado
     - El PUNTO DE CONEXIÓN con tu backend/API real
   =========================================================== */

// --- Referencias del DOM ---
const urlInput    = document.getElementById("urlInput");
const formatBtns  = document.querySelectorAll(".format");
const downloadBtn = document.getElementById("downloadBtn");
const statusEl    = document.getElementById("status");

// Formato actualmente seleccionado (null hasta que el usuario elija)
let selectedFormat = null;

/* -----------------------------------------------------------
   Validación de enlaces de YouTube
   Acepta: youtube.com/watch?v=, youtu.be/, /shorts/, /embed/
----------------------------------------------------------- */
function isValidYouTubeUrl(url) {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{11}/i;
  return pattern.test(url.trim());
}

/* -----------------------------------------------------------
   Mensajes de estado
   tipo: "info" | "error" | "success"
----------------------------------------------------------- */
function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = "status is-visible is-" + type;
}

function clearStatus() {
  statusEl.className = "status";
}

/* -----------------------------------------------------------
   Selección de formato
----------------------------------------------------------- */
formatBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    formatBtns.forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-checked", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-checked", "true");
    selectedFormat = btn.dataset.format; // "mp4" | "mp3" | "wav"
    clearStatus();
  });
});

/* -----------------------------------------------------------
   Estado de carga del botón principal
----------------------------------------------------------- */
function setLoading(isLoading) {
  downloadBtn.classList.toggle("is-loading", isLoading);
  downloadBtn.disabled = isLoading;
  downloadBtn.querySelector(".btn-primary__label").textContent =
    isLoading ? "Procesando…" : "Preparar descarga";
}

/* -----------------------------------------------------------
   Acción principal: validar + llamar al backend
----------------------------------------------------------- */
downloadBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();

  // 1) Campo vacío
  if (!url) {
    setStatus("Pega un enlace de YouTube para continuar.", "error");
    urlInput.focus();
    return;
  }

  // 2) Formato de enlace
  if (!isValidYouTubeUrl(url)) {
    setStatus("Enlace no válido. Revisa que sea un enlace de YouTube.", "error");
    return;
  }

  // 3) Formato no seleccionado
  if (!selectedFormat) {
    setStatus("Selecciona un formato (MP4, MP3 o WAV).", "info");
    return;
  }

  // 4) Procesar
  setLoading(true);
  setStatus("Procesando enlace… (puede tardar según el vídeo)", "info");

  try {
    await requestDownload(url, selectedFormat);
    setStatus("Descarga preparada ✓", "success");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "No se pudo procesar el enlace. Inténtalo de nuevo.", "error");
  } finally {
    setLoading(false);
  }
});

/* ===========================================================
   👉 CONEXIÓN CON EL BACKEND REAL (server.js)
   -----------------------------------------------------------
   Llama a POST /api/download con { url, format }.
   El servidor (Node + yt-dlp + ffmpeg) descarga/convierte el
   contenido y devuelve el ARCHIVO directamente (como blob),
   que aquí guardamos en el equipo del usuario.

   - MP4  -> el backend descarga el vídeo (video + audio).
   - MP3  -> el backend extrae el audio y lo convierte a MP3.
   - WAV  -> el backend extrae el audio y lo convierte a WAV.
=========================================================== */
async function requestDownload(url, format) {
  const response = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, format })
  });

  // Si hay error, el backend responde JSON con { error }
  if (!response.ok) {
    let msg = "No se pudo procesar el enlace.";
    try {
      const data = await response.json();
      if (data && data.error) msg = data.error;
    } catch (_) {}
    throw new Error(msg);
  }

  // El backend devuelve el archivo binario -> lo descargamos
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  triggerBrowserDownload(objectUrl, `exot-download.${format}`);
  URL.revokeObjectURL(objectUrl);
}

/* -----------------------------------------------------------
   Dispara la descarga del archivo en el navegador.
----------------------------------------------------------- */
function triggerBrowserDownload(fileUrl, filename) {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = filename || "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* -----------------------------------------------------------
   Limpiar mensaje de error al volver a escribir
----------------------------------------------------------- */
urlInput.addEventListener("input", () => {
  if (statusEl.classList.contains("is-error")) clearStatus();
});
