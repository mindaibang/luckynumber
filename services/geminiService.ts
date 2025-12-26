
import { GoogleGenAI, Type } from "@google/genai";
import { DrawConfig, DrawResponse } from "../types";

export const performDraw = async (config: DrawConfig, lockedNumbers: number[]): Promise<DrawResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Hệ thống rút thăm chuyên nghiệp.
  Yêu cầu rút thăm ${config.count} số ngẫu nhiên không trùng trong khoảng từ ${config.min} đến ${config.max}.
  
  DANH SÁCH SỐ ĐÃ TRÚNG (ĐÃ KHÓA): [${lockedNumbers.join(', ')}].
  
  LUẬT QUAN TRỌNG:
  1. KHÔNG ĐƯỢC chọn bất kỳ số nào nằm trong danh sách ĐÃ KHÓA ở trên.
  2. Các số mới phải nằm trong khoảng [${config.min}, ${config.max}].
  3. Nếu không còn đủ số để rút (số lượng yêu cầu > số lượng còn lại), hãy trả về lỗi chi tiết trong trường 'error'.
  4. Trả về mảng 'results' chứa các số mới được chọn.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "Mảng chứa các số ngẫu nhiên mới rút được."
            },
            error: {
              type: Type.STRING,
              description: "Thông báo lỗi tiếng Việt nếu không thể thực hiện."
            }
          },
          required: ["results"]
        }
      }
    });

    const resultText = response.text || '{}';
    return JSON.parse(resultText) as DrawResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      results: [],
      error: "Lỗi kết nối lồng cầu AI. Vui lòng kiểm tra lại!"
    };
  }
};
