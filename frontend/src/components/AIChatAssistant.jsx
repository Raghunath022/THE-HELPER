import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, Sprout, Trash2, Copy, ThumbsUp, Sparkles, Globe, Volume2, VolumeX, Key } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { useToast } from '../useToast';

// ─── Gemini API ───────────────────────────────────────────────────────────────
const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are an intelligent AI assistant built into the Agri AI SaaS Platform. 
You can answer ANY question a user asks — general knowledge, science, math, coding, farming, health, history, geography, and more.
When answering farming-related questions, be extra detailed with Tamil Nadu / Indian context.
Always be friendly, concise, and helpful. Format key points with bullet points when listing items.
Keep responses under 300 words unless the user asks for detail. Do not use markdown headers (#).`;

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
      .replace(/\n/g, ' ');
      
    // Detect language dynamically based on text contents
    let lang = 'en-IN';
    if (/[\u0B80-\u0BFF]/.test(clean)) lang = 'ta-IN'; // Tamil script
    else if (/[\u0980-\u09FF]/.test(clean)) { // Bengali / Assamese script
      if (/[\u09F0\u09F1]/.test(clean)) lang = 'as-IN'; // Assamese specific letters
      else lang = 'bn-IN';
    }
    else if (/[\u0900-\u097F]/.test(clean)) lang = 'hi-IN'; // Devanagari script
      
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = lang;
    utt.rate = 0.95;
    utt.pitch = 1.05;
    
    // Find matching voices case-insensitively
    const voices = window.speechSynthesis.getVoices();
    const cleanTargetLang = lang.toLowerCase().replace('_', '-');
    const targetLangCode = cleanTargetLang.split('-')[0];
    
    const preferred = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang === cleanTargetLang && v.localService;
    }) || voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(targetLangCode) && v.localService;
    }) || voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang === cleanTargetLang;
    }) || voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(targetLangCode);
    });
    
    if (preferred) {
      utt.voice = preferred;
    } else {
      // Fallback to any voice of the same language family
      const backupVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLangCode));
      if (backupVoice) utt.voice = backupVoice;
    }
    window.speechSynthesis.speak(utt);
  },
  stop() {
    window.speechSynthesis?.cancel();
  }
};

