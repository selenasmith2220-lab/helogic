import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Chat Nexu', time: new Date().toISOString() });
  });

  // AI Assistant endpoint (Users & Admin)
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { role, mode, prompt, context } = req.body;
      const ai = getGenAI();

      if (!ai) {
        // Safe intelligent fallback if API key is not yet configured
        return res.json({
          success: true,
          response: getLocalAIFallback(role, mode, prompt),
          isFallback: true,
        });
      }

      let systemInstruction = '';
      if (role === 'admin') {
        systemInstruction = `You are Nexu Admin Copilot, an expert AI advisor for Chat Nexu's administrator.
You assist with:
- Monetization advice, subscription pricing recommendations (Daily, Weekly, Monthly), and ad revenue strategy
- Community moderation insights, toxicity classification, and ban recommendations
- Broadcast announcement drafting and user retention advice
- Mobile money & bank payout guidance
Keep recommendations actionable, data-driven, concise, and professional.`;
      } else {
        systemInstruction = `You are Nexu AI Wingman, a witty, charming, respectful, and engaging conversation companion for users on Chat Nexu (an online chat and video roulette app).
You help users with:
- Creative, charismatic icebreakers for text chat and 1-on-1 random video chat
- Fun conversation topics, questions, and respectful compliments
- Live language translation and polite tone enhancement
- Dating advice and safe chatting tips
Keep answers punchy, natural, friendly, and under 120 words.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `${context ? `Context: ${context}\n\n` : ''}User request: ${prompt}`,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        success: true,
        response: response.text || 'No response generated.',
        isFallback: false,
      });
    } catch (err: any) {
      console.error('Error generating AI response:', err);
      res.json({
        success: true,
        response: getLocalAIFallback(req.body.role, req.body.mode, req.body.prompt),
        isFallback: true,
      });
    }
  });

  // Wallet Payout Processing Simulation Endpoint
  app.post('/api/wallet/payout', (req, res) => {
    const { amount, method, destinationDetails } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required.' });
    }

    const txId = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const fee = (amount * 0.015).toFixed(2); // 1.5% transfer fee
    const netAmount = (amount - parseFloat(fee)).toFixed(2);

    res.json({
      success: true,
      transaction: {
        id: txId,
        amount: Number(amount),
        fee: parseFloat(fee),
        netAmount: parseFloat(netAmount),
        method,
        destination: destinationDetails,
        status: 'completed',
        timestamp: Date.now(),
        reference: 'NXU-' + Math.floor(100000 + Math.random() * 900000),
      },
    });
  });

  // Development vs Production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chat Nexu server running on http://localhost:${PORT}`);
  });
}

function getLocalAIFallback(role: string, mode: string, prompt: string): string {
  if (role === 'admin') {
    if (prompt.toLowerCase().includes('price') || prompt.toLowerCase().includes('plan')) {
      return '💡 Recommended Strategy: Keep the Daily Plan at $1.99 as an impulse purchase for video chatters. Price the Weekly Plan at $4.99 (50% discount per day), and the Monthly VIP Plan at $14.99 for maximum lifetime value.';
    }
    if (prompt.toLowerCase().includes('payout') || prompt.toLowerCase().includes('wallet')) {
      return '💰 Wallet Tip: Mobile Money (M-Pesa, MTN, Airtel) payouts typically settle in 2-5 minutes with lowest fees, whereas International SWIFT bank wires settle within 24-48 business hours.';
    }
    return '🛡️ Moderation & Revenue Status: Community activity is healthy. Conversion to video chat subscriptions surges between 7 PM - 1 AM UTC. Consider broadcasting a Happy Hour discount during peak hours.';
  } else {
    // User Wingman
    const icebreakers = [
      '🔥 "Hey! Quick question: If you could teleport anywhere in the world right now for dinner, where are we going?"',
      '✨ "I have to know: are you team sweet breakfast or savory breakfast? There is only one correct answer!"',
      '🎵 "What song have you had on repeat lately? I need to refresh my playlist."',
      '✈️ "What was the most spontaneous adventure you\'ve ever gone on?"',
    ];
    return icebreakers[Math.floor(Math.random() * icebreakers.length)];
  }
}

startServer();
