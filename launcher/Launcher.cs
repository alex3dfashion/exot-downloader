// Lanzador de EXOT Downloader para Windows.
// Compila a EXOT-Downloader.exe: arranca el Node incluido (node\node.exe),
// espera a que el servidor escuche en el puerto 3000 y abre el navegador.
// Un .exe siempre se ejecuta al doble clic (no se abre en un editor como pasaria con un .bat).
//
// Compilar (sin instalar nada extra, con el compilador de .NET de Windows):
//   C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /nologo /optimize+ /target:exe /out:EXOT-Downloader.exe launcher\Launcher.cs

using System;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Threading;

class Launcher
{
    static void Main()
    {
        string dir = AppDomain.CurrentDomain.BaseDirectory;
        string node = Path.Combine(dir, "node", "node.exe");
        Console.Title = "EXOT Downloader";
        Console.WriteLine("============================================");
        Console.WriteLine("            EXOT Downloader");
        Console.WriteLine("============================================");
        Console.WriteLine();

        if (!File.Exists(node))
        {
            Console.WriteLine("ERROR: no se encuentra 'node\\node.exe' junto a este programa.");
            Console.WriteLine("Asegurate de EXTRAER toda la carpeta del ZIP antes de abrirlo.");
            Console.WriteLine();
            Console.Write("Pulsa Enter para salir...");
            Console.ReadLine();
            return;
        }

        Console.WriteLine("Iniciando... se abrira solo en tu navegador (http://localhost:3000).");
        Console.WriteLine("Para CERRAR la herramienta, cierra esta ventana.");
        Console.WriteLine();

        ProcessStartInfo psi = new ProcessStartInfo(node, "server.js");
        psi.WorkingDirectory = dir;
        psi.UseShellExecute = false;
        Process p = Process.Start(psi);

        Thread t = new Thread(delegate()
        {
            for (int i = 0; i < 60; i++)
            {
                Thread.Sleep(500);
                try
                {
                    using (TcpClient c = new TcpClient())
                    {
                        IAsyncResult ar = c.BeginConnect("127.0.0.1", 3000, null, null);
                        if (ar.AsyncWaitHandle.WaitOne(400) && c.Connected)
                        {
                            c.EndConnect(ar);
                            try
                            {
                                ProcessStartInfo b = new ProcessStartInfo("http://localhost:3000");
                                b.UseShellExecute = true;
                                Process.Start(b);
                            }
                            catch { }
                            return;
                        }
                    }
                }
                catch { }
            }
        });
        t.IsBackground = true;
        t.Start();

        p.WaitForExit();
    }
}
