import { Router } from 'express';
import { detectDisease, calculateFertilizer, getPlantCareAdvice, chat, getMyReports, getWeatherAdvice } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { uploadDiseaseImage } from '../config/cloudinary';

const router = Router();

router.post('/disease-detect', authenticate, uploadDiseaseImage.single('image'), detectDisease);
router.post('/fertilizer-calc', authenticate, calculateFertilizer);
router.post('/plant-care', authenticate, uploadDiseaseImage.single('image'), getPlantCareAdvice);
router.post('/chat', authenticate, chat);
router.post('/weather-advice', authenticate, getWeatherAdvice);
router.get('/disease-reports', authenticate, getMyReports);

export default router;
