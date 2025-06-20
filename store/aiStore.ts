import { create } from 'zustand';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { messagesService } from '~/services/messagesService';
import { patientService } from '~/services/patientService';
import { useComplaintsStore } from './complaintsStore';
import { supabase } from '~/lib/supabase';

// AI Assistant statik ID
const AI_ASSISTANT_ID = '00d1201a-ca68-49f4-be4a-37ebb492a022';

interface PatientContext {
  name: string;
  age: number | null;
  gender: string;
  latestMeasurements: Array<{
    type: string;
    value: number;
    unit: string;
    date: string;
  }>;
  activeComplaints: Array<{
    description: string;
    category: string;
    priority: string;
    startDate: string;
  }>;
}

interface AIState {
  isGenerating: boolean;
  error: string | null;
  geminiApiKey: string | null;

  // Actions
  setApiKey: (apiKey: string) => void;
  generateResponse: (userMessage: string, userId: string, patientId: string) => Promise<void>;
  clearError: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  isGenerating: false,
  error: null,
  geminiApiKey: null,

  setApiKey: (apiKey: string) => {
    set({ geminiApiKey: apiKey });
  },

  generateResponse: async (userMessage: string, userId: string, patientId: string) => {
    const { geminiApiKey } = get();

    if (!geminiApiKey) {
      set({ error: 'Gemini API anahtarı bulunamadı' });
      return;
    }

    set({ isGenerating: true, error: null });

    try {
      // Hasta bağlamını topla - userId'yi geç, patientId'yi de
      const patientContext = await collectPatientContext(userId, patientId);

      // Prompt oluştur
      const prompt = createPrompt(userMessage, patientContext);

      // Gemini API'ya gönder
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      // AI cevabını Supabase'e kaydet
      await messagesService.sendMessage(
        {
          receiver_user_id: userId,
          message_type_id: 2, // AI mesaj tipi
          content: aiResponse,
        },
        AI_ASSISTANT_ID
      );

      set({ isGenerating: false });
    } catch (error) {
      console.error('AI yanıt üretme hatası:', error);
      set({
        error: error instanceof Error ? error.message : 'AI yanıt üretilemedi',
        isGenerating: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Hasta bağlamını topla
async function collectPatientContext(userId: string, patientId: string): Promise<PatientContext> {
  try {
    // Hasta profil bilgilerini al - userId kullan
    const patientProfile = await patientService.getPatientProfile(userId);

    // Son ölçümleri al - patientId parametresini kullan
    const latestMeasurements = patientId
      ? await patientService.getLatestHealthMeasurements(patientId)
      : [];

    // Aktif şikayetleri al - patientId parametresini kullan
    const activeComplaints = patientId ? await patientService.getActiveComplaints(patientId) : [];

    const context: PatientContext = {
      name: patientProfile?.name
        ? `${patientProfile.name} ${patientProfile.surname || ''}`.trim()
        : 'Hasta',
      age: patientProfile?.birth_date
        ? patientService.calculateAge(patientProfile.birth_date)
        : null,
      gender: patientProfile?.gender_name || 'Belirtilmemiş',
      latestMeasurements: latestMeasurements.slice(0, 5).map((measurement) => ({
        type: measurement.measurement_types?.name || 'Bilinmeyen',
        value: measurement.value || 0,
        unit: measurement.measurement_types?.unit || '',
        date: new Date(measurement.measured_at || '').toLocaleDateString('tr-TR'),
      })),
      activeComplaints: activeComplaints.map((complaint: any) => ({
        description: complaint.description || '',
        category: complaint.category_name || 'Genel',
        priority: complaint.priority_level || 'normal',
        startDate: new Date(complaint.start_date || '').toLocaleDateString('tr-TR'),
      })),
    };

    return context;
  } catch (error) {
    console.error('Hasta bağlamı toplama hatası:', error);
    // Hata durumunda boş context döndür
    return {
      name: 'Hasta',
      age: null,
      gender: 'Belirtilmemiş',
      latestMeasurements: [],
      activeComplaints: [],
    };
  }
}

// Prompt oluştur
function createPrompt(userMessage: string, context: PatientContext): string {
  return `Sen bir sağlık asistanısın. Aşağıdaki hasta bilgilerine göre yardımcı ol:

HASTA BİLGİLERİ:
- İsim: ${context.name}
- Yaş: ${context.age || 'Belirtilmemiş'}
- Cinsiyet: ${context.gender}

SON ÖLÇÜMLER:
${
  context.latestMeasurements.length > 0
    ? context.latestMeasurements
        .map((m) => `- ${m.type}: ${m.value} ${m.unit} (${m.date})`)
        .join('\n')
    : '- Henüz ölçüm kaydı bulunmuyor'
}

AKTİF ŞİKAYETLER:
${
  context.activeComplaints.length > 0
    ? context.activeComplaints
        .map(
          (c) =>
            `- ${c.description} (${c.category}, ${c.priority} öncelik, ${c.startDate} tarihinden beri)`
        )
        .join('\n')
    : '- Aktif şikayet bulunmuyor'
}

HASTA MESAJI: "${userMessage}"

YÖNERGELER:
1. Türkçe yanıt ver
2. Dostça ve anlayışlı ol
3. Tıbbi tavsiye verme, sadece genel bilgi paylaş
4. Acil durumlar için doktora başvurmasını öner
5. Ölçüm verilerini yorumlarken genel bilgiler ver
6. Şikayetler hakkında empati göster
7. Yanıtını kısa ve anlaşılır tut (maksimum 200 kelime)
8. Eğer veriler eksikse, daha fazla bilgi isteyebileceğini belirt

YANIT:`;
}
