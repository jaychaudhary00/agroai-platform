import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PlantDiseaseReport } from '../models';
import { AppError } from '../middleware/errorHandler';
import axios from 'axios';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// ─── AI helper ────────────────────────────────────────────────────────────────
const generateAIResponse = async (
  prompt: string,
  systemMessage?: string
) => {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',

    messages: [
      ...(systemMessage
        ? [
            {
              role: 'system' as const,
              content: systemMessage,
            },
          ]
        : []),

      {
        role: 'user',
        content: prompt,
      },
    ],

    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || '';
};

// ─── YouTube video fetch ──────────────────────────────────────────────────────
const fetchYouTubeVideos = async (query: string) => {
  try {
    const key = process.env.YOUTUBE_API_KEY;

    if (!key) return [];

    const res = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults: 3,
          key,
        },
        timeout: 5000,
      }
    );

    return res.data.items.map((item: any) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));
  } catch (err: any) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.error?.message || err?.message;
    console.error(`[YouTube API] Failed (${status}): ${msg}`);
    return [];
  }
};

// ─── POST /api/ai/disease-detect ─────────────────────────────────────────────
export const detectDisease = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('Plant image is required', 400);
    }

    const imageUrl = (req.file as any).path;
    const cropType = req.body.cropType || 'unknown';

    const prompt = `
Analyze plant disease for crop type: ${cropType}

IMPORTANT:
Return ONLY valid JSON.

{
  "diseaseName": "Disease name",
  "confidence": 85,
  "severity": "medium",
  "description": "Disease details",
  "treatment": "Treatment steps",
  "prevention": "Prevention methods",
  "fertilizerAdvice": "Fertilizer recommendation",
  "wateringAdvice": "Watering advice",
  "cropType": "${cropType}",
  "isHealthy": false
}
`;

    const text = await generateAIResponse(prompt);

    const cleanText = text.replace(/```json|```/g, '').trim();

    const aiData = JSON.parse(cleanText);

    const relatedVideos = await fetchYouTubeVideos(
      `${aiData.diseaseName} plant disease treatment`
    );

    const report = await PlantDiseaseReport.create({
      userId: req.user!._id,
      imageUrl,
      diseaseName: aiData.diseaseName,
      confidence: aiData.confidence,
      description: aiData.description,
      treatment: aiData.treatment,
      prevention: aiData.prevention,
      fertilizerAdvice: aiData.fertilizerAdvice,
      wateringAdvice: aiData.wateringAdvice,
      relatedVideos,
      cropType: aiData.cropType,
      severity: aiData.severity || 'medium',
    });

    res.status(201).json({
      success: true,
      message: 'Disease analysis complete',
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/ai/fertilizer-calc ────────────────────────────────────────────
export const calculateFertilizer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      cropType,
      soilType,
      fieldArea,
      fieldAreaUnit,
      plantAge,
    } = req.body;

    if (!cropType || !soilType || !fieldArea) {
      throw new AppError(
        'cropType, soilType, and fieldArea are required',
        400
      );
    }

    const prompt = `
You are an expert agricultural soil scientist.

Crop: ${cropType}
Soil: ${soilType}
Field area: ${fieldArea} ${fieldAreaUnit || 'acres'}
Plant age: ${plantAge || 0} days

Return ONLY valid JSON.

{
  "nitrogen": {
    "amount": 35,
    "unit": "kg/acre",
    "product": "Urea"
  },
  "phosphorus": {
    "amount": 25,
    "unit": "kg/acre",
    "product": "DAP"
  },
  "potassium": {
    "amount": 15,
    "unit": "kg/acre",
    "product": "MOP"
  },
  "applicationSchedule": [
    "At sowing",
    "30 days later"
  ],
  "estimatedCost": 4500,
  "micronutrients": "Zinc sulphate",
  "notes": "Adjust after soil test"
}
`;

    const text = await generateAIResponse(prompt);

    const recommendation = JSON.parse(
      text.replace(/```json|```/g, '').trim()
    );

    res.json({
      success: true,
      data: recommendation,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/ai/plant-care ──────────────────────────────────────────────────
export const getPlantCareAdvice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('Plant image is required', 400);
    }

    const imageUrl = (req.file as any).path;

    const prompt = `
You are a gardening expert.

Return ONLY valid JSON.

{
  "species": "Plant name",
  "issue": "Problem or Healthy",
  "sunlightRequirement": "Indirect light",
  "wateringSchedule": "Every 3 days",
  "humidity": "Medium humidity",
  "temperature": "20-28C",
  "recoveryPlan": "Recovery steps",
  "repottingAdvice": "Repot yearly",
  "isHealthy": false
}
`;

    const text = await generateAIResponse(prompt);

    const advice = JSON.parse(
      text.replace(/```json|```/g, '').trim()
    );

    const videos = await fetchYouTubeVideos(
      `${advice.species} plant care guide`
    );

    res.json({
      success: true,
      data: {
        ...advice,
        imageUrl,
        relatedVideos: videos,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
export const chat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, language } = req.body;

    if (!message?.trim()) {
      throw new AppError('Message is required', 400);
    }

    const langNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      gu: 'Gujarati',
      pa: 'Punjabi',
      mr: 'Marathi',
    };

    const langName = langNames[language] || 'English';

    const systemMessage = `
You are AgroAI Assistant.

You help Indian farmers with:
- crop diseases
- fertilizers
- farming techniques
- plant care
- weather advice

Always respond in ${langName}.
Keep answers simple and practical.
`;

    const reply = await generateAIResponse(
      message,
      systemMessage
    );

    res.json({
      success: true,
      data: {
        reply,
        role: 'assistant',
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/ai/disease-reports ─────────────────────────────────────────────
export const getMyReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;

    const limit = parseInt(req.query.limit as string) || 10;

    const [reports, total] = await Promise.all([
      PlantDiseaseReport.find({
        userId: req.user!._id,
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      PlantDiseaseReport.countDocuments({
        userId: req.user!._id,
      }),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/ai/weather-advice ─────────────────────────────────────────────
export const getWeatherAdvice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { weatherData, plants } = req.body;

    const prompt = `
Weather Data:
${JSON.stringify(weatherData)}

Plants:
${plants?.join(', ') || 'General plants'}

Return ONLY valid JSON.

{
  "alerts": ["High heat"],
  "wateringAdvice": "Water daily",
  "protectionAdvice": "Use shade net",
  "generalTips": [
    "Avoid overwatering",
    "Monitor leaves"
  ]
}
`;

    const text = await generateAIResponse(prompt);

    const data = JSON.parse(
      text.replace(/```json|```/g, '').trim()
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};