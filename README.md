# EXOT Downloader 🎬

Herramienta sencilla para descargar **tu propio contenido de YouTube** (o contenido con
permiso de descarga) en **MP4, MP3 o WAV**. Se ejecuta **en tu propio ordenador**: sin
anuncios, sin pop-ups y sin enviar nada a terceros.

> ⚠️ **Uso responsable:** úsala solo con contenido tuyo o que tengas permiso para descargar.
> Respeta los derechos de autor y los Términos de Servicio de YouTube.

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

## 📄 Licencia

[MIT](LICENSE) — © 2026 alex3dfashion. Software ofrecido "tal cual", sin garantías.
El uso del contenido descargado es responsabilidad de quien lo utiliza.