// ─── Smart local knowledge base ──────────────────────────────────────────────
const LOCAL_KB = [
  {
    kw: ['hello','hi','hey','namaste','vanakkam','namaskar','hai bhai','helo','नमस्ते','வணக்கம்','হ্যালো','নমস্কাৰ'],
    r: {
      en: '👋 Hello! I\'m your **AI Assistant**. Ask me anything — farming, general knowledge, math, science, health, history, and more! 🌟',
      hi: '👋 नमस्ते! मैं आपका **एआई सहायक** हूँ। मुझसे कुछ भी पूछें — खेती, सामान्य ज्ञान, गणित, विज्ञान, स्वास्थ्य, इतिहास और बहुत कुछ! 🌟',
      ta: '👋 வணக்கம்! நான் உங்கள் **ஏஐ உதவியாளர்**. விவசாயம், பொது அறிவு, கணிதம், அறிவியல், ஆரோக்கியம், வரலாறு என எது வேண்டுமானாலும் என்னிடம் கேளுங்கள்! 🌟',
      bn: '👋 হ্যালো! আমি আপনার **এআই অ্যাসিস্ট্যান্ট**। চাষাবাদ, সাধারণ জ্ঞান, গণিত, বিজ্ঞান, স্বাস্থ্য, ইতিহাস এবং আরও অনেক কিছু সম্পর্কে আমাকে যেকোনো প্রশ্ন করুন! 🌟',
      as: '👋 নমস্কাৰ! মই আপোনাৰ **এআই সহায়ক**। খেতি, সাধাৰণ জ্ঞান, গণিত, বিজ্ঞান, স্বাস্থ্য, ইতিহাস আৰু বহুতো বিষয়ত মোক সোধক! 🌟'
    }
  },
  {
    kw: ['how are you','how r u','how do you do','what\'s up','wassup','आप कैसे हैं','எப்படி இருக்கிறீர்கள்','কেমন আছেন','কেমন আছে'],
    r: {
      en: '😊 I\'m doing great, thank you! Ready to help you with any question. What would you like to know?',
      hi: '😊 मैं बहुत अच्छा हूँ, धन्यवाद! आपकी मदद के लिए तैयार हूँ। आप क्या जानना चाहेंगे?',
      ta: '😊 நான் நன்றாக இருக்கிறேன், நன்றி! உங்களுக்கு உதவத் தயார். நீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?',
      bn: '😊 আমি খুব ভালো আছি, ধন্যবাদ! আপনাকে সাহায্য করার জন্য প্রস্তুত। আপনি কী জানতে চান?',
      as: '😊 মই খুব ভালে আছোঁ, ধন্যবাদ! আপোনাক সহায় কৰিবলৈ সাজু। আপুনি কি জানিব বিচাৰে?'
    }
  },
  {
    kw: ['who are you','what are you','your name','who made you','तुम कौन हो','யார் நீ','আপনি কে','আপুনি কোন'],
    r: {
      en: '🤖 I\'m the **AI Assistant** of Agri AI Platform, powered by Google Gemini. I can answer questions on any topic — farming, science, math, history, geography, and more!',
      hi: '🤖 मैं एग्री एआई प्लेटफॉर्म का **एआई सहायक** हूँ, जो गूगल जेमिनी द्वारा संचालित है। मैं किसी भी विषय पर सवालों के जवाब दे सकता हूँ — खेती, विज्ञान, गणित, इतिहास, भूगोल और बहुत कुछ!',
      ta: '🤖 நான் எக்ரி ஏஐ தளத்தின் **ஏஐ உதவியாளர்**, கூகுள் ஜெமினி மூலம் இயங்குகிறேன். விவசாயம், அறிவியல், கணிதம், வரலாறு, புவியியல் போன்ற எந்தத் தலைப்பிலும் நான் பதிலளிக்க முடியும்!',
      bn: '🤖 আমি এগ্রি এআই প্ল্যাটফর্মের **এআই অ্যাসিস্ট্যান্ট**, গুগল জেমিনি দ্বারা পরিচালিত। আমি যেকোনো বিষয়ে উত্তর দিতে পারি — চাষাবাদ, বিজ্ঞান, গণিত, ইতিহাস, ভূগোল এবং আরও অনেক কিছু!',
      as: '🤖 মই এগ্ৰী এআই প্লেটফৰ্মৰ **এআই সহায়ক**, গুগল জেমিনী দ্বাৰা চালিত। মই যিকোনো বিষয়তে উত্তৰ দিব পাৰোঁ — খেতি, বিজ্ঞান, গণিত, ইতিহাস, ভূগোল আৰু বহুতো!'
    }
  },
  {
    kw: ['thank','thanks','धन्यवाद','நன்றி','ধন্যবাদ'],
    r: {
      en: '😊 You\'re welcome! Feel free to ask me anything anytime.',
      hi: '😊 आपका स्वागत है! कभी भी मुझसे कुछ भी पूछने के लिए संकोच न करें।',
      ta: '😊 உங்களுக்கு வரவேற்பு! எப்போது வேண்டுமானாலும் என்னிடம் தாராளமாகக் கேளுங்கள்.',
      bn: '😊 আপনাকে স্বাগতম! যেকোনো সময় যেকোনো কিছু জিজ্ঞাসা করতে পারেন।',
      as: '😊 আপোনাক আদৰণি জনাইছোঁ! যিকোনো সময়তে যিকোনো কথা সোধক।'
    }
  },
  {
    kw: ['capital of france','france capital','फ्रांस की राजधानी','பிரான்சின் தலைநகரம்','ফ্রান্সের রাজধানী','ফ্ৰান্সৰ ৰাজধানী'],
    r: {
      en: '🗼 The capital of **France** is **Paris**. It is also the country\'s largest city and a major European cultural hub.',
      hi: '🗼 **फ्रांस** की राजधानी **पेरिस** है। यह देश का सबसे बड़ा शहर और एक प्रमुख यूरोपीय सांस्कृतिक केंद्र भी है।',
      ta: '🗼 **பிரான்சின்** தலைநகரம் **பாரீஸ்** ஆகும். இது அந்நாட்டின் மிகப்பெரிய நகரமாகவும், ஐரோப்பிய கலாச்சார மையமாகவும் உள்ளது.',
      bn: '🗼 **ফ্রান্সের** राजधानी হল **প্যারিস**। এটি দেশটির বৃহত্তম শহর এবং একটি প্রধান ইউরোপীয় সাংস্কৃতিক কেন্দ্র।',
      as: '🗼 **ফ্ৰান্সৰ** ৰাজধানী হ’ল **পেৰিছ**। এইখন দেশৰ আটাইতকৈ ডাঙৰ চহৰ আৰু সাংস্কৃতিক কেন্দ্ৰ।'
    }
  },
  {
    kw: ['capital of india','india capital','भारत की राजधानी','இந்தியாவின் தலைநகரம்','ভারতের রাজধানী','ভাৰতৰ ৰাজধানী'],
    r: {
      en: '🏛️ The capital of **India** is **New Delhi**. It is the seat of the Indian government and is located in the National Capital Territory of Delhi.',
      hi: '🏛️ **भारत** की राजधानी **नई दिल्ली** है। यह भारत सरकार का मुख्यालय है और दिल्ली के राष्ट्रीय राजधानी क्षेत्र में स्थित है।',
      ta: '🏛️ **இந்தியாவின்** தலைநகரம் **புது தில்லி** ஆகும். இது இந்திய அரசின் தலைமையகமாகவும், தில்லி தேசிய தலைநகரப் பகுதியிலும் அமைந்துள்ளது.',
      bn: '🏛️ **ভারতের** राजधानी হল **নয়াদিল্লি**। এটি ভারত সরকারের প্রশাসনিক কেন্দ্র এবং দিল্লির কেন্দ্রস্থলে অবস্থিত।',
      as: '🏛️ **ভাৰতৰ** ৰাজধানী হ’ল **নতুন দিল্লী**। ই ভাৰত চৰকাৰৰ প্ৰশাসনিক কেন্দ্ৰ।'
    }
  },
  {
    kw: ['capital of japan','japan capital','जापान की राजधानी','ஜப்பானின் தலைநகரம்','জাপানের রাজধানী','জাপানৰ ৰাজধানী'],
    r: {
      en: '⛩️ The capital of **Japan** is **Tokyo**. It is the world\'s most populous metropolitan area.',
      hi: '⛩️ **जापान** की राजधानी **टोक्यो** है। यह दुनिया का सबसे अधिक आबादी वाला महानगरीय क्षेत्र है।',
      ta: '⛩️ **ஜப்பானின்** தலைநகரம் **டோக்கியோ** ஆகும். இது உலகிலேயே அதிக மக்கள் தொகை கொண்ட பெருநகரப் பகுதியாகும்.',
      bn: '⛩️ **জাপানের** রাজধানী হল **টোকিও**। এটি বিশ্বের সবচেয়ে জনবহুল মেট্রোপলিটন এলাকা।',
      as: '⛩️ **জাপানৰ** ৰাজধানী হ’ল **টকিঅ’**। ই পৃথিৱীৰ অন্যতম জনবহুল মহানগৰ।'
    }
  },
  {
    kw: ['capital of usa','usa capital','capital of america','united states capital','अमेरिका की राजधानी','அமெரிக்காவின் தலைநகரம்','আমেরিকার রাজধানী','আমেৰিকাৰ ৰাজধানী'],
    r: {
      en: '🗽 The capital of the **United States** is **Washington, D.C.**',
      hi: '🗽 **संयुक्त राज्य अमेरिका** की राजधानी **वाशिंगटन, डी.सी.** है।',
      ta: '🗽 **அமெரிக்காவின்** தலைநகரம் **வாஷிங்டன், டி.சி.** ஆகும்.',
      bn: '🗽 **মার্কিন যুক্তরাষ্ট্রের** রাজধানী হল **ওয়াশিংটন, ডি.সি.**।',
      as: '🗽 **আমেৰিকা যুক্তৰাষ্ট্ৰৰ** ৰাজধানী হ’ল **ৱাছিংটন, ডি.চি.**।'
    }
  },
  {
    kw: ['capital of uk','uk capital','capital of england','england capital','लंदन किसकी राजधानी','இங்கிலாந்தின் தலைநகரம்','যুক্তরাজ্যের রাজধানী','যুক্তৰাজ্যৰ ৰাজধানী'],
    r: {
      en: '🎡 The capital of the **United Kingdom** is **London**.',
      hi: '🎡 **यूनाइटेड किंगडम** की राजधानी **लंदन** है।',
      ta: '🎡 **யுனைடெட் கிங்டமின்** தலைநகரம் **லண்டன்** ஆகும்.',
      bn: '🎡 **যুক্তরাজ্যের** রাজধানী হল **লন্ডন**।',
      as: '🎡 **যুক্তৰাজ্যৰ** ৰাজধানী হ’ল **লণ্ডন**।'
    }
  },
  {
    kw: ['15% of 2400','15 percent of 2400','2400 का 15%','2400 இல் 15%','২৪০০ এর ১৫%','২৪০০ ৰ ১৫%'],
    r: {
      en: '🧮 **15% of 2400 = 360**\n\nCalculation: 2400 × 0.15 = 360',
      hi: '🧮 **2400 का 15% = 360**\n\nगणना: 2400 × 0.15 = 360',
      ta: '🧮 **2400 இல் 15% = 360**\n\nகணக்கீடு: 2400 × 0.15 = 360',
      bn: '🧮 **২৪০০ এর ১৫% = ৩৬০**\n\nহিসাব: ২৪০০ × ০.১৫ = ৩৬০',
      as: '🧮 **২৪০০ ৰ ১৫% = ৩৬০**\n\nহিসাপ: ২৪০০ × ০.১৫ = ৩৬০'
    }
  },
  {
    kw: ['how many kg in quintal','kg in one quintal','kg in a quintal','एक क्विंटल में कितने किलो','ஒரு குவாண்டலில் எத்தனை கிலோ','এক কুইন্টালে কত কেজি','এক কুইণ্টলত কিমান কেজি'],
    r: {
      en: '⚖️ **1 Quintal = 100 kg**',
      hi: '⚖️ **1 क्विंटल = 100 किलोग्राम**',
      ta: '⚖️ **1 குவாண்டல் = 100 கிலோகிராம்**',
      bn: '⚖️ **১ কুইন্টাল = ১০০ কেজি**',
      as: '⚖️ **১ কুইণ্টল = ১০০ কেজি**'
    }
  },
  {
    kw: ['photosynthesis','how do plants make food','प्रकाश संश्लेषण','ஒளிச்சேர்க்கை','সালোকসংশ্লেষ','সালোকসংশ্লেষণ'],
    r: {
      en: '🌱 **Photosynthesis** is the process by which plants convert sunlight, water (H₂O), and carbon dioxide (CO₂) into glucose (food) and oxygen.\n\n📝 Formula: **6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂**',
      hi: '🌱 **प्रकाश संश्लेषण** वह प्रक्रिया है जिसके द्वारा पौधे सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड को ग्लूकोज (भोजन) और ऑक्सीजन में परिवर्तित करते हैं।\n\n📝 सूत्र: **6CO₂ + 6H₂O + प्रकाश → C₆H₁₂O₆ + 6O₂**',
      ta: '🌱 **ஒளிச்சேர்க்கை** என்பது தாவரங்கள் சூரிய ஒளி, நீர் மற்றும் கார்பன் டை ஆக்சைடு ஆகியவற்றைப் பயன்படுத்தி குளுக்கோஸ் (உணவு) மற்றும் ஆக்ஸிஜனாக மாற்றும் செயல்முறையாகும்.\n\n📝 சமன்பாடு: **6CO₂ + 6H₂O + ஒளி → C₆H₁₂O₆ + 6O₂**',
      bn: '🌱 **সালোকসংশ্লেষ** হল এমন একটি প্রক্রিয়া যার মাধ্যমে উদ্ভিদ সূর্যালোক, জল এবং কার্বন ডাই অক্সাইডকে গ্লুকোজ (খাদ্য) এবং অক্সিজেনে রূপান্তরিত করে।\n\n📝 সমীকরণ: **6CO₂ + 6H₂O + আলো → C₆H₁₂O₆ + 6O₂**',
      as: '🌱 **সালোকসংশ্লেষণ** হৈছে এনে এক প্ৰক্ৰিয়া যাৰ দ্বাৰা উদ্ভিদে সূৰ্যৰ পোহৰ, পানী আৰু কাৰ্বন ডাই অক্সাইড ব্যৱহাৰ কৰি গ্লুক’জ আৰু অক্সিজেন প্ৰস্তুত কৰে।'
    }
  },
  {
    kw: ['what is dna','dna stands for','डीएनए क्या है','டிஎன்ஏ என்றால் என்ன','ডিএনএ কি','ডিএনএ কি?'],
    r: {
      en: '🧬 **DNA** stands for **Deoxyribonucleic Acid**. It carries the genetic instructions for all living organisms.',
      hi: '🧬 **डीएनए (DNA)** का मतलब **डीऑक्सीराइबोन्यूक्लिक एसिड** है। यह सभी जीवित जीवों के लिए आनुवंशिक निर्देश वहन करता है।',
      ta: '🧬 **டிஎன்ஏ (DNA)** என்பது **டியோக்சிரைபோநியூக்ளிக் அமிலம்** ஆகும். இது அனைத்து உயிரினங்களின் மரபணு தகவல்களையும் தாங்கிச் செல்கிறது.',
      bn: '🧬 **ডিএনএ (DNA)** এর পূর্ণ রূপ হল **ডিঅক্সিরাইবোনিউক্লিক অ্যাসিড**। এটি সমস্ত সজীব বস্তুর জিনগত নির্দেশাবলী বহন করে।',
      as: '🧬 **ডিএনএ (DNA)** ৰ সম্পূৰ্ণ নাম হ’ল **ডিঅক্সীৰাইব’নিউক্লিক এচিড**। ই জীৱৰ বংশগতিৰ ধাৰক।'
    }
  },
  {
    kw: ['diabetes','sugar disease','diabetic','मधुमेह','சர்க்கரை நோய்','ডায়াবেটিস','ডায়াবেটিছ'],
    r: {
      en: '🩺 **Diabetes symptoms:**\n\n• Frequent urination\n• Excessive thirst and hunger\n• Blurred vision\n• Fatigue and weakness\n\n⚠️ Always consult a doctor for proper diagnosis.',
      hi: '🩺 **मधुमेह के लक्षण:**\n\n• बार-बार पेशाब आना\n• अत्यधिक प्यास और भूख लगना\n• धुंधली दृष्टि\n• थकान और कमजोरी\n\n⚠️ सटीक निदान के लिए हमेशा डॉक्टर से संपर्क करें।',
      ta: '🩺 **நீரிழிவு நோயின் அறிகுறிகள்:**\n\n• அடிக்கடி சிறுநீர் கழித்தல்\n• அதிகப்படியான தாகம் மற்றும் பசி\n• மங்கலான பார்வை\n• சோர்வு மற்றும் பலவீனம்\n• எப்போதும் மருத்துவரை அணுகவும்.',
      bn: '🩺 **ডায়াবেটিসের লক্ষণ:**\n\n• ঘন ঘন প্রস্রাবের বেগ\n• অতিরিক্ত তৃষ্ণা ও ক্ষুধা\n• ঝাপসা দৃষ্টি\n• ক্লান্তি ও দুর্বলতা\n\n⚠️ সঠিক পরামর্শের জন্য চিকিৎসকের সাথে যোগাযোগ করুন।',
      as: '🩺 **ডায়াবেটিছৰ লক্ষণবোৰ:**\n\n• সঘনাই প্ৰস্ৰাৱ হোৱা\n• অত্যধিক পিয়াহ আৰু ভোক লগা\n• চকুৰে ধোঁৱা-কোঁৱা দেখা\n• ভাগৰ লগা\n\n⚠️ চিকিৎসকৰ পৰামৰ্শ লওক।'
    }
  },
  {
    kw: ['blood pressure','high bp','hypertension','रक्तचाप','இரத்த அழுத்தம்','রক্তচাপ','ৰক্তচাপ'],
    r: {
      en: '❤️ **Normal blood pressure: 120/80 mmHg**',
      hi: '❤️ **सामान्य रक्तचाप: 120/80 mmHg**',
      ta: '❤️ **சாதாரண இரத்த அழுத்தம்: 120/80 mmHg**',
      bn: '❤️ **স্বাভাবিক রক্তচাপ: ১২০/৮০ mmHg**',
      as: '❤️ **স্বাভাৱিক ৰক্তচাপ: ১২০/৮০ mmHg**'
    }
  },
  {
    kw: ['yellow','pale','chloro','पीली पत्तियां','மஞ்சள் இலை','হলুদ পাতা','হালধীয়া পাত'],
    r: {
      en: '🌿 **Yellow leaves = Nitrogen deficiency** (most likely)\n\n• Apply Urea at 50 kg/acre\n• Use 2% urea foliar spray for quick green recovery',
      hi: '🌿 **पीली पत्तियाँ = नाइट्रोजन की कमी** (सबसे संभावित)\n\n• प्रति एकड़ 50 किलोग्राम यूरिया का प्रयोग करें\n• तुरंत हरे रंग की रिकवरी के लिए 2% यूरिया का छिड़काव करें',
      ta: '🌿 **மஞ்சள் இலைகள் = நைட்ரஜன் குறைபாடு** (அதிக வாய்ப்பு)\n\n• ஏக்கருக்கு 50 கிலோ யூரியா பயன்படுத்தவும்\n• விரைவாகப் பச்சையாக மாற 2% யூரியா இலைவழி தெளிப்பு செய்யவும்',
      bn: '🌿 **হলুদ পাতা = নাইট্রোজেন ঘাটতি** (সম্ভাব্য)\n\n• একর প্রতি ৫০ কেজি ইউরিয়া সার ব্যবহার করুন\n• দ্রুত সবুজ করার জন্য ২% ইউরিয়া স্প্রে করুন',
      as: '🌿 **হালধীয়া পাত = নাইট্ৰ’জেনৰ অভাৱ**\n\n• প্ৰতি একৰত ৫০ কেজি ইউৰিয়া প্ৰয়োগ কৰক\n• ২% ইউৰিয়া পানী স্প্ৰে’ কৰিলে সোনকালে সুফল পাব'
    }
  },
  {
    kw: ['irrigat','water','dry','moisture','सिंचाई','பாசனம்','সেচ','জলসিঞ্চন'],
    r: {
      en: '💧 **Irrigation timing tips:**\n\n• Sandy soil: every 3–4 days\n• Clay soil: every 7–10 days\n• Use drip irrigation for 40–60% water savings',
      hi: '💧 **सिंचाई के टिप्स:**\n\n• रेतीली मिट्टी: हर 3-4 दिन में\n• चिकनी मिट्टी: हर 7-10 दिन में\n• 40-60% पानी की बचत के लिए ड्रिप सिंचाई अपनाएं',
      ta: '💧 **பாசனக் குறிப்புகள்:**\n\n• மணல் மண்: 3-4 நாட்களுக்கு ஒருமுறை\n• களிமண்: 7-10 நாட்களுக்கு ஒருமுறை\n• 40-60% நீர் சேமிப்புக்கு சொட்டுநீர் பாசனத்தைப் பயன்படுத்தவும்',
      bn: '💧 **সেচ দেওয়ার পরামর্শ:**\n\n• সেচ দেওয়ার পরামর্শ: প্রতি ৩-৪ দিনে\n• এঁটেল মাটি: প্রতি ৭-১০ দিনে\n• ৪০-৬০% জল সাশ্রয়ের জন্য ফোঁটা সেচ (ড্রিপ) ব্যবহার করুন',
      as: '💧 **জলসিঞ্চনৰ পৰামৰ্শ:**\n\n• বালিচহীয়া মাটি: ৩-৪ দিনৰ মূৰে মূৰে\n• বোকা মাটি: ৭-১০ দিনৰ মূৰে মূৰে\n• ৪০-৬০% পানী ৰাহি কৰিবলৈ ড্ৰিপ পদ্ধতি ব্যৱহাৰ কৰক'
    }
  },
  {
    kw: ['blight','fungus','spot','rust','mold','फफूंद','பூஞ்சை','ছত্রাক','ভেঁকুৰ'],
    r: {
      en: '🍂 **Fungal disease treatment:**\n\n• Apply Mancozeb 75 WP @ 2.5 g/litre\n• Remove infected leaves immediately\n• Avoid overhead irrigation',
      hi: '🍂 **कवक (फंगल) रोग का उपचार:**\n\n• मैंकोजेब 75 WP @ 2.5 ग्राम/लीटर की दर से छिड़कें\n• संक्रमित पत्तियों को तुरंत हटा दें\n• ऊपर से पानी छिड़कने से बचें',
      ta: '🍂 **பூஞ்சை நோய் சிகிச்சை:**\n\n• மேங்கோசெப் 75 WP @ 2.5 கிராம்/லிட்டர் பயன்படுத்தவும்\n• பாதிக்கப்பட்ட இலைகளை உடனடியாக அகற்றி அழிக்கவும்\n• பயிரின் மேல் தெளிப்பதைத் தவிர்க்கவும்',
      bn: '🍂 **ছত্রাকজনিত রোগের চিকিৎসা:**\n\n• ম্যানকোজেব ৭৫ ডব্লিউপি @ ২.৫ গ্রাম/লিটার স্প্রে করুন\n• আক্রান্ত পাতা অবিলম্বে কেটে ফেলে দিন\n• উপর থেকে জল দেওয়া এড়িয়ে চলুন',
      as: '🍂 **ভেঁকুৰজনিত ৰোগৰ চিকিৎসা:**\n\n• মেনক’জেব ৭৫ ডব্লিউ পি ২.৫ গ্ৰাম/লিটাৰ পানীত মিলাই ছটিয়াওক\n• আক্ৰান্ত পাতবোৰ কাটি পুৰি পেলাওক'
    }
  },
  {
    kw: ['pm kisan','pmkisan','kisan scheme','पीएम किसान','பிஎம் கிசான்','পিএম কিসান','পিএম কিষাণ'],
    r: {
      en: '🏛️ **PM-KISAN Scheme:**\n\n• ₹6,000/year in 3 installments of ₹2,000 each\n• Direct bank transfer to small farmers',
      hi: '🏛️ **पीएम-किसान योजना:**\n\n• प्रति वर्ष ₹6,000, जो ₹2,000 की 3 किश्तों में दिया जाता है\n• छोटे किसानों को सीधे बैंक खाते में ट्रांसफर',
      ta: '🏛️ **பிஎம்-கிசான் திட்டம்:**\n\n• ஆண்டுக்கு ₹6,000, மூன்று சம தவணைகளாக (தலா ₹2,000) வழங்கப்படுகிறது\n• விவசாயிகளின் வங்கிக் கணக்கில் நேரடியாகச் செலுத்தப்படுகிறது',
      bn: '🏛️ **পিএম-কিসান প্রকল্প:**\n\n• বছরে মোট ৬,০০০ টাকা (২,০০০ টাকার ৩টি কিস্তিতে)\n• ক্ষুদ্র চাষীদের সরাসরি ব্যাংক অ্যাকাউন্টে জমা দেওয়া হয়',
      as: '🏛️ **পিএম-কিষাণ আঁচনি:**\n\n• বছৰি ৬,০০০ টকা (২,০০০ টকাকৈ ৩টা কিস্তিত)\n• খেতিয়কৰ বেংক একাউণ্টত পোনপটীয়াকৈ জমা কৰা হয়'
    }
  }
];

