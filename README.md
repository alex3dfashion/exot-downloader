# EXOT Downloader 🎬

Herramienta sencilla para descargar **tu propio contenido de YouTube** (o contenido con
permiso de descarga) en **MP4, MP3 o WAV**. Se ejecuta **en tu propio ordenador**: sin
anuncios, sin pop-ups y sin enviar nada a terceros.

> ⚠️ **Uso responsable:** úsala solo con contenido tuyo o que tengas permiso para descargar.
> Respeta los derechos de autor y los Términos de Servicio de YouTube.

---

## ⭐ Lo más fácil (Windows) — Instalador en 2 clics

**[⬇️ Descargar el instalador (EXOT-Downloader-Instalar.exe)](https://github.com/alex3dfashion/exot-downloader/releases/latest/download/EXOT-Downloader-Instalar.exe)**

1. Descarga y haz doble clic en el archivo.
2. Si sale "Windows protegió su PC": **"Más información" → "Ejecutar de todas formas"** (solo la 1ª vez).
3. Pulsa **Instalar**. Se crea un acceso directo en el Escritorio y se abre solo.

Node va incluido, no pide administrador, y después abres siempre desde el acceso directo **sin más avisos**.

---

## 🌐 Opción alternativa — Versión web (un enlace, sin instalar nada)

Desplegada en la nube: se abre con un enlace en cualquier dispositivo, sin descargas ni avisos.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/alex3dfashion/exot-downloader)

> ⚠️ **Aviso de fiabilidad:** YouTube bloquea con frecuencia las descargas hechas desde
> servidores en la nube (pide "confirmar que no eres un bot"). La web abrirá siempre, pero
> **algunas descargas pueden fallar**. Para uso fiable, usa la versión de escritorio de abajo.

---

## ⬇️ Opción 1 — Fácil (Windows, sin instalar nada)

Pensada para cualquiera, aunque no sepa de programación.

1. Ve a la sección **[Releases](../../releases)** y descarga el archivo
   **`EXOT-Downloader-FACIL.zip`**.
2. Clic derecho en el ZIP → **"Extraer todo"**.
3. Entra en la carpeta y haz **doble clic en `EXOT-Downloader.exe`**.
4. Se abre solo en tu navegador. ¡Listo!

> 💡 La primera vez Windows puede mostrar **"Windows protegió tu PC" (SmartScreen)**.
> Es normal en programas nuevos sin firma. Pulsa **"Más información" → "Ejecutar de todas formas"**.
>
> Requiere Windows de 64 bits. (Node.js ya va incluido dentro del paquete.)

---

## 🧑‍💻 Opción 2 — Para desarrolladores (cualquier sistema)

Requiere [Node.js](https://nodejs.org) 18 o superior.

```bash
git clone https://github.com/alex3dfashion/exot-downloader.git
cd exot-downloader
npm install
npm start
```

Luego abre **http://localhost:3000** en el navegador.
`yt-dlp` y `ffmpeg` se incluyen automáticamente como dependencias; no hace falta instalarlos.

En Windows también puedes hacer doble clic en **`INICIAR.bat`** (comprueba Node, instala
dependencias la primera vez y arranca el servidor).

---

## 🎵 Formatos

| Formato | Qué descarga                              |
|---------|-------------------------------------------|
| **MP4** | Vídeo (imagen + audio)                    |
| **MP3** | Solo audio (comprimido)                   |
| **WAV** | Solo audio (alta calidad, sin comprimir)  |

---

## 🛠️ Cómo está hecho

- **Frontend:** HTML + CSS + JavaScript (sin librerías externas).
- **Backend:** Node.js + Express.
- **Motor de descarga:** [yt-dlp](https://github.com/yt-dlp/yt-dlp) + [ffmpeg](https://ffmpeg.org).
- **Lanzador Windows:** pequeño `.exe` compilado desde [`launcher/Launcher.cs`](launcher/Launcher.cs)
  que arranca el Node incluido y abre el navegador.

```
exot-downloader/
├── server.js          ← backend
├── package.json
├── INICIAR.bat        ← arranque de doble clic (requiere Node instalado)
├── launcher/
│   └── Launcher.cs    ← código del lanzador .exe del paquete "FÁCIL"
└── public/
    ├── index.html     ← interfaz
    ├── style.css
    └── script.js
```

---

## 🔒 Si las descargas fallan en la nube (solución con cookies)

En la nube, YouTube suele bloquear las descargas ("confirma que no eres un bot").
El método fiable es darle al servidor unas **cookies** de una sesión de YouTube:

1. En tu navegador (con sesión de YouTube iniciada), instala una extensión tipo
   **"Get cookies.txt LOCALLY"** y exporta `cookies.txt` desde youtube.com.
2. Conviértelo a base64. En **PowerShell (Windows)**:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("cookies.txt")) | Set-Clipboard
   ```
   (queda copiado en el portapapeles).
3. En **Render → tu servicio → Environment** añade una variable:
   - **Key:** `COOKIES_B64`
   - **Value:** *(pega el texto base64)*
4. Guarda; Render volverá a desplegar y las descargas deberían funcionar.

> ⚠️ Usa una cuenta de Google **secundaria/desechable**: las cookies de un servidor
> público pueden hacer que YouTube limite o bloquee esa cuenta. Las cookies además
> **caducan** cada cierto tiempo y hay que renovarlas. Por eso, para uso serio, la
> **versión de escritorio** sigue siendo la más fiable.

---

## 📄 Licencia

[MIT](LICENSE) — © 2026 alex3dfashion. Software ofrecido "tal cual", sin garantías.
El uso del contenido descargado es responsabilidad de quien lo utiliza.
