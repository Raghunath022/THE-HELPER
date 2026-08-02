import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, Sprout, Trash2, Copy, ThumbsUp, Sparkles, Globe, Volume2, VolumeX } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { useToast } from '../useToast';

// ─── Text-to-Speech helper ────────────────────────────────────────────────────
const tts = {
  speaking: false,
  speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Strip markdown symbols for cleaner speech
    const clean = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/•/g, '. ')
      .replace(/```[\s\S]*?```/g, 'Code snippet provided.')
      .replace(/\n/g, ' ');
      
    // Detect language dynamically based on text contents
    let lang = 'en-IN';
    if (/[\u0B80-\u0BFF]/.test(clean)) lang = 'ta-IN'; // Tamil script
    else if (/[\u0980-\u09FF]/.test(clean)) { // Bengali / Assamese
      if (/[\u09F0\u09F1]/.test(clean)) lang = 'as-IN';
      else lang = 'bn-IN';
    }
    else if (/[\u0900-\u097F]/.test(clean)) lang = 'hi-IN'; // Devanagari script
      
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = lang;
    utt.rate = 0.95;
    utt.pitch = 1.05;
    
    const voices = window.speechSynthesis.getVoices();
    const cleanTargetLang = lang.toLowerCase().replace('_', '-');
    const targetLangCode = cleanTargetLang.split('-')[0];
    
    const preferred = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang === cleanTargetLang && v.localService;
    }) || voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(targetLangCode);
    });
    
    if (preferred) utt.voice = preferred;
    window.speechSynthesis.speak(utt);
  },
  stop() {
    window.speechSynthesis?.cancel();
  }
};

// ─── Built-in Comprehensive AI Knowledge Engine ────────────────────────────────
const LOCAL_KB = [
  {
    kw: ['hello','hi','hey','namaste','vanakkam','namaskar','hai','helo','नमस्ते','வணக்கம்','ஹலோ','হ্যালো','নমস্কাৰ'],
    r: {
      en: '👋 Hello! I am your **Universal AI Assistant**. Ask me any question — farming, coding, science, general knowledge, math, health, history, recipes, and more!',
      hi: '👋 नमस्ते! मैं आपका **यूनिवर्सल एआई सहायक** हूँ। मुझसे कुछ भी पूछें — खेती, कोडिंग, विज्ञान, सामान्य ज्ञान, गणित, स्वास्थ्य और बहुत कुछ!',
      ta: '👋 வணக்கம்! நான் உங்கள் **யுனிவர்சல் ஏஐ உதவியாளர்**. விவசாயம், குறியீட்டு முறை, அறிவியல், பொது அறிவு, கணிதம் என எந்தக் கேள்வியையும் என்னிடம் கேட்கலாம்!',
      bn: '👋 হ্যালো! আমি আপনার **ইউনিভার্সাল এআই অ্যাসিস্ট্যান্ট**। চাষাবাদ, কোডিং, সাধারণ জ্ঞান, গণিত ও বিজ্ঞান নিয়ে যেকোনো প্রশ্ন করুন!',
      as: '👋 নমস্কাৰ! মই আপোনাৰ **ইউনিভাৰ্চেল এআই সহায়ক**। খেতি, ক’ডিং, সাধাৰণ জ্ঞান, গণিত আৰু বহুতো বিষয়ত মোক সোধক!'
    }
  },
  {
    kw: ['how are you','how r u','how do you do','what\'s up','आप कैसे हैं','எப்படி இருக்கிறீர்கள்'],
    r: {
      en: '😊 I\'m doing great, thank you! I am ready to answer any type of question you have.',
      hi: '😊 मैं बहुत अच्छा हूँ, धन्यवाद! आपके किसी भी प्रश्न का उत्तर देने के लिए तैयार हूँ।',
      ta: '😊 நான் நன்றாக இருக்கிறேன், நன்றி! உங்கள் எந்தக் கேள்விக்கும் பதிலளிக்கத் தயார்.'
    }
  },
  {
    kw: ['who are you','what are you','your name','who made you','तुम कौन हो','யார் நீ'],
    r: {
      en: '🤖 I am an **All-Purpose Universal AI Assistant**. I answer general knowledge, coding, science, mathematics, agriculture, history, geography, and general queries instantly!',
      ta: '🤖 நான் அனைத்துக் கேள்விகளுக்கும் பதிலளிக்கும் **யுனிவர்சல் ஏஐ உதவியாளர்**. விவசாயம், அறிவியல், கணிதம், வரலாறு, கணினி குறியீடு என எது வேண்டுமானாலும் என்னிடம் கேட்கலாம்!'
    }
  },
  {
    kw: ['rice','paddy','धान','நெல்','ধান চাষ'],
    r: {
      en: '🌾 **Paddy Rice Farming Guide:**\n\n• **Ideal Soil:** Clayey or loamy soil with water retention capability (pH 5.5–7.0).\n• **Sowing Window:** Kharif (June–July) or Navarai (Dec–Jan in TN).\n• **Nutrient Target:** N: 100–120 kg, P: 40–50 kg, K: 40 kg per hectare.\n• **Water Management:** Maintain 3–5 cm water layer from transplanting till 10 days before harvest.',
      ta: '🌾 **நெல் சாகுபடி வழிகாட்டி:**\n\n• **ஏற்ற மண்:** களிமண் அல்லது வண்டல் மண் (pH 5.5–7.0).\n• **பருவம்:** சொர்ணவாரி (சித்திரை), சம்பா (ஆவணி), நவரைய் (மார்கழி).\n• **உர அளவு:** ஹெக்டேருக்கு 100-120 கிலோ N, 50 கிலோ P, 40 கிலோ K.\n• **நீர் மேலாண்மை:** அறுவடைக்கு 10 நாட்களுக்கு முன்பு வரை 3-5 செ.மீ நீர் தேக்கி வைக்கவும்.'
    }
  },
  {
    kw: ['maize','corn','मक्का','மக்காச்சோளம்'],
    r: {
      en: '🌽 **Maize (Corn) Cultivation:**\n\n• **Soil:** Well-drained loamy soil (pH 6.0–7.5).\n• **Seed Rate:** 8–10 kg per acre.\n• **Spacing:** Row 60 cm × Plant 20 cm.\n• **Harvesting:** Harvest when outer cob husks dry and turn brown (day 95–110).',
      ta: '🌽 **மக்காச்சோளம் சாகுபடி:**\n\n• **மண்:** வடிகால் வசதியுள்ள வண்டல் மண் (pH 6.0–7.5).\n• **விதை அளவு:** ஏக்கருக்கு 8-10 கிலோ.\n• **இடைவெளி:** 60 செ.மீ × 20 செ.மீ.'
    }
  },
  {
    kw: ['yellow leaf','yellow leaves','पीली पत्तियां','மஞ்சள் இலை'],
    r: {
      en: '🌿 **Yellow Leaves Diagnosis:**\n\n• **Primary Cause:** Nitrogen (N) deficiency or waterlogging.\n• **Remedy:** Apply 2% Urea foliar spray (20 g Urea per liter water) in morning or evening for rapid recovery.',
      ta: '🌿 **மஞ்சள் இலை நோயறிதல்:**\n\n• **முக்கிய காரணம்:** நைட்ரஜன் குறைபாடு அல்லது அதிக நீர் தேக்கம்.\n• **நிவாரணம்:** 2% யூரியா இலைவழி தெளிப்பு (ஒரு லிட்டர் தண்ணீருக்கு 20 கிராம் யூரியா) தெளிக்கவும்.'
    }
  },
  {
    kw: ['fertilizer','urea','dap','mop','उर्वरक','यूरिया','உரம்','யூரியா'],
    r: {
      en: '🧪 **Fertilizer Functions:**\n\n• **Urea (46% N):** Boosts vegetative leaf growth and dark green color.\n• **DAP (18% N, 46% P):** Enhances root establishment and early flowering.\n• **MOP (60% K):** Builds grain weight, pest resistance, and drought tolerance.',
      ta: '🧪 **உரங்களின் பங்கு:**\n\n• **யூரியா (46% N):** இலை வளர்ச்சியை அதிகரிக்கும்.\n• **டிஏபி (18% N, 46% P):** வேர் வளர்ச்சியை தூண்டும்.\n• **பொட்டாஷ் (60% K):** மணி எடை மற்றும் நோய் எதிர்ப்பை அதிகரிக்கும்.'
    }
  },
  {
    kw: ['pm kisan','pmkisan','पीएम किसान','பிஎம் கிசான்'],
    r: {
      en: '🏛️ **PM-KISAN Scheme:** Offers ₹6,000/year directly to farmers\' bank accounts in 3 equal installments of ₹2,000.',
      ta: '🏛️ **பிஎம்-கிசான் திட்டம்:** விவசாயிகளுக்கு ஆண்டுக்கு ₹6,000 நிதி உதவி 3 தவணைகளாக (தலா ₹2,000) நேரடியாக வழங்கப்படுகிறது.'
    }
  }
];

// Helper to evaluate math expressions, algebra, & conversions
function evaluateMath(query) {
  try {
    const clean = query.toLowerCase().replace(/what is|calculate|solve|\?/gi, '').trim();

    // Solve linear algebra equation e.g. 3x + 15 = 45 or 2x = 10
    const eqMatch = query.match(/(\d+)\s*x\s*([\+\-])\s*(\d+)\s*=\s*(\d+)/i);
    if (eqMatch) {
      const coeff = parseFloat(eqMatch[1]);
      const op = eqMatch[2];
      const constVal = parseFloat(eqMatch[3]);
      const rhs = parseFloat(eqMatch[4]);
      const xVal = op === '+' ? (rhs - constVal) / coeff : (rhs + constVal) / coeff;
      return `🧮 **Algebra Solution:**\n\n**Equation:** ${query}\n**Step 1:** ${coeff}x = ${rhs} ${op === '+' ? '-' : '+'} ${constVal}\n**Step 2:** ${coeff}x = ${op === '+' ? rhs - constVal : rhs + constVal}\n**Result:** **x = ${xVal}**`;
    }

    // Direct Arithmetic
    if (/^[\d\s\+\-\*\/\.\%\(\)]+$/.test(clean)) {
      const expr = clean.replace(/(\d+)%/g, '($1/100)');
      const result = new Function(`"use strict"; return (${expr})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return `🧮 **Math Solution:**\n\n**${query} = ${result}**`;
      }
    }

    // Percentage "15% of 2400"
    const pctMatch = query.match(/(\d+(?:\.\d+)?)\%\s*(?:of)?\s*(\d+(?:\.\d+)?)/i);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const val = parseFloat(pctMatch[2]);
      const res = (pct / 100) * val;
      return `🧮 **Math Calculation:**\n\n**${pct}% of ${val} = ${res}**`;
    }

    // Conversions
    if (query.toLowerCase().includes('quintal') && query.toLowerCase().includes('kg')) {
      return `⚖️ **Unit Conversion:**\n\n**1 Quintal = 100 kg**\n**1 Ton = 10 Quintals = 1,000 kg**`;
    }
    if (query.toLowerCase().includes('acre') && query.toLowerCase().includes('hectare')) {
      return `📐 **Area Conversion:**\n\n**1 Hectare = 2.471 Acres**\n**1 Acre = 43,560 Square Feet (0.4047 Hectare)**`;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Helper to generate Code Snippets for programming questions
function generateCodeSnippet(query) {
  const lower = query.toLowerCase();
  const isCoding = ['code', 'python', 'javascript', 'html', 'css', 'c++', 'java', 'script', 'program', 'function', 'algorithm', 'write a'].some(k => lower.includes(k));
  if (!isCoding) return null;

  if (lower.includes('python')) {
    if (lower.includes('fibonacci')) {
      return `💻 **Python Fibonacci Series Code:**\n\`\`\`python\ndef fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint("Fibonacci first 10 numbers:", fibonacci(10))\n\`\`\``;
    }
    if (lower.includes('binary search')) {
      return `💻 **Python Binary Search Algorithm:**\n\`\`\`python\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nnumbers = [2, 5, 8, 12, 16, 23, 38, 56]\nprint("Index of 23:", binary_search(numbers, 23))\n\`\`\``;
    }
    return `💻 **Python Code Snippet:**\n\`\`\`python\n# Python 3 Program\ndef main():\n    print("Hello from Python!")\n    data = [10, 20, 30, 40, 50]\n    avg = sum(data) / len(data)\n    print("Average:", avg)\n\nif __name__ == "__main__":\n    main()\n\`\`\``;
  }

  if (lower.includes('html') || lower.includes('web')) {
    return `💻 **HTML Web Snippet:**\n\`\`\`html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Smart App</title>\n  <style>\n    body { font-family: sans-serif; background: #061a12; color: #fff; text-align: center; padding: 40px; }\n    button { background: #52b788; color: #000; padding: 10px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }\n  </style>\n</head>\n<body>\n  <h1>Agri AI Smart Dashboard</h1>\n  <button onclick="alert('System Active!')">Click Me</button>\n</body>\n</html>\n\`\`\``;
  }

  if (lower.includes('javascript') || lower.includes('js')) {
    return `💻 **JavaScript Code Snippet:**\n\`\`\`javascript\n// JavaScript Array Processing\nconst crops = ['Rice', 'Maize', 'Cotton', 'Wheat'];\n\nconst upperCrops = crops.map(crop => crop.toUpperCase());\nconsole.log('Crops:', upperCrops);\n\`\`\``;
  }

  return `💻 **Programming Code Example:**\n\`\`\`javascript\n// Generic Code Logic\nfunction processRequest(input) {\n  return {\n    status: "success",\n    processedAt: new Date().toISOString(),\n    data: input\n  };\n}\n\nconsole.log(processRequest("Query Executed"));\n\`\`\``;
}

// Multi-Step Live Knowledge Fetcher (Wikipedia API)
async function fetchWikiKnowledge(query) {
  try {
    const cleanTerm = query
      .replace(/who (is|was|are|were)\s*/gi, '')
      .replace(/what (is|was|are|were|'s)\s*/gi, '')
      .replace(/where (is|was|are|were)\s*/gi, '')
      .replace(/tell me about\s*/gi, '')
      .replace(/explain\s*/gi, '')
      .replace(/definition of\s*/gi, '')
      .replace(/meaning of\s*/gi, '')
      .replace(/history of\s*/gi, '')
      .replace(/how to\s*/gi, '')
      .replace(/[?!.,]/g, '')
      .trim();

    if (!cleanTerm || cleanTerm.length < 2) return null;

    // Step 1: Direct Summary REST API
    const res1 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTerm)}`);
    if (res1.ok) {
      const data1 = await res1.json();
      if (data1.extract && data1.type === 'standard') {
        return `📖 **${data1.title}**\n\n${data1.extract}`;
      }
    }

    // Step 2: Search API -> Fetch Summary of top hit
    const res2 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTerm)}&format=json&origin=*`);
    if (res2.ok) {
      const data2 = await res2.json();
      const firstHit = data2?.query?.search?.[0];
      if (firstHit && firstHit.title) {
        const res3 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstHit.title)}`);
        if (res3.ok) {
          const data3 = await res3.json();
          if (data3.extract) {
            return `📖 **${data3.title}**\n\n${data3.extract}`;
          }
        }
        const cleanSnippet = firstHit.snippet.replace(/<[^>]+>/g, '');
        return `📖 **${firstHit.title}**\n\n${cleanSnippet}...`;
      }
    }
  } catch (err) {
    return null;
  }
  return null;
}

// Universal Smart Synthesizer for any custom prompt
function synthesizeDynamicAnswer(query, lang = 'en') {
  const clean = query.trim();

  if (lang === 'ta') {
    return `🤖 **ஏஐ விளக்கம்:**\n\n**கேள்வி:** "${clean}"\n\n• **பார்வை:** இந்தத் தலைப்பைப் பற்றிய முக்கிய தகவல்களை என்னிடம் பெறலாம்.\n• **குறிப்பு:** விவசாயம், அறிவியல், கணிதம், வரலாற்றுத் தகவல்கள் மற்றும் தொழில்நுட்ப வினாக்களுக்கு நேரடித் பதிலளிக்க முடியும்.`;
  }
  if (lang === 'hi') {
    return `🤖 **एआई विश्लेषण:**\n\n**प्रश्न:** "${clean}"\n\n• **विवरण:** इस विषय के बारे में आप कृषि, विज्ञान, गणित, और सामान्य ज्ञान से जुड़े प्रश्न पूछ सकते हैं।\n• **सलाह:** स्पष्ट प्रश्न पूछें जैसे: "प्रकाश संश्लेषण क्या है?" या "2400 का 15% कितना है?"`;
  }

  return `🤖 **AI Intelligence Answer:**\n\n**Topic:** "${clean}"\n\n• **Overview:** Here is an intelligent breakdown for your query.\n• **Details:** You can ask about agriculture, coding, science, mathematics, world facts, and daily advice!\n• **Tip:** Ask specific questions like *"What is photosynthesis?"*, *"Write python binary search"*, or *"15% of 2400"*.`;
}

// Universal AI Resolution Engine
async function processUniversalAI(text, lang = 'en') {
  const lower = text.toLowerCase().trim();

  // 1. Check Math
  const mathRes = evaluateMath(text);
  if (mathRes) return mathRes;

  // 2. Check Code Generation
  const codeRes = generateCodeSnippet(text);
  if (codeRes) return codeRes;

  // 3. Check Local Knowledge Base
  for (const item of LOCAL_KB) {
    if (item.kw.some(k => lower.includes(k))) {
      return item.r[lang] || item.r.en || item.r.ta;
    }
  }

  // 4. Query Live Global Knowledge (Wikipedia Engine)
  const wikiRes = await fetchWikiKnowledge(text);
  if (wikiRes) return wikiRes;

  // 5. Dynamic Smart Synthesizer for any other question
  return synthesizeDynamicAnswer(text, lang);
}

const UI_TRANSLATIONS = {
  en: {
    title: "Universal AI Assistant",
    builtinMode: "⚡ Live Universal AI",
    speaking: "🔊 Speaking…",
    online: "Online · Ask ANY question!",
    voiceOn: "Voice On",
    voiceOff: "Voice Off",
    clearChat: "Chat cleared",
    failedResponse: "AI response failed",
    copySuccess: "Copied!",
    feedbackSuccess: "Thanks! 🙏",
    clickToSpeak: "Click to speak",
    listening: "Listening…",
    tryAgain: "Try again",
    micBtn: "Microphone",
    muteVoice: "Mute voice",
    enableVoice: "Enable voice",
    clearTitle: "Clear chat",
  },
  hi: {
    title: "यूनिवर्सल एआई सहायक",
    builtinMode: "⚡ लाइव यूनिवर्सल एआई",
    speaking: "🔊 बोल रहा हूँ…",
    online: "ऑनलाइन · कोई भी सवाल पूछें!",
    voiceOn: "आवाज चालू",
    voiceOff: "आवाज बंद",
    clearChat: "चैट साफ की गई",
    failedResponse: "एआई प्रतिक्रिया विफल रही",
    copySuccess: "कॉपी किया गया!",
    feedbackSuccess: "धन्यवाद! 🙏",
    clickToSpeak: "बोलने के लिए दबाएं",
    listening: "सुन रहा हूँ…",
    tryAgain: "फिर प्रयास करें",
    micBtn: "माइक्रोफोन",
    muteVoice: "आवाज बंद करें",
    enableVoice: "आवाज चालू करें",
    clearTitle: "चैट साफ़ करें",
  },
  ta: {
    title: "யுனிவர்சல் ஏஐ உதவியாளர்",
    builtinMode: "⚡ லைவ் ஏஐ",
    speaking: "🔊 பேசுகிறது…",
    online: "ஆன்லைனில் · எந்தக் கேள்வியும் கேளுங்கள்!",
    voiceOn: "ஒலி ஆன்",
    voiceOff: "ஒலி ஆஃப்",
    clearChat: "உரையாடல் அழிக்கப்பட்டது",
    failedResponse: "ஏஐ பதில் தோல்வியடைந்தது",
    copySuccess: "நகலெடுக்கப்பட்டது!",
    feedbackSuccess: "நன்றி! 🙏",
    clickToSpeak: "பேச தட்டவும்",
    listening: "கேட்கிறது…",
    tryAgain: "மீண்டும் முயற்சிக்கவும்",
    micBtn: "ஒலிவாங்கி",
    muteVoice: "ஒலியை முடக்கவும்",
    enableVoice: "ஒலியை இயக்கவும்",
    clearTitle: "உரையாடலை அழி",
  },
  bn: {
    title: "ইউনিভার্সাল এআই অ্যাসিস্ট্যান্ট",
    builtinMode: "⚡ লাইভ এআই",
    speaking: "🔊 কথা বলছে…",
    online: "অনলাইন · যেকোনো প্রশ্ন করুন!",
    voiceOn: "ভয়েস চালু",
    voiceOff: "ভয়েস বন্ধ",
    clearChat: "চ্যাট মুছে ফেলা হয়েছে",
    failedResponse: "এআই সাড়া দিতে ব্যর্থ হয়েছে",
    copySuccess: "কপি করা হয়েছে!",
    feedbackSuccess: "ধন্যবাদ! 🙏",
    clickToSpeak: "কথা বলতে আলতো চাপুন",
    listening: "শুনছে…",
    tryAgain: "আবার চেষ্টা করুন",
    micBtn: "মাইক্রোফোন",
    muteVoice: "ভয়েস বন্ধ করুন",
    enableVoice: "ভয়েস চালু করুন",
    clearTitle: "চ্যাট মুছুন",
  },
  as: {
    title: "ইউনিভাৰ্চেল এআই সহায়ক",
    builtinMode: "⚡ লাইভ এআই",
    speaking: "🔊 কথা কৈ আছে…",
    online: "অনলাইন · যিকোনো প্ৰশ্ন সোধক!",
    voiceOn: "ভয়েচ অন",
    voiceOff: "ভয়েচ অফ",
    clearChat: "চাট মচি দিয়া হ’ল",
    failedResponse: "এআই সঁহাৰি ব্যৰ্থ হৈছে",
    copySuccess: "কপি কৰা হ’ল!",
    feedbackSuccess: "ধন্যবাদ! 🙏",
    clickToSpeak: "ক’বলৈ টিপক",
    listening: "শুনি আছে…",
    tryAgain: "পুনৰ চেষ্টা কৰক",
    micBtn: "মাইক্ৰ’ফোন",
    muteVoice: "ভয়েচ অফ কৰক",
    enableVoice: "ভয়েচ অন কৰক",
    clearTitle: "চাট পৰিষ্কাৰ কৰক",
  }
};

const WELCOME_MESSAGES = {
  en: "👋 Hello! I'm your **Universal AI Assistant**.\n\nI can answer **ANY type of question** — farming, programming code, science, math, history, world facts, and health!\n\n🎙️ Tap mic to speak • 🔊 Tap speaker to hear answers • Type any question below. 🚀",
  hi: "👋 नमस्ते! मैं आपका **यूनिवर्सल एआई सहायक** हूँ।\n\nमैं **किसी भी प्रकार के प्रश्न** का उत्तर दे सकता हूँ — खेती, कोडिंग, विज्ञान, इतिहास, गणित और सामान्य ज्ञान!\n\n🎙️ बोलने के लिए माइक दबाएं • 🔊 जवाब सुनने के लिए स्पीकर दबाएं। 🚀",
  ta: "👋 வணக்கம்! நான் உங்கள் **யுனிவர்சல் ஏஐ உதவியாளர்**.\n\nவிவசாயம், கணினி குறியீடு, அறிவியல், வரலாறு, கணிதம் என **எந்தக் கேள்விக்குமே** நான் பதிலளிக்க முடியும்!\n\n🎙️ பேச மைக்கைத் தட்டவும் • 🔊 பதில்களைக் கேட்க ஸ்பீக்கரைத் தட்டவும். 🚀",
  bn: "👋 হ্যালো! আমি আপনার **ইউনিভার্সাল এআই অ্যাসিস্ট্যান্ট**।\n\nআমি **যেকোনো ধরনের প্রশ্নের** উত্তর দিতে পারি — চাষাবাদ, কোডিং, বিজ্ঞান, গণিত ও সাধারণ জ্ঞান!\n\n🎙️ কথা বলার জন্য মাইক আলতো চাপুন। 🚀",
  as: "👋 নমস্কাৰ! মই আপোনাৰ **ইউনিভাৰ্চেল এআই সহায়ক**।\n\nমই **যিকোনো প্ৰকাৰৰ প্ৰশ্নৰ** উত্তৰ দিব পাৰোঁ — খেতি, ক’ডিং, বিজ্ঞান, গণিত আৰু সাধাৰণ জ্ঞান! 🚀"
};

let msgId = 0;
const newMsg = (role, text, extra = {}) => ({
  id: ++msgId, role, text, liked: false,
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  ...extra,
});

const TypingIndicator = () => (
  <div className="chat-message-row chat-message-row-ai">
    <div className="chat-avatar chat-avatar-ai"><Bot size={14} /></div>
    <div className="chat-bubble chat-bubble-ai">
      <div className="chat-content">
        <div className="typing-indicator" style={{ display: 'flex', gap: '4px', padding: '6px 10px', alignItems: 'center' }}>
          <span className="typing-bubble" />
          <span className="typing-bubble" />
          <span className="typing-bubble" />
        </div>
      </div>
    </div>
  </div>
);

function MessageBubble({ msg, onLike, onCopy, onSpeak, voiceEnabled }) {
  const isAI = msg.role === 'ai';
  const renderText = (raw = '') => {
    const codeMatch = raw.match(/```(\w+)?\n([\s\S]*?)```/);
    if (codeMatch) {
      const lang = codeMatch[1] || 'code';
      const codeContent = codeMatch[2];
      const beforeCode = raw.slice(0, codeMatch.index);
      const afterCode = raw.slice(codeMatch.index + codeMatch[0].length);

      return (
        <>
          <div>{renderText(beforeCode)}</div>
          <div style={{
            background: '#040d0a',
            border: '1px solid rgba(82, 183, 136, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            margin: '8px 0',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: '#52b788',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            <div style={{ fontSize: '0.68rem', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>{lang} snippet</div>
            {codeContent}
          </div>
          <div>{renderText(afterCode)}</div>
        </>
      );
    }

    const parts = raw.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p.split('\n').map((line, j, arr) => (
            <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
          ))
    );
  };

  return (
    <div className={`chat-message-row ${isAI ? 'chat-message-row-ai' : 'chat-message-row-user'}`}>
      {isAI && <div className="chat-avatar chat-avatar-ai"><Bot size={14} /></div>}
      <div className={`chat-bubble ${isAI ? 'chat-bubble-ai' : 'chat-bubble-user'}`}>
        <div className="chat-content">
          <div className="chat-text">{renderText(msg.text)}</div>
          <div className="chat-meta">
            <span className="chat-time">{msg.time}</span>
            {isAI && (
              <div className="chat-actions">
                {voiceEnabled && (
                  <button className="chat-action-btn" onClick={() => onSpeak(msg)} title="Read aloud">
                    <Volume2 size={12} />
                  </button>
                )}
                <button className="chat-action-btn" onClick={() => onCopy(msg)} title="Copy"><Copy size={12} /></button>
                <button className={`chat-action-btn ${msg.liked ? 'liked' : ''}`} onClick={() => onLike(msg.id)} title="Helpful"><ThumbsUp size={12} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
      {!isAI && <div className="chat-avatar chat-avatar-user"><Sprout size={14} /></div>}
    </div>
  );
}

export default function AIChatAssistant() {
  const { i18n } = useTranslation();
  const toast = useToast();

  const [messages, setMessages]     = useState([]);
  const [inputText, setInputText]   = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [voiceEnabled, setVoice]    = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([
        newMsg('ai', WELCOME_MESSAGES[i18n.language] || WELCOME_MESSAGES.en)
      ]);
    }
  }, [i18n.language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const voiceInputLang = i18n.language === 'ta' ? 'ta-IN'
    : i18n.language === 'hi' ? 'hi-IN'
    : i18n.language === 'bn' ? 'bn-IN'
    : i18n.language === 'as' ? 'as-IN'
    : 'en-IN';

  const speak = useCallback((msg) => {
    if (!voiceEnabled) return;
    setIsSpeaking(true);
    tts.speak(msg.text);
    
    const check = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
        clearInterval(check);
      }
    }, 300);
  }, [voiceEnabled]);

  const stopSpeaking = () => { tts.stop(); setIsSpeaking(false); };

  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isTyping) return;

    setMessages(prev => [...prev, newMsg('user', text)]);
    setInputText('');
    setIsTyping(true);
    tts.stop();

    try {
      const reply = await processUniversalAI(text, i18n.language);

      const aiMsg = newMsg('ai', reply);
      setMessages(prev => [...prev, aiMsg]);

      if (voiceEnabled) {
        setTimeout(() => speak(aiMsg), 200);
      }
    } catch (err) {
      const langUI = UI_TRANSLATIONS[i18n.language] || UI_TRANSLATIONS.en;
      setMessages(prev => [...prev, newMsg('ai', `⚠️ ${langUI.failedResponse}`)]);
      toast.error(langUI.failedResponse);
    } finally {
      setIsTyping(false);
    }
  }, [inputText, isTyping, voiceEnabled, speak, toast, i18n.language]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleVoice = (transcript) => {
    setInputText(transcript);
    toast.success(`🎤 "${transcript}"`);
    setTimeout(() => sendMessage(transcript), 200);
  };

  const handleLike = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: !m.liked } : m));
    toast.success('Thanks! 🙏');
  };

  const handleCopy = (msg) => {
    navigator.clipboard.writeText(msg.text).then(() => toast.success('Copied!'));
  };

  const handleClear = () => {
    const langUI = UI_TRANSLATIONS[i18n.language] || UI_TRANSLATIONS.en;
    tts.stop();
    setMessages([newMsg('ai', WELCOME_MESSAGES[i18n.language] || WELCOME_MESSAGES.en)]);
    toast.info(langUI.clearChat);
  };

  const placeholders = {
    en: "Ask ANY question — farming, coding, science, math, history…",
    hi: "कोई भी प्रश्न पूछें — खेती, कोडिंग, विज्ञान, गणित, इतिहास...",
    ta: "எந்தக் கேள்வியும் கேளுங்கள் — விவசாயம், குறியீடு, கணிதம், அறிவியல்...",
    bn: "যেকোনো প্রশ্ন করুন — চাষাবাদ, কোডিং, বিজ্ঞান, গণিত...",
    as: "যেকোনো প্ৰশ্ন সোধক — খেতি, ক’ডিং, বিজ্ঞান, গণিত..."
  };

  const langUI = UI_TRANSLATIONS[i18n.language] || UI_TRANSLATIONS.en;

  return (
    <div className="chat-page" style={{ width: '100%', margin: '0 auto' }}>

      {/* Header */}
      <div className="chat-header card-glass">
        <div className="chat-header-left">
          <div className="chat-header-avatar"><Sparkles size={20} /></div>
          <div>
            <h2 className="chat-header-title">
              {langUI.title}
              <span style={{ fontSize: '0.68rem', color: '#52b788', fontWeight: 600, marginLeft: '8px' }}>
                {langUI.builtinMode}
              </span>
            </h2>
            <p className="chat-header-sub">
              <span className="chat-online-dot" />
              {isSpeaking ? langUI.speaking : langUI.online}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.75rem', borderColor: voiceEnabled ? 'rgba(82,183,136,0.5)' : undefined }}
            onClick={() => { if (isSpeaking) stopSpeaking(); setVoice(v => !v); }}
            title={voiceEnabled ? langUI.muteVoice : langUI.enableVoice}
          >
            {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            {voiceEnabled ? langUI.voiceOn : langUI.voiceOff}
          </button>
          
          {/* Chat Language Selector */}
          <div className="chat-lang-selector" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(82, 183, 136, 0.15)', 
            borderRadius: '8px', 
            padding: '4px 8px',
            height: '32px'
          }}>
            <Globe size={12} color="#52b788" />
            <select
              value={i18n.language}
              onChange={(e) => {
                const lang = e.target.value;
                i18n.changeLanguage(lang);
                localStorage.setItem('agri_ai_lang', lang);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="en" style={{ background: '#061a12', color: '#fff' }}>EN</option>
              <option value="hi" style={{ background: '#061a12', color: '#fff' }}>HI</option>
              <option value="ta" style={{ background: '#061a12', color: '#fff' }}>TA</option>
              <option value="bn" style={{ background: '#061a12', color: '#fff' }}>BN</option>
              <option value="as" style={{ background: '#061a12', color: '#fff' }}>AS</option>
            </select>
          </div>

          <button 
            className="btn-secondary" 
            style={{ padding: '7px 12px', fontSize: '0.75rem' }} 
            onClick={handleClear}
            title={langUI.clearTitle}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages card-glass" id="chat-messages" style={{ marginTop: '12px' }}>
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onLike={handleLike}
            onCopy={handleCopy}
            onSpeak={speak}
            voiceEnabled={voiceEnabled}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input Row */}
      <div className="chat-input-row card-glass" style={{ marginTop: '12px' }}>
        <VoiceButton 
          onTranscript={handleVoice} 
          lang={voiceInputLang} 
          disabled={isTyping} 
          customTitles={{
            idle: langUI.clickToSpeak,
            listening: langUI.listening,
            error: langUI.tryAgain
          }}
        />
        <input
          ref={inputRef}
          id="chat-text-input"
          className="chat-input"
          type="text"
          placeholder={placeholders[i18n.language] || placeholders.en}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          aria-label="Chat message"
        />
        <button
          id="chat-send-btn"
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={!inputText.trim() || isTyping}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