const DEFINITIONS = {
  fertilizer:   '⚗️ **Fertilizer** is any substance added to soil to supply essential nutrients (NPK) that help plants grow, flower, and yield more.',
  urea:         '🧪 **Urea** is a nitrogenous fertilizer containing **46% Nitrogen**. It promotes leaf and stem growth.',
  soil:         '🌱 **Soil** is the top layer of Earth\'s surface made of minerals and organic matter. It supports plant growth by providing nutrients and water.',
  photosynthesis:'🌱 **Photosynthesis** is the process by which green plants use sunlight to convert CO2 and water into glucose and oxygen.',
  npk:          '⚗️ **NPK** stands for **Nitrogen (N) – Phosphorus (P) – Potassium (K)** — the three primary nutrients plants need.',
  kharif:       '🌾 **Kharif** is the summer crop season in India, from **June to October**. Crops include Rice, Cotton, and Maize.',
  rabi:         '🌾 **Rabi** is the winter crop season in India, from **October to March**. Crops include Wheat and Mustard.'
};

function detectIntent(lower) {
  const DEFINITION_TRIGGERS = ['what is','what are','what\'s','define','definition of','meaning of','explain what','tell me about'];
  const HOWTO_TRIGGERS      = ['how to','how do i','how should i','when to','how much','tips for','guide for'];
  if (DEFINITION_TRIGGERS.some(t => lower.startsWith(t) || lower.includes(' ' + t + ' '))) return 'define';
  if (HOWTO_TRIGGERS.some(t => lower.startsWith(t) || lower.includes(t))) return 'howto';
  return 'general';
}

