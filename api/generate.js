// Este archivo debe estar en: /api/generate.js

export default async function handler(request, response) {
  // Añadimos cabeceras CORS para ser flexibles
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
    // Obtenemos la clave API de forma SEGURA
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("No se ha configurado la API key en Vercel.");
    }

    // === CAMBIO CLAVE ===
    // Vercel ya parsea el body si el Content-Type es 'application/json'
    // Así que NO necesitamos JSON.parse()
    const body = request.body;
    
    // Comprobamos que el payload existe
    if (!body || !body.payload) {
        throw new Error("Payload no encontrado en la petición.");
    }

    const geminiPayload = body.payload;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

    const options = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiPayload),
    };

    // Llamamos a Gemini usando 'fetch'
    const geminiResponse = await fetch(url, options);
    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
        // Si Google da un error, lo mostramos
        throw new Error(data.error?.message || 'Error al llamar a Gemini');
    }

    // Devolvemos la respuesta de Gemini a nuestro HTML
    return response.status(200).json(data);

  } catch (error) {
    // Devolvemos un error claro
    console.error("Error en el backend:", error.message); // Log para Vercel
    return response.status(500).json({ error: error.message });
  }
}

