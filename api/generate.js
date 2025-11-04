// Este archivo debe estar en: /api/generate.js

// Vercel usa Node.js, así que importamos 'fetch' (si usamos una versión antigua)
// pero las versiones modernas de Vercel lo tienen globalmente.
// No se necesita 'UrlFetchApp'.

export default async function handler(request, response) {
  // 1. Añadimos cabeceras CORS para ser flexibles
  // Aunque Vercel lo sirve desde el mismo dominio, esto no hace daño
  // y permite pruebas desde tu PC (localhost)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si es una petición de verificación (OPTIONS), solo respondemos OK
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Solo permitimos peticiones POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. Obtenemos la clave API de forma SEGURA
    // En Vercel, esto se hace con "Environment Variables"
    // (Configuración del Proyecto > Environment Variables)
    // Debes crear una variable llamada: GEMINI_API_KEY
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("No se ha configurado la API key en Vercel.");
    }

    // 3. Obtenemos los datos que nos envía el HTML
    // Vercel ya parsea el JSON por nosotros si el header es correcto
    // Pero como lo mandamos como 'text/plain', lo parseamos.
    const body = JSON.parse(request.body);
    const geminiPayload = body.payload;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

    const options = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiPayload),
    };

    // 4. Llamamos a Gemini usando 'fetch' (que es global en Vercel)
    const geminiResponse = await fetch(url, options);
    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
        throw new Error(data.error?.message || 'Error al llamar a Gemini');
    }

    // 5. Devolvemos la respuesta de Gemini a nuestro HTML
    return response.status(200).json(data);

  } catch (error) {
    // Devolvemos un error
    return response.status(500).json({ error: error.message });
  }
}