function localFallback(text, activeLang = 'en') {
  const lower = text.toLowerCase().trim();
  const intent = detectIntent(lower);

  if (activeLang === 'hi') {
    if (intent === 'define') {
      return `📚 **"${text}"**\n\nमेरे पास कई विषयों (खेती, विज्ञान, सरकारी योजनाओं, भूगोल) की जानकारी है। कृपया अधिक स्पष्ट रूप से पूछें, जैसे:\n• "यूरिया क्या है?"\n• "प्रकाश संश्लेषण क्या है?"`;
    }
    const sorted = [...LOCAL_KB].sort((a, b) =>
      Math.max(...b.kw.map(k => k.length)) - Math.max(...a.kw.map(k => k.length))
    );
    for (const item of sorted) {
      if (item.kw.some(k => lower.includes(k))) return item.r.hi || item.r.en;
    }
    return `मैं आपका प्रश्न समझता हूँ: **"${text}"**\n\nमैं सीधे इन विषयों पर उत्तर दे सकता हूँ:\n🌾 खेती, फसल रोग, उर्वरक, सिंचाई\n🌍 देशों की राजधानियाँ, भूगोल\n🧮 गणित (किग्रा, एकड़, प्रतिशत)\n🔬 विज्ञान (प्रकाश संश्लेषण, डीएनए)\n💊 स्वास्थ्य (मधुमेह, बुखार)\n\nकृपया पूछें: "उर्वरक क्या है?" या "जापान की राजधानी?"`;
  }
  
  if (activeLang === 'ta') {
    if (intent === 'define') {
      return `📚 **"${text}"**\n\nபயிர் வகைகள், அறிவியல், அரசு திட்டங்கள், புவியியல் போன்ற பல தலைப்புகளுக்கான விளக்கங்கள் என்னிடம் உள்ளன. மேலும் விவரமாகக் கேட்கவும், உதாரணத்திற்கு:\n• "யூரியா என்றால் என்ன?"\n• "ஒளிச்சேர்க்கை என்றால் என்ன?"`;
    }
    const sorted = [...LOCAL_KB].sort((a, b) =>
      Math.max(...b.kw.map(k => k.length)) - Math.max(...a.kw.map(k => k.length))
    );
    for (const item of sorted) {
      if (item.kw.some(k => lower.includes(k))) return item.r.ta || item.r.en;
    }
    return `உங்கள் கேள்வியை நான் புரிந்துகொள்கிறேன்: **"${text}"**\n\nபின்வரும் தலைப்புகளில் என்னால் பதிலளிக்க முடியும்:\n🌾 விவசாயம், பயிர் நோய்கள், உரங்கள், பாசனம்\n🌍 நாடுகளின் தலைநகரங்கள், புவியியல்\n🧮 கணிதம் (கிலோகிராம், ஏக்கர், சதவீதம்)\n🔬 அறிவியல் (ஒளிச்சேர்க்கை, டிஎன்ஏ)\n💊 ஆரோக்கியம் (சர்க்கரை நோய், காய்ச்சல்)\n\nகேளுங்கள்: "உரம் என்றால் என்ன?" அல்லது "ஜப்பானின் தலைநகரம் எது?"`;
  }

  if (activeLang === 'bn') {
    const sorted = [...LOCAL_KB].sort((a, b) =>
      Math.max(...b.kw.map(k => k.length)) - Math.max(...a.kw.map(k => k.length))
    );
    for (const item of sorted) {
      if (item.kw.some(k => lower.includes(k))) return item.r.bn || item.r.en;
    }
    return `আমি আপনার প্রশ্নটি বুঝতে পারছি: **"${text}"**\n\nআমি সরাসরি উত্তর দিতে পারি:\n🌾 চাষাবাদ, ফসলের রোগ, সার, সেচ\n🌍 দেশের রাজধানী, ভূগোল\n🧮 গণিত রূপান্তর (কেজি, একর, শতাংশ)\n🔬 বিজ্ঞান (সালোকসংশ্লেষ, ডিএনএ)\n\nজিজ্ঞাসা করুন: "সার কি?" বা "জাপানের রাজধানী কি?"`;
  }

  if (activeLang === 'as') {
    const sorted = [...LOCAL_KB].sort((a, b) =>
      Math.max(...b.kw.map(k => k.length)) - Math.max(...a.kw.map(k => k.length))
    );
    for (const item of sorted) {
      if (item.kw.some(k => lower.includes(k))) return item.r.as || item.r.en;
    }
    return `মই আপোনাৰ প্ৰশ্নটো বুজি পাইছোঁ: **"${text}"**\n\nমই পোনপটীয়াকৈ উত্তৰ দিব পাৰোঁ:\n🌾 খেতি, শস্যৰ ৰোগ, সাৰ, জলসিঞ্চন\n🌍 দেশৰ ৰাজধানী, ভূগোল\n🧮 গণিত ৰূপান্তৰ (কেজি, একৰ, শতাংশ)\n🔬 বিজ্ঞান (সালোকসংশ্লেষণ, ডিএনএ)\n\nসোধক: "সাৰ কি?" বা "জাপানৰ ৰাজধানী কি?"`;
  }

  // Default English
  if (intent === 'define') {
    const subject = lower
      .replace(/what (is|are|'s|was|were)\s*/i, '')
      .replace(/define |definition of |meaning of |explain |describe |tell me about /gi, '')
      .replace(/[?!.,]/g, '')
      .trim();

    for (const [key, def] of Object.entries(DEFINITIONS)) {
      if (subject.includes(key) || key.includes(subject.split(' ')[0])) return def;
    }
    return `📚 **"${text}"**\n\nI have a definition for many topics (farming terms, science concepts, government schemes, geography). Try asking more specifically, for example:\n• "What is nitrogen fertilizer?"\n• "What is photosynthesis?"`;
  }

  const sorted = [...LOCAL_KB].sort((a, b) =>
    Math.max(...b.kw.map(k => k.length)) - Math.max(...a.kw.map(k => k.length))
  );
  for (const item of sorted) {
    if (item.kw.some(k => lower.includes(k))) return item.r.en || item.r;
  }
  return `I understand your question: **"${text}"**\n\nI can directly answer questions on:\n🌾 Farming, crop diseases, fertilizers, irrigation\n🌍 Capitals of countries, geography facts\n🧮 Math conversions (kg, acres, percentages)\n🔬 Science (photosynthesis, DNA, gravity, atoms)\n💊 Health (diabetes, fever, blood pressure)\n\nTry asking: "What is fertilizer?" or "Capital of Japan?"`;}

const UI_TRANSLATIONS = {
  en: {
    title: "AI Assistant",
    geminiActive: "⚡ Gemini Active",
    builtinMode: "💡 Built-in Mode",
    speaking: "🔊 Speaking…",
    online: "Online · Ask anything!",
    voiceOn: "Voice On",
    voiceOff: "Voice Off",
    keyActive: "Key ✓",
    addKey: "Add Key",
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
    invalidKey: "❌ Invalid API key. Please re-enter it using the \"Add Key\" button.",
    quotaExceeded: "⚠️ API quota exceeded. Try again later or check your key.",
    offlineMode: "⚠️ Switched to offline mode.",
  },
  hi: {
    title: "एआई सहायक",
    geminiActive: "⚡ जेमिनी सक्रिय",
    builtinMode: "💡 इन-बिल्ट मोड",
    speaking: "🔊 बोल रहा हूँ…",
    online: "ऑनलाइन · कुछ भी पूछें!",
    voiceOn: "आवाज चालू",
    voiceOff: "आवाज बंद",
    keyActive: "कुंजी ✓",
    addKey: "कुंजी जोड़ें",
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
    invalidKey: "❌ अमान्य एपीआई कुंजी। कृपया \"कुंजी जोड़ें\" बटन का उपयोग करके इसे फिर से दर्ज करें।",
    quotaExceeded: "⚠️ एपीआई कोटा समाप्त हो गया है। बाद में पुनः प्रयास करें या अपनी कुंजी जांचें।",
    offlineMode: "⚠️ ऑफलाइन मोड पर स्विच किया गया।",
  },
  ta: {
    title: "ஏஐ உதவியாளர்",
    geminiActive: "⚡ ஜெமினி செயலில் உள்ளது",
    builtinMode: "💡 உள்ளமைக்கப்பட்ட பயன்முறை",
    speaking: "🔊 பேசுகிறது…",
    online: "ஆன்லைனில் · எது வேண்டுமானாலும் கேளுங்கள்!",
    voiceOn: "ஒலி ஆன்",
    voiceOff: "ஒலி ஆஃப்",
    keyActive: "சாவி ✓",
    addKey: "சாவி சேர்",
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
    invalidKey: "❌ தவறான ஏபிஐ சாவி. \"சாவி சேர்\" பொத்தானைப் பயன்படுத்தி அதை மீண்டும் உள்ளிடவும்.",
    quotaExceeded: "⚠️ ஏபிஐ ஒதுக்கீடு வரம்பை மீறியுள்ளது. பின்னர் மீண்டும் முயற்சிக்கவும் அல்லது உங்கள் சாவியைச் சரிபார்க்கவும்.",
    offlineMode: "⚠️ ஆஃப்லைன் பயன்முறைக்கு மாற்றப்பட்டது.",
  },
  bn: {
    title: "এআই অ্যাসিস্ট্যান্ট",
    geminiActive: "⚡ জেমিনি সক্রিয়",
    builtinMode: "💡 বিল্ট-ইন মোড",
    speaking: "🔊 কথা বলছে…",
    online: "অনলাইন · যেকোনো কিছু জিজ্ঞাসা করুন!",
    voiceOn: "ভয়েস चालू",
    voiceOff: "ভয়েস বন্ধ",
    keyActive: "কী ✓",
    addKey: "কী যুক্ত করুন",
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
    invalidKey: "❌ অবৈধ এপিআই কী। অনুগ্রহ করে \"কী যুক্ত করুন\" বোতামটি ব্যবহার করে আবার প্রবেশ করান।",
    quotaExceeded: "⚠️ এপিআই কোটা অতিক্রম করেছে। পরে আবার চেষ্টা করুন বা আপনার কী পরীক্ষা করুন।",
    offlineMode: "⚠️ অফলাইন মোডে স্থানান্তরিত করা হয়েছে।",
  },
  as: {
    title: "এআই সহায়ক",
    geminiActive: "⚡ জেমিনী সক্ৰিয়",
    builtinMode: "💡 বিল্ট-ইন মোড",
    speaking: "🔊 কথা কৈ আছে…",
    online: "অনলাইন · যিকোনো কথা সোধক!",
    voiceOn: "ভয়েচ অন",
    voiceOff: "ভয়েচ অফ",
    keyActive: "কী ✓",
    addKey: "কী যোগ কৰক",
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
    invalidKey: "❌ অবৈধ এপিআই কী। অনুগ্ৰহ কৰি \"কী যোগ কৰক\" বুটামটো ব্যৱহাৰ কৰি পুনৰ প্ৰৱেশ কৰাওক।",
    quotaExceeded: "⚠️ এপিআই ক’টা অতিক্ৰম কৰিছে। পাছত পুনৰ চেষ্টা কৰক বা আপোনাৰ কী পৰীক্ষা কৰক।",
    offlineMode: "⚠️ অফলাইন মোডলৈ স্থানান্তৰ কৰা হ’ল।",
  }
};

// ─── Welcome translation mappings ─────────────────────────────────────────────
const WELCOME_MESSAGES = {
  en: "👋 Hello! I'm your **AI Assistant** powered by Google Gemini.\n\nI can answer **any question** — farming, science, history, math, coding, health, and more!\n\n🎙️ Tap the mic to speak • 🔊 Tap speaker to hear answers • Type or use quick chips below. 🚀",
  hi: "👋 नमस्ते! मैं गूगल जेमिनी द्वारा संचालित आपका **एआई सहायक** हूँ।\n\nमैं **किसी भी प्रश्न** का उत्तर दे सकता हूँ — खेती, विज्ञान, इतिहास, गणित, कोडिंग, स्वास्थ्य और बहुत कुछ।\n\n🎙️ बोलने के लिए माइक दबाएं • 🔊 जवाब सुनने के लिए स्पीकर दबाएं • नीचे दिए गए त्वरित चिप्स का उपयोग करें। 🚀",
  ta: "👋 வணக்கம்! நான் கூகுள் ஜெமினி மூலம் இயங்கும் உங்கள் **ஏஐ உதவியாளர்**.\n\nவிவசாயம், அறிவியல், வரலாறு, கணிதம், குறியீட்டு முறை, ஆரோக்கியம் என **எந்தக் கேள்விக்குமே** நான் பதிலளிக்க முடியும்!\n\n🎙️ பேச மைக்கைத் தட்டவும் • 🔊 பதில்களைக் கேட்க ஸ்பீக்கரைத் தட்டவும் • கீழே உள்ள விரைவு சிப்களைப் பயன்படுத்தவும். 🚀",
  bn: "👋 হ্যালো! আমি গুগল জেমিনি চালিত আপনার **এআই অ্যাসিস্ট্যান্ট**।\n\nআমি **যেকোনো প্রশ্নের** উত্তর দিতে পারি — চাষাবাদ, বিজ্ঞান, ইতিহাস, গণিত, কোডিং, স্বাস্থ্য এবং আরও অনেক কিছু!\n\n🎙️ কথা বলার জন্য মাইক আলতো চাপুন • 🔊 উত্তর শোনার জন্য স্পিকার আলতো চাপুন • নিচে দেওয়া কুইক চিপস ব্যবহার করুন। 🚀",
  as: "👋 নমস্কাৰ! মই গুগল জেমিনী চালিত আপোনাৰ **এআই সহায়ক**।\n\nমই **যিকোনো প্ৰশ্নৰ** উত্তৰ দিব পাৰোঁ — খেতি, বিজ্ঞান, ইতিহাস, গণিত, ক’ডিং, স্বাস্থ্য আৰু বহুতো!\n\n🎙️ কথা ক’বলৈ মাইক টিপক • 🔊 উত্তৰ শুনিবলৈ স্পীকাৰ টিপক • তলৰ কুইক চিপ ব্যৱহাৰ কৰক। 🚀"
};

const CHIPS_LOCALIZED = {
  en: [
    { label: '🌾 Rice farming',     text: 'How to grow paddy rice in Tamil Nadu?' },
    { label: '🧮 Quick math',       text: 'What is 15% of 2400?' },
    { label: '🌐 General knowledge',text: 'What is the capital of France?' },
    { label: '💊 Health',           text: 'What are the symptoms of diabetes?' },
    { label: '💻 Python code',      text: 'Write a simple Python hello world program' },
    { label: '💨 Spray timing',     text: 'When should I not spray pesticide on crops?' },
    { label: '🚜 PM-KISAN',        text: 'How to apply for PM-KISAN scheme?' },
    { label: '⚖️ Convert units',    text: 'How many kg in one quintal?' },
  ],
  hi: [
    { label: '🌾 धान की खेती',       text: 'तमिलनाडु में धान की खेती कैसे करें?' },
    { label: '🧮 त्वरित गणित',       text: '2400 का 15% कितना होता है?' },
    { label: '🌐 सामान्य ज्ञान',      text: 'फ्रांस की राजधानी क्या है?' },
    { label: '💊 स्वास्थ्य',          text: 'मधुमेह के लक्षण क्या हैं?' },
    { label: '💻 पायथन कोड',         text: 'एक साधारण पायथन हेलो वर्ल्ड प्रोग्राम लिखें' },
    { label: '💨 छिड़काव का समय',     text: 'मुझे फसलों पर कीटनाशक का छिड़काव कब नहीं करना चाहिए?' },
    { label: '🚜 पीएम-किसान',        text: 'पीएम-किसान योजना के लिए आवेदन कैसे करें?' },
    { label: '⚖️ इकाइयां बदलें',      text: 'एक क्विंटल में कितने किलोग्राम होते हैं?' },
  ],
  ta: [
    { label: '🌾 நெல் விவசாயம்',     text: 'தமிழ்நாட்டில் நெல் பயிரிடுவது எப்படி?' },
    { label: '🧮 விரைவு கணிதம்',     text: '2400 இல் 15% எவ்வளவு?' },
    { label: '🌐 பொது அறிவு',        text: 'பிரான்சின் தலைநகரம் எது?' },
    { label: '💊 ஆரோக்கியம்',        text: 'நீரிழிவு நோயின் அறிகுறிகள் என்ன?' },
    { label: '💻 பைதான் குறியீடு',     text: 'ஒரு எளிய பைதான் ஹலோ வேர்ல்ட் புரோகிராம் எழுதவும்' },
    { label: '💨 தெளிக்கும் நேரம்',     text: 'பயிர்களுக்கு எப்போது பூச்சிக்கொல்லி தெளிக்கக்கூடாது?' },
    { label: '🚜 பிஎம்-கிசான்',        text: 'பிஎம்-கிசான் திட்டத்திற்கு எவ்வாறு விண்ணப்பிப்பது?' },
    { label: '⚖️ அலகுகளை மாற்றவும்',   text: 'ஒரு குவாண்டலில் எத்தனை கிலோகிராம் உள்ளது?' },
  ],
  bn: [
    { label: '🌾 ধান চাষ',           text: 'তামিলনাড়ুতে কীভাবে ধান চাষ করবেন?' },
    { label: '🧮 দ্রুত গণিত',         text: '২৪০০ এর ১৫% কত?' },
    { label: '🌐 সাধারণ জ্ঞান',       text: 'ফ্রান্সের রাজধানী কী?' },
    { label: '💊 স্বাস্থ্য',           text: 'ডায়াবেটিসের লক্ষণগুলি কী কী?' },
    { label: '💻 পাইথন কোড',          text: 'একটি সাধারণ পাইথন হ্যালো ওয়ার্ল্ড প্রোগ্রাম লিখুন' },
    { label: '💨 স্প্রে করার সময়',     text: 'কখন ফসলে কীটনাশক স্প্রে করা উচিত নয়?' },
    { label: '🚜 পিএম-কিসান',        text: 'পিএম-কিসান যোজনার জন্য আবেদন কীভাবে করবেন?' },
    { label: '⚖️ রূপান্তর করুন',      text: 'এক কুইন্টালে কত কিলোগ্রাম হয়?' },
  ],
  as: [
    { label: '🌾 ধান খেতি',           text: 'তামিলনাডুত কেনেকৈ ধান খেতি কৰিব?' },
    { label: '🧮 ক্ষিপ্ৰ গণিত',         text: '২৪০০ ৰ ১৫% কিমান?' },
    { label: '🌐 সাধাৰণ জ্ঞান',       text: 'ফ্ৰান্সৰ ৰাজধানী কি?' },
    { label: '💊 স্বাস্থ্য',           text: 'ডায়াবেটিছৰ লক্ষণসমূহ কি কি?' },
    { label: '💻 পাইথন ক’ড',          text: 'টা সৰল পাইথন হেল্ল’ ৱৰ্ল্ড প্ৰগ্ৰেম লিখক' },
    { label: '💨 স্প্ৰে কৰাৰ সময়',     text: 'শস্যত কেতিয়া কীটনাশক স্প্ৰে কৰিব নালাগে?' },
    { label: '🚜 পিএম-কিষাণ',        text: 'পিএম-কিষাণ আঁচনিৰ বাবে কেনেকৈ আবেদন কৰিব?' },
    { label: '⚖️ ইউনিট সলনি কৰক',    text: 'এক কুইন্টলত কিমান কিলোগ্ৰাম থাকে?' },
  ]
};

const getStoredKey = () => localStorage.getItem('gemini_api_key') || ENV_KEY || '';
const saveKey = (k) => localStorage.setItem('gemini_api_key', k.trim());

const LANG_TTS = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', as: 'as-IN' };

let msgId = 0;
const newMsg = (role, text, extra = {}) => ({
  id: ++msgId, role, text, liked: false,
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  ...extra,
});

// ─── Typing Indicator ─────────────────────────────────────────────────────────
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

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onLike, onCopy, onSpeak, voiceEnabled }) {
  const isAI = msg.role === 'ai';
  const renderText = (raw = '') => {
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
  const [apiKey, setApiKey]         = useState(getStoredKey);
  const [showKeyInput, setShowKey]  = useState(false);
  const [keyDraft, setKeyDraft]     = useState('');
  const [voiceEnabled, setVoice]    = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Set welcome message dynamically on lang change if chat hasn't started
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

  const currentTTSLang = LANG_TTS[i18n.language] || 'en-IN';
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
      let reply;
      const key = apiKey || getStoredKey();

      if (key && key.length > 10) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
        
        const langMap = {
          en: 'English',
          hi: 'Hindi (हिंदी)',
          ta: 'Tamil (தமிழ்)',
          bn: 'Bengali (বাংলা)',
          as: 'Assamese (অসমীয়া)'
        };
        const activeLangName = langMap[i18n.language] || 'English';
        const dynamicPrompt = `${SYSTEM_PROMPT}\n\nIMPORTANT: The user's active language is ${activeLangName}. You MUST write your entire response (including headers, explanations, lists, and greetings) in ${activeLangName}.`;

        const body = {
          system_instruction: { parts: [{ text: dynamicPrompt }] },
          contents: [
            ...messages.slice(-6).map(m => ({
              role: m.role === 'ai' ? 'model' : 'user',
              parts: [{ text: m.text }],
            })),
            { role: 'user', parts: [{ text }] },
          ],
          generationConfig: { temperature: 0.75, maxOutputTokens: 600 },
        };
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || 'API error');
        reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No response received.';
      } else {
        await new Promise(r => setTimeout(r, 700 + Math.random() * 600));
        reply = localFallback(text, i18n.language);
      }

      const aiMsg = newMsg('ai', reply);
      setMessages(prev => [...prev, aiMsg]);

      if (voiceEnabled) {
        setTimeout(() => speak(aiMsg), 200);
      }
    } catch (err) {
      const langUI = UI_TRANSLATIONS[i18n.language] || UI_TRANSLATIONS.en;
      const errMsg = err.message?.includes('API_KEY_INVALID')
        ? langUI.invalidKey
        : err.message?.includes('quota')
        ? langUI.quotaExceeded
        : `${langUI.offlineMode} (${err.message})`;
      setMessages(prev => [...prev, newMsg('ai', errMsg)]);
      toast.error(langUI.failedResponse);
    } finally {
      setIsTyping(false);
    }
  }, [inputText, isTyping, messages, apiKey, voiceEnabled, speak, toast, i18n.language]);

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

  const saveApiKey = () => {
    saveKey(keyDraft);
    setApiKey(keyDraft.trim());
    setShowKey(false);
    setKeyDraft('');
    toast.success('✅ Gemini AI is now active!');
  };

  const activeChips = CHIPS_LOCALIZED[i18n.language] || CHIPS_LOCALIZED.en;

  const placeholders = {
    en: "Ask anything — farming, science, math, coding, history…",
    hi: "कुछ भी पूछें — खेती, विज्ञान, गणित, इतिहास, सामान्य ज्ञान...",
    ta: "விவசாயம், அறிவியல், கணிதம் என எது வேண்டுமானாலும் கேளுங்கள்...",
    bn: "যেকোনো কিছু জিজ্ঞাসা করুন — চাষাবাদ, বিজ্ঞান, গণিত, ইতিহাস...",
    as: "যেকোনো কথা সোধক — খেতি, বিজ্ঞান, গণিত, ইতিহাস..."
  };

  const langUI = UI_TRANSLATIONS[i18n.language] || UI_TRANSLATIONS.en;

  return (
    <div className="chat-page">

      {/* Header */}
      <div className="chat-header card-glass">
        <div className="chat-header-left">
          <div className="chat-header-avatar"><Sparkles size={20} /></div>
          <div>
            <h2 className="chat-header-title">
              {langUI.title}
              <span style={{ fontSize: '0.68rem', color: '#52b788', fontWeight: 600, marginLeft: '8px' }}>
                {apiKey ? langUI.geminiActive : langUI.builtinMode}
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
          {/* Dedicated Chat Language Dropdown Selector */}
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
            onClick={() => { setShowKey(v => !v); setKeyDraft(apiKey); }}
            title="API Key Settings"
          >
            <Key size={13} />
            {apiKey ? langUI.keyActive : langUI.addKey}
          </button>
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

      {/* API Key Panel */}
      {showKeyInput && (
        <div className="card-glass" style={{ padding: '16px', borderColor: 'rgba(82,183,136,0.3)' }}>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginBottom: '10px' }}>
            🔑 Get a <strong style={{ color: '#52b788' }}>free Gemini API key</strong> at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
              style={{ color: '#52b788', textDecoration: 'underline' }}>
              aistudio.google.com/apikey
            </a>{' '}— no billing needed.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              className="input-field"
              style={{ flex: 1, fontSize: '0.85rem' }}
              placeholder="Paste your AIza… key here"
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveApiKey()}
              autoFocus
            />
            <button className="btn-primary" style={{ padding: '10px 18px' }} onClick={saveApiKey}>Save</button>
          </div>
        </div>
      )}

      {/* Quick Chips */}
      <div className="chat-chips-bar">
        {activeChips.map((c, i) => (
          <button key={i} className="quick-chip" onClick={() => sendMessage(c.text)} id={`chip-${i}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages card-glass" id="chat-messages">
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
      <div className="chat-input-row card-glass">
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
