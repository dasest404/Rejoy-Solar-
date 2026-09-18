import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health & Status Check
  app.get(['/api/health', '/api/status', '/api/status.php'], (_req, res) => {
    res.json({
      status: 'ONLINE',
      app: 'SolarPulse EPC ERP & CRM',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      server_time: new Date().toISOString(),
      features: {
        spa_routing: true,
        client_persistence: 'localStorage / JSON sync',
        gemini_proxy: Boolean(process.env.GEMINI_API_KEY),
        database_helper: true
      }
    });
  });

  // DB Status Check
  app.get(['/api/db', '/api/db.php'], (_req, res) => {
    res.json({
      status: 'STANDBY',
      message: 'The ERP is operating in high-performance local persistence mode with full export/import/restore capabilities.'
    });
  });

  // Gemini Generative Language Proxy Endpoint
  app.post(['/api/gemini', '/api/gemini.php'], async (req, res) => {
    try {
      const { prompt, systemInstruction, model } = req.body || {};

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Missing "prompt" string in request payload.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured.',
          help: 'Set GEMINI_API_KEY in your environment variables to enable AI assistance.'
        });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || 'You are an expert Solar EPC and CRM AI assistant.'
        }
      });

      const text = response.text || '';
      res.json({
        candidates: [
          {
            content: {
              parts: [{ text }]
            }
          }
        ],
        text
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({
        error: err?.message || 'Error generating content with Gemini API'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
