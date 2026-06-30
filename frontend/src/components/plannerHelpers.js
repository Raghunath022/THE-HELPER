export const getRegionalTrends = (state, lang = 'en') => {
  const trends = {
    en: {
      'Uttar Pradesh': { mainCrops: 'Wheat, Paddy, Sugarcane', soilType: 'Sandy Loam', waterSavings: '15%' },
      'Maharashtra': { mainCrops: 'Cotton, Soybeans, Sugarcane', soilType: 'Black Cotton', waterSavings: '20%' },
      'Tamil Nadu': { mainCrops: 'Paddy, Groundnut, Bananas', soilType: 'Clayey Loam', waterSavings: '18%' },
      'Bihar': { mainCrops: 'Paddy, Maize, Wheat', soilType: 'Alluvial soil', waterSavings: '12%' },
      'Karnataka': { mainCrops: 'Ragi, Maize, Coffee', soilType: 'Red Loamy', waterSavings: '22%' }
    },
    hi: {
      'Uttar Pradesh': { mainCrops: 'गेहूं, धान, गन्ना', soilType: 'बलुई दोमट', waterSavings: '15%' },
      'Maharashtra': { mainCrops: 'कपास, सोयाबीन, गन्ना', soilType: 'काली कपास मिट्टी', waterSavings: '20%' },
      'Tamil Nadu': { mainCrops: 'धान, मूंगफली, केला', soilType: 'चिकनी दोमट', waterSavings: '18%' },
      'Bihar': { mainCrops: 'धान, मक्का, गेहूं', soilType: 'जलोढ़ मिट्टी', waterSavings: '12%' },
      'Karnataka': { mainCrops: 'रागी, मक्का, कॉफी', soilType: 'लाल दोमट', waterSavings: '22%' }
    },
    ta: {
      'Uttar Pradesh': { mainCrops: 'கோதுமை, நெல், கரும்பு', soilType: 'மணல் கலந்த வண்டல் மண்', waterSavings: '15%' },
      'Maharashtra': { mainCrops: 'பருத்தி, சோயாபீன்ஸ், கரும்பு', soilType: 'கரிசல் மண்', waterSavings: '20%' },
      'Tamil Nadu': { mainCrops: 'நெல், வேர்க்கடலை, வாழை', soilType: 'களிமண் வண்டல் மண்', waterSavings: '18%' },
      'Bihar': { mainCrops: 'நெல், சோளம், கோதுமை', soilType: 'வண்டல் மண்', waterSavings: '12%' },
      'Karnataka': { mainCrops: 'ராகி, சோளம், காபி', soilType: 'செம்மண் வண்டல் மண்', waterSavings: '22%' }
    },
    bn: {
      'Uttar Pradesh': { mainCrops: 'গম, ধান, আখ', soilType: 'বেলে দোআঁশ', waterSavings: '15%' },
      'Maharashtra': { mainCrops: 'তুলা, সয়াবিন, আখ', soilType: 'কালো তুলো মাটি', waterSavings: '20%' },
      'Tamil Nadu': { mainCrops: 'ধান, চিনাবাদাম, কলা', soilType: 'কাদামাটি দোআঁশ', waterSavings: '18%' },
      'Bihar': { mainCrops: 'ধান, ভুট্টা, গম', soilType: 'পলি মাটি', waterSavings: '12%' },
      'Karnataka': { mainCrops: 'রাগী, ভুট্টা, কফি', soilType: 'লাল দোআঁশ', waterSavings: '22%' }
    },
    as: {
      'Uttar Pradesh': { mainCrops: 'ঘেঁহু, ধান, কুঁহিয়াৰ', soilType: 'বালিচহীয়া দোমোজা', waterSavings: '15%' },
      'Maharashtra': { mainCrops: 'কপাহ, চয়াবিন, কুঁহিয়াৰ', soilType: 'কলা কপাহ মাটি', waterSavings: '20%' },
      'Tamil Nadu': { mainCrops: 'ধান, বাদাম, কল', soilType: 'কাদামাটি দোমোজা', waterSavings: '18%' },
      'Bihar': { mainCrops: 'ধান, গোমধান, ঘেঁহু', soilType: 'পলসুৱা মাটি', waterSavings: '12%' },
      'Karnataka': { mainCrops: 'ৰাগী, গোমধান, কফি', soilType: 'ৰঙা পলসুৱা মাটি', waterSavings: '22%' }
    }
  };

  const activeLang = trends[lang] || trends['en'];
  return activeLang[state] || { mainCrops: state === 'Tamil Nadu' ? 'Paddy' : 'Wheat', soilType: 'Loamy', waterSavings: '10%' };
};

export const getDecisionData = (crop, soil, state, lang = 'en') => {
  let sowingScore = 85;
  let yieldPerAc = 2.0;
  let cropPricePerTon = 22000;

  // Localized advisories database
  const advisories = {
    en: {
      Paddy: {
        irrigationAdvisory: "Rain expected in 2 days (15mm). Delay irrigation and clear drainage paths.",
        fertilizerAdvisory: "Apply nitrogen-rich fertilizer (Urea) at transplanting stage.",
        weatherWarning: "Heavy rain alert: check field bounds to prevent run-offs.",
        weeklyPlan: [
          "Prepare nursery beds and treat seed varieties with bio-fungicides.",
          "Wet land tilling and puddling for main field preparation.",
          "Inundate fields to 2-3 cm standing water and transplant seedlings.",
          "Check bunds for leaks and perform first weeding.",
          "Top-dress with nitrogen fertilizer (Urea).",
          "Monitor for Leaf Folder pests and stem borers.",
          "Maintain stable standing water level and inspect crop health."
        ]
      },
      Tomato: {
        irrigationAdvisory: "High evaporation rates. Irrigate daily during cooler morning hours.",
        fertilizerAdvisory: "Incorporate well-rotted manure. Apply phosphorus-heavy starter fertilizer.",
        weatherWarning: "Mild heat alert: use mulching to save soil moisture.",
        weeklyPlan: [
          "Mix organic compost and prepare raised soil beds.",
          "Install drip irrigation lines and check water emitter flow.",
          "Transplant tomato seedlings in late evening hours.",
          "Apply crop-straw mulching around base of tomato vines.",
          "Monitor for aphids and apply organic neem oil spray.",
          "Staking: Tie main stems to bamboo stakes for support.",
          "Apply calcium nitrate to prevent blossom end rot."
        ]
      },
      Potato: {
        irrigationAdvisory: "Water moderately every 4-5 days. Avoid waterlogging to prevent tuber rot.",
        fertilizerAdvisory: "Apply potassium-rich fertilizer during hilling to promote tuber growth.",
        weatherWarning: "High humidity warning: watch for early blight signs.",
        weeklyPlan: [
          "Prepare deep, loose soil beds; mix in farmyard manure.",
          "Sow certified seed tubers at 8-10 cm depth.",
          "Perform first hilling of soil around young plants (15cm tall).",
          "Irrigate uniformly; check soil moisture at 4 inch depth.",
          "Preemptive spray of copper fungicide to ward off Blight.",
          "Perform light weeding and second hilling.",
          "Monitor foliage for potato beetle larvae."
        ]
      },
      Wheat: {
        irrigationAdvisory: "Perform irrigation during Critical Crown Root Initiation (CRI) stage.",
        fertilizerAdvisory: "Apply basal NPK dose (120:60:40 kg/ha).",
        weatherWarning: "Optimal cool weather: ideal for uniform germination.",
        weeklyPlan: [
          "Prepare dry, fine seedbed with deep tilling.",
          "Sow wheat seeds in rows spaced 22.5cm apart.",
          "First critical irrigation (CRI stage) - 21 days after sowing.",
          "Apply post-emergence weedicide if weeds present.",
          "Top-dress with remaining half dose of Nitrogen.",
          "Monitor soil moisture; perform second irrigation if dry.",
          "Inspect leaves for rust pustules."
        ]
      },
      default: {
        irrigationAdvisory: "Maintain moderate moisture. Deep water once a week.",
        fertilizerAdvisory: "Apply zinc sulfate to avoid nutrient chlorosis.",
        weatherWarning: "Normal regional weather: standard schedule applies.",
        weeklyPlan: [
          "Deep plowing and incorporating compost.",
          "Sow seeds at 3-5cm depth with 20cm spacing.",
          "First weeding and soil earthing-up around plant base.",
          "Irrigation during flowering/tasseling stages.",
          "Apply balanced NPK fertilizer dose.",
          "Inspect for fall armyworm infestation.",
          "Ensure proper soil aeration and light watering."
        ]
      }
    },
    hi: {
      Paddy: {
        irrigationAdvisory: "2 दिनों में बारिश की उम्मीद (15 मिमी)। सिंचाई में देरी करें और जल निकासी के रास्ते साफ करें।",
        fertilizerAdvisory: "रोपाई के चरण में नाइट्रोजन युक्त उर्वरक (यूरिया) डालें।",
        weatherWarning: "भारी बारिश की चेतावनी: अपवाह को रोकने के लिए खेत की सीमाओं की जांच करें।",
        weeklyPlan: [
          "नर्सरी बेड तैयार करें और बीज की किस्मों को बायो-फंगीसाइड्स से उपचारित करें।",
          "मुख्य खेत की तैयारी के लिए गीली भूमि की जुताई और गारा तैयार करें।",
          "खेतों को 2-3 सेमी खड़े पानी से भरें और रोपाई करें।",
          "मेड़ों में रिसाव की जांच करें और पहली निराई करें।",
          "नाइट्रोजन उर्वरक (यूरिया) का टॉप-ड्रेसिंग करें।",
          "लीफ फोल्डर कीटों और तना छेदकों की निगरानी करें।",
          "स्थिर खड़े पानी का स्तर बनाए रखें और फसल के स्वास्थ्य का निरीक्षण करें।"
        ]
      },
      Tomato: {
        irrigationAdvisory: "उच्च वाष्पीकरण दर। सुबह के ठंडे घंटों में दैनिक सिंचाई करें।",
        fertilizerAdvisory: "अच्छी तरह से सड़ी हुई खाद मिलाएं। फास्फोरस युक्त स्टार्टर उर्वरक डालें।",
        weatherWarning: "हल्की गर्मी की चेतावनी: मिट्टी की नमी बचाने के लिए मल्चिंग का उपयोग करें।",
        weeklyPlan: [
          "जैविक खाद मिलाएं और उठी हुई क्यारियां तैयार करें।",
          "ड्रिप सिंचाई लाइनें स्थापित करें और ड्रिपर्स के प्रवाह की जांच करें।",
          "देर शाम के समय टमाटर के पौधों की रोपाई करें।",
          "टमाटर की लताओं के आधार के चारों ओर पुआल की मल्चिंग करें।",
          "माहू (aphids) की निगरानी करें और जैविक नीम तेल का छिड़काव करें।",
          "सहारा देना: मुख्य तनों को बांस के खंभों से बांधें।",
          "ब्लॉसम एंड रोट को रोकने के लिए कैल्शियम नाइट्रेट डालें।"
        ]
      },
      Potato: {
        irrigationAdvisory: "हर 4-5 दिनों में मध्यम सिंचाई करें। कंदों को सड़ने से बचाने के लिए जलभराव से बचें।",
        fertilizerAdvisory: "कंदों के विकास को बढ़ावा देने के लिए मिट्टी चढ़ाते समय पोटेशियम युक्त उर्वरक डालें।",
        weatherWarning: "उच्च आर्द्रता की चेतावनी: अगेती झुलसा के लक्षणों पर नजर रखें।",
        weeklyPlan: [
          "गहरी, ढीली क्यारियां तैयार करें; गोबर की खाद मिलाएं।",
          "प्रमाणित बीज कंदों को 8-10 सेमी गहराई पर बोएं।",
          "छोटे पौधों (15 सेमी लंबे) के चारों ओर पहली बार मिट्टी चढ़ाएं।",
          "समान रूप से सिंचाई करें; 4 इंच की गहराई पर मिट्टी की नमी की जांच करें।",
          "झुलसा रोग से बचाने के लिए कॉपर कवकनाशी का छिड़काव करें।",
          "हल्की निराई और दूसरी बार मिट्टी चढ़ाने का काम करें।",
          "आलू के भृंग (beetle) के लार्वा के लिए पत्तियों की निगरानी करें।"
        ]
      },
      Wheat: {
        irrigationAdvisory: "क्राउन रूट इनीशिएशन (CRI) के महत्वपूर्ण चरण के दौरान सिंचाई करें।",
        fertilizerAdvisory: "मूल एनपीके खुराक (120:60:40 किग्रा/हेक्टेयर) डालें।",
        weatherWarning: "इष्टतम ठंडा मौसम: समान अंकुरण के लिए आदर्श।",
        weeklyPlan: [
          "गहरी जुताई के साथ सूखी, महीन क्यारी तैयार करें।",
          "गेहूं के बीजों को 22.5 सेमी की दूरी पर पंक्तियों में बोएं।",
          "पहली महत्वपूर्ण सिंचाई (सीआरआई चरण) - बुवाई के 21 दिन बाद।",
          "यदि खरपतवार मौजूद हों तो उद्भव-पश्चात खरपतवारनाशी डालें।",
          "नाइट्रोजन की शेष आधी खुराक के साथ टॉप-ड्रेस करें।",
          "मिट्टी की नमी की निगरानी करें; सूखा होने पर दूसरी सिंचाई करें।",
          "पत्तियों पर रस्ट के धब्बों की जांच करें।"
        ]
      },
      default: {
        irrigationAdvisory: "मध्यम नमी बनाए रखें। सप्ताह में एक बार गहरा पानी दें।",
        fertilizerAdvisory: "पोषक तत्वों की क्लोरोसिस से बचने के लिए जिंक सल्फेट डालें।",
        weatherWarning: "सामान्य क्षेत्रीय मौसम: मानक कार्यक्रम लागू होता है।",
        weeklyPlan: [
          "गहरी जुताई करें और कम्पोस्ट खाद मिलाएं।",
          "20 सेमी की दूरी पर 3-5 सेमी गहराई में बीज बोएं।",
          "पहली निराई और पौधे के आधार के चारों ओर मिट्टी चढ़ाएं।",
          "फूल आने/मंजरियां निकलने की अवस्था में सिंचाई करें।",
          "संतुलित एनपीके उर्वरक की खुराक डालें।",
          "फॉल आर्मीवॉर्म (कीट) के प्रकोप की जांच करें।",
          "उचित मृदा वातन और हल्की सिंचाई सुनिश्चित करें।"
        ]
      }
    },
    ta: {
      Paddy: {
        irrigationAdvisory: "2 நாட்களில் மழை எதிர்பார்க்கப்படுகிறது (15 மிமீ). பாசனத்தை தாமதப்படுத்தி வடிகால் வழிகளை சுத்தம் செய்யவும்.",
        fertilizerAdvisory: "நாற்று நடுதல் நிலையில் நைட்ரஜன் நிறைந்த உரத்தை (யூரியா) பயன்படுத்தவும்.",
        weatherWarning: "அதிவேக மழை எச்சரிக்கை: நீர் வெளியேறுவதைத் தடுக்க வயல் வரப்புகளைச் சரிபார்க்கவும்.",
        weeklyPlan: [
          "நாற்றங்கால் படுக்கைகளைத் தயாரித்து, விதைகளை உயிர்-பூஞ்சைக் கொல்லிகளுடன் நேர்த்தி செய்யவும்.",
          "முக்கிய வயல் தயாரிப்பிற்காக உழவு மற்றும் சேறடித்தல் செய்யவும்.",
          "வயல்களில் 2-3 செமீ தேங்கிய நீரை பராமரித்து நாற்றுகளை நடவு செய்யவும்.",
          "வரப்புகளில் கசிவுகளைச் சரிபார்த்து முதல் களை எடுக்கவும்.",
          "நைட்ரஜன் உரத்தை (யூரியா) மேலுரமாக இடவும்.",
          "இலைச்சுருட்டுப் புழு மற்றும் தண்டு துளைப்பான் பூச்சிகளைக் கண்காணிக்கவும்.",
          "நிலையான தேங்கிய நீர் மட்டத்தை பராமரித்து பயிர் ஆரோக்கியத்தை கண்காணிக்கவும்."
        ]
      },
      Tomato: {
        irrigationAdvisory: "அதிக ஆவியாதல் விகிதம். குளிர்ந்த காலை நேரங்களில் தினமும் பாசனம் செய்யவும்.",
        fertilizerAdvisory: "நன்றாக மக்கிய தொழு உரத்தை இடவும். பாஸ்பரஸ் அதிகம் உள்ள உரத்தைப் பயன்படுத்தவும்.",
        weatherWarning: "மிதமான வெப்ப எச்சரிக்கை: மண்ணின் ஈரப்பதத்தைக் காக்க மூடாக்கு பயன்படுத்தவும்.",
        weeklyPlan: [
          "கரிம உரம் கலந்து மேடான பாத்திகளைத் தயாரிக்கவும்.",
          "சொட்டு நீர் பாசனக் குழாய்களை நிறுவி நீர் வெளியேற்றத்தைச் சரிபார்க்கவும்.",
          "தக்காளி நாற்றுகளை மாலை நேரத்தில் நடவு செய்யவும்.",
          "தக்காளி செடிகளின் கோடையைச் சுற்றி வைக்கோல் மூடாக்கு இடவும்.",
          "அசுவினி பூச்சிகளைக் கண்காணித்து கரிம வேப்ப எண்ணெய் தெளிக்கவும்.",
          "தாங்கு கோல் கட்டுதல்: தண்டு பகுதியை மூங்கில் கம்புகளுடன் கட்டவும்.",
          "பூ அழுகல் நோயைத் தடுக்க கால்சியம் நைட்ரேட் இடவும்."
        ]
      },
      Potato: {
        irrigationAdvisory: "4-5 நாட்களுக்கு ஒருமுறை மிதமாக நீர் பாய்ச்சவும். கிழங்கு அழுகலைத் தடுக்க நீர் தேங்குவதைத் தவிர்க்கவும்.",
        fertilizerAdvisory: "கிழங்கு வளர்ச்சியை ஊக்குவிக்க மண் அணைக்கும் போது பொட்டாசியம் உரங்களை இடவும்.",
        weatherWarning: "அதிக ஈரப்பதம் எச்சரிக்கை: அगेதி झुलसा (Early blight) அறிகுறிகளைக் கண்காணிக்கவும்.",
        weeklyPlan: [
          "ஆழமான, தளர்வான மண் படுக்கைகளைத் தயாரித்து தொழு உரம் கலக்கவும்.",
          "சான்றளிக்கப்பட்ட விதை கிழங்குகளை 8-10 செமீ ஆழத்தில் நடவும்.",
          "இளம் செடிகளைச் சுற்றி (15 செமீ உயரம்) முதல் மண் அணைப்பைச் செய்யவும்.",
          "சீரான பாசனம்; 4 இன்ச் ஆழத்தில் மண்ணின் ஈரப்பதத்தைச் சரிபார்க்கவும்.",
          "நோயாளி படைகளைத் தடுக்க தாமிர பூஞ்சைக் கொல்லி தெளிக்கவும்.",
          "லேசான களை எடுப்பு மற்றும் இரண்டாவது மண் அணைப்பைச் செய்யவும்.",
          "வண்டுகள் புழுக்கள் தாக்குதலுக்கு இலைகளைக் கண்காணிக்கவும்."
        ]
      },
      Wheat: {
        irrigationAdvisory: "கிரீட வேர் துவக்க (CRI) முக்கிய நிலையில் நீர்ப்பाசனம் செய்யவும்.",
        fertilizerAdvisory: "அடிப்படை NPK அளவை (120:60:40 கிலோ/ஹெக்டேர்) இடவும்.",
        weatherWarning: "சிறந்த குளிர்ந்த வானிலை: சீரான முளைப்புக்கு உகந்தது.",
        weeklyPlan: [
          "ஆழமான உழவுடன் உலர்ந்த, மென்மையான விதைப்படுக்கையைத் தயாரிக்கவும்.",
          "கோதுமை விதைகளை 22.5 செமீ இடைவெளியில் வரிசையாக விதைக்கவும்.",
          "முதல் முக்கிய பாசனம் (CRI நிலை) - விதைத்த 21 நாட்களுக்குப் பிறகு.",
          "களைகள் இருந்தால் முளைப்புக்கு பிந்தைய களைக்கொல்லியை இடவும்.",
          "மீதமுள்ள பாதி அளவு நைட்ரஜனை மேலுரமாக இடவும்.",
          "மண் ஈரப்பதத்தைக் கண்காணிக்கவும்; வறண்டதாக இருந்தால் இரண்டாவது பாசனம் செய்யவும்.",
          "இலைகளில் துரு நோய் புள்ளிகள் உள்ளதா என சரிபார்க்கவும்."
        ]
      },
      default: {
        irrigationAdvisory: "மிதமான ஈரப்பதத்தை பராமரிக்கவும். வாரத்திற்கு ஒரு முறை ஆழமாக நீர் பாய்ச்சவும்.",
        fertilizerAdvisory: "ஊட்டச்சத்து குறைபாடு இலை வெளுப்பைத் தவிர்க்க துத்தநாக சல்பேட் இடவும்.",
        weatherWarning: "சாதாரண பிராந்திய வானிலை: நிலையான கால அட்டவணை பொருந்தும்.",
        weeklyPlan: [
          "ஆழமாக உழுது உரம் கலக்கவும்.",
          "20 செமீ இடைவெளியில் 3-5 செமீ ஆழத்தில் விதைகளை விதைக்கவும்.",
          "முதல் களை எடுப்பு மற்றும் செடியின் கோடையில் மண் அணைத்தல்.",
          "பூக்கும்/மஞ்சரி தோன்றும் நிலைகளில் பாசனம் செய்யவும்.",
          "சமச்சீர் NPK உர அளவை இடவும்.",
          "படைப்புழு தாக்குதல் உள்ளதா என கண்காணிக்கவும்.",
          "மண் காற்றோட்டம் மற்றும் லேசான பாசனத்தை உறுதி செய்யவும்."
        ]
      }
    },
    bn: {
      Paddy: {
        irrigationAdvisory: "২ দিনের মধ্যে বৃষ্টির সম্ভাবনা (১৫ মিমি)। সেচ বিলম্বিত করুন এবং নিকাশী পথ পরিষ্কার করুন।",
        fertilizerAdvisory: "রোপণ পর্যায়ে নাইট্রোজেন সমৃদ্ধ সার (ইউরিয়া) প্রয়োগ করুন।",
        weatherWarning: "ভারী বৃষ্টির সতর্কতা: জল বয়ে যাওয়া প্রতিরোধ করতে মাঠের সীমানা পরীক্ষা করুন।",
        weeklyPlan: [
          "নার্সারি বেড প্রস্তুত করুন এবং বীজ জৈব-ছত্রাকনাশক দিয়ে শোধন করুন।",
          "মূল জমি তৈরির জন্য ভেজা জমি চাষ এবং কাদা তৈরি করুন।",
          "জমিতে ২-৩ সেমি জল জমা করে চারা রোপণ করুন।",
          "আইলগুলিতে লিক পরীক্ষা করুন এবং প্রথম নিড়ানি দিন।",
          "নাইট্রোজেন সার (ইউরিয়া) উপরি-প্রয়োগ করুন।",
          "পাতা মোড়ানো পোকা এবং কাণ্ড ছিদ্রকারী পোকা পর্যবেক্ষণ করুন।",
          "স্থির জলের স্তর বজায় রাখুন এবং ফসলের স্বাস্থ্য পরীক্ষা করুন।"
        ]
      },
      Tomato: {
        irrigationAdvisory: "উচ্চ বাষ্পীভবন হার। সকালের ঠান্ডা সময়ে প্রতিদিন সেচ দিন।",
        fertilizerAdvisory: "ভালভাবে পচানো গোবর সার মেশান। ফসরাস সমৃদ্ধ স্টার্টার সার প্রয়োগ করুন।",
        weatherWarning: "হালকা তাপপ্রবাহের সতর্কতা: মাটির আর্দ্রতা বাঁচাতে মালচিং ব্যবহার করুন।",
        weeklyPlan: [
          "জৈব সার মেশান এবং উঁচু মাটি বেড প্রস্তুত করুন।",
          "ড্রিপ সেচ লাইন ইনস্টল করুন এবং ড্রিপারের প্রবাহ পরীক্ষা করুন।",
          "বিকেলের শেষ ভাগে টমেটোর চারা রোপণ করুন।",
          "টমেটো গাছের গোড়ার চারপাশে খড়ের মালচিং প্রয়োগ করুন।",
          "জাবপোকা (aphids) পর্যবেক্ষণ করুন এবং জৈব নিম তেল স্প্রে করুন।",
          "খুঁটি দেওয়া: সমর্থনের জন্য প্রধান কাণ্ড বাঁশের খুঁটির সাথে বাঁধুন।",
          "ব্লসম এন্ড রট প্রতিরোধ করতে ক্যালসিয়াম নাইট্রেট প্রয়োগ করুন।"
        ]
      },
      Potato: {
        irrigationAdvisory: "প্রতি ৪-৫ দিনে মাঝারি সেচ দিন। কন্দ পচা রোধ করতে জল জমা এড়িয়ে চলুন।",
        fertilizerAdvisory: "কন্দ বৃদ্ধি প্রচারের জন্য মাটি তোলার সময় পটাশ সমৃদ্ধ সার প্রয়োগ করুন।",
        weatherWarning: "উচ্চ আর্দ্রতার সতর্কতা: আগাম ধসা (early blight) লক্ষণ লক্ষ্য করুন।",
        weeklyPlan: [
          "গভীর, আলগা মাটির বেড প্রস্তুত করুন; খামারের সার মেশান।",
          "৮-১০ সেমি গভীরতায় প্রত্যয়িত বীজ কন্দ বপন করুন।",
          "ছোট গাছের (১৫ সেমি লম্বা) চারপাশে প্রথম মাটি তুলুন।",
          "সমভাবে সেচ দিন; ৪ ইঞ্চি গভীরতায় মাটির আর্দ্রতা পরীক্ষা করুন।",
          "ঝুলসা রোগ প্রতিরোধ করতে তাম্র ছত্রাকনাশক অগ্রিম স্প্রে করুন।",
          "হালকা নিড়ানি এবং দ্বিতীয়বার মাটি তোলার কাজ করুন।",
          "আলুর বিটল লার্ভার জন্য পাতাগুলি পর্যবেক্ষণ করুন।"
        ]
      },
      Wheat: {
        irrigationAdvisory: "ক্রাউন রুট ইনিশিয়েশন (CRI) গুরুত্বপূর্ণ পর্যায়ে সেচ দিন।",
        fertilizerAdvisory: "মূল এনপিকে ডোজ (১২০:৬০:৪০ কেজি/হেক্টর) প্রয়োগ করুন।",
        weatherWarning: "অনুকূল ঠান্ডা আবহাওয়া: অভিন্ন অঙ্কুরোদগমের জন্য আদর্শ।",
        weeklyPlan: [
          "গভীর চাষের সাথে শুকনো, সূক্ষ্ম বীজতলা প্রস্তুত করুন।",
          "২২.৫ সেমি দূরত্বে সারিবদ্ধভাবে গম বীজ বপন করুন।",
          "প্রথম গুরুত্বপূর্ণ সেচ (CRI পর্যায়) - বপনের ২১ দিন পরে।",
          "আগাছা থাকলে আগাছানাশক প্রয়োগ করুন।",
          "অবশিষ্ট অর্ধেক নাইট্রোজেন উপরি-প্রয়োগ করুন।",
          "মাটির আর্দ্রতা নিরীক্ষণ করুন; শুষ্ক হলে দ্বিতীয় সেচ দিন।",
          "পাতায় মরিচা রোগের দাগ পরীক্ষা করুন।"
        ]
      },
      default: {
        irrigationAdvisory: "মাঝারি আর্দ্রতা বজায় রাখুন। সপ্তাহে একবার গভীর সেচ দিন।",
        fertilizerAdvisory: "পুষ্টির অভাবজনিত ক্লোরোসিস এড়াতে জিঙ্ক সালফেট প্রয়োগ করুন।",
        weatherWarning: "স্বাভাবিক আঞ্চলিক আবহাওয়া: আদর্শ সময়সূচী প্রযোজ্য।",
        weeklyPlan: [
          "গভীর লাঙল চাষ এবং কম্পোস্ট সার প্রয়োগ।",
          "২০ সেমি দূরত্বে ৩-৫ সেমি গভীরতায় বীজ বপন করুন।",
          "প্রথম নিড়ানি দিন এবং গাছের গোড়ায় মাটি তুলে দিন।",
          "ফুল আসার সময় সেচ দিন।",
          "সুষম এনপিকে সারের ডোজ প্রয়োগ করুন।",
          "ফল আর্মিওয়ার্ম আক্রমণ পরীক্ষা করুন।",
          "সঠিক বায়ু চলাচল এবং হালকা সেচ নিশ্চিত করুন।"
        ]
      }
    },
    as: {
      Paddy: {
        irrigationAdvisory: "২ দিনৰ ভিতৰত বৰষুণৰ সম্ভাৱনা (১৫ মিমি)। জলসিঞ্চন পলম কৰক আৰু নিকাশী পথ পৰিষ্কাৰ কৰক।",
        fertilizerAdvisory: "ৰোপণৰ সময়ত নাইট্ৰ'জেনসমৃদ্ধ সাৰ (ইউৰিয়া) প্ৰয়োগ কৰক।",
        weatherWarning: "ধাৰাসাৰ বৰষুণৰ সতৰ্কবাণী: পানী ওলাই যোৱা ৰোধ কৰিবলৈ পথাৰৰ সীমানা পৰীক্ষা কৰক।",
        weeklyPlan: [
          "নাৰ্ছাৰী বেড প্ৰস্তুত কৰক আৰু বীজসমূহ জৈৱ-ছত্ৰাকনাশকেৰে শোধন কৰক।",
          "মূল পথাৰ প্ৰস্তুত কৰিবলৈ তিতা মাটি হাল বাই বোকা কৰক।",
          "পথাৰত ২-৩ ছেমি পানী জমা কৰি পুলি ৰোপণ কৰক।",
          "আইলসমূহ পৰীক্ষা কৰক আৰু প্ৰথমবাৰ বন নিৰাওক।",
          "নাইট্ৰ'জেন সাৰ (ইউৰিয়া) ওপৰত প্ৰয়োগ কৰক।",
          "পাত মেৰিওৱা পোক আৰু কাণ্ড বিন্ধা পোক নিৰীক্ষণ কৰক।",
          "পানীৰ স্থিৰতা বজাই ৰাখক আৰু শস্যৰ স্বাস্থ্য পৰীক্ষা কৰক।"
        ]
      },
      Tomato: {
        irrigationAdvisory: "উচ্চ বাষ্পীভৱনৰ হাৰ। পুৱাৰ ঠাণ্ডা সময়ত দৈনিক জলসিঞ্চন কৰক।",
        fertilizerAdvisory: "ভালদৰে পচি যোৱা গোবৰ সাৰ মিলাওক। ফচফৰাছযুক্ত ষ্টাৰ্টাৰ সাৰ প্ৰয়োগ কৰক।",
        weatherWarning: "মৃদু গৰমৰ সতৰ্কবাণী: মাটিৰ আৰ্দ্ৰতা ৰক্ষা কৰিবলৈ মালচিং ব্যৱহাৰ কৰক।",
        weeklyPlan: [
          "জৈৱ সাৰ মিলাওক আৰু ওখকৈ মাটিৰ বেড প্ৰস্তুত কৰক।",
          "ড্ৰিপ জলসিঞ্চন লাইন স্থাপন কৰক আৰু পানী ওলোৱাৰ প্ৰবাহ পৰীক্ষা কৰক।",
          "আবেলি সময়ত টমেটোৰ পুলি ৰোপণ কৰক।",
          "টমেটো গছৰ গোৰাত নৰাৰে মালচিং কৰক।",
          "জাব পোক নিৰীক্ষণ কৰক আৰু জৈৱিক নিম তেল স্প্ৰে কৰক।",
          "খুঁটি দিয়া: সমৰ্থনৰ বাবে বাঁহৰ খুঁটিৰ সৈতে বান্ধক।",
          "ব্লছম এণ্ড ৰট প্ৰতিৰোধ কৰিবলৈ কেলচিয়াম নাইট্ৰেট প্ৰয়োগ কৰক।"
        ]
      },
      Potato: {
        irrigationAdvisory: "প্ৰতি ৪-৫ দিনৰ অন্তৰালত মধ্যমীয়া পানী দিয়ক। আলু পচা ৰোধ কৰিবলৈ পানী জমা হ'বলৈ নিদিব।",
        fertilizerAdvisory: "আলুৰ বৃদ্ধিৰ বাবে মাটি চপোৱাৰ সময়ত পটাছিয়ামযুক্ত সাৰ প্ৰয়োগ কৰক।",
        weatherWarning: "উচ্চ আৰ্দ্ৰতাৰ সতৰ্কবাণী: আগতীয়া ঝুলসা ৰোগৰ লক্ষণসমূহ নিৰীক্ষণ কৰক।",
        weeklyPlan: [
          "গভীৰ আৰু ঢিলা মাটিৰ বেড প্ৰস্তুত কৰক; গোবৰ সাৰ মিলাওক।",
          "৮-১০ ছেমি গভীৰতাত প্ৰমাণিত বীজ আলু ৰোপণ কৰক।",
          "পুলি গছৰ (১৫ ছেমি ওখ) চাৰিওফালে প্ৰথমবাৰ মাটি চপাওক।",
          "সমভাৱে জলসিঞ্চন কৰক; ৪ ইঞ্চি গভীৰতাত মাটিৰ আৰ্দ্ৰতা পৰীক্ষা কৰক।",
          "ঝুলসা ৰোগ প্ৰতিৰোধ কৰিবলৈ তামযুক্ত ছত্ৰাকনাশক আগতীয়াকৈ স্প্ৰে কৰক।",
          "পাতলীয়া বন নিৰাওক আৰু দ্বিতীয়বাৰ মাটি চপাওক।",
          "পাতসমূহ পোকৰ আক্ৰমণৰ বাবে পৰীক্ষা কৰক।"
        ]
      },
      Wheat: {
        irrigationAdvisory: "শিপা ওলোৱাৰ (CRI) গুৰুত্বপূৰ্ণ সময়ছোৱাত জলসিঞ্চন কৰক।",
        fertilizerAdvisory: "প্ৰাৰম্ভিক NPK প্ৰয়োগ কৰক (১২০:৬০:৪০ কেজি/হেক্টৰ)।",
        weatherWarning: "অনুকূল ঠাণ্ডা বতৰ: সমান গজালিৰ বাবে আদৰ্শ।",
        weeklyPlan: [
          "গভীৰ হাল বাই শুকান আৰু মিহি বীজতলা প্ৰস্তুত কৰক।",
          "২২.৫ ছেমি দূৰত্বত শাৰী শাৰীকৈ ঘেঁহুৰ বীজ সিঁচক।",
          "প্ৰথম গুৰুত্বপূৰ্ণ জলসিঞ্চন (CRI সময়) - বীজ সিঁচাৰ ২১ দিনৰ পিছত।",
          "বন ওলালে উপযুক্ত বননাশক প্ৰয়োগ কৰক।",
          "নাইট্ৰ'জেনৰ বাকী থকা আধা অংশ ওপৰত প্ৰয়োগ কৰক।",
          "মাটিৰ আৰ্দ্ৰতা পৰীক্ষা কৰক; শুকান হ'লে দ্বিতীয়বাৰ জলসিঞ্চন কৰক।",
          "পাতত মৰিচা ৰোগৰ দাগ পৰীক্ষা কৰক।"
        ]
      },
      default: {
        irrigationAdvisory: "মধ্যমীয়া আৰ্দ্ৰতা বজাই ৰাখক। সপ্তাহত এবাৰ ভালদৰে পানী দিয়ক।",
        fertilizerAdvisory: "পুষ্টিহীনতা ৰোধ কৰিবলৈ জিংক ছালফেট প্ৰয়োগ কৰক।",
        weatherWarning: "স্বাভাৱিক আঞ্চলিক বতৰ: সাধারণ সময়সূচী প্ৰযোজ্য।",
        weeklyPlan: [
          "গভীৰ হাল বোৱক আৰু গোবৰ সাৰ মিলাওক।",
          "২০ ছেমি দূৰত্বত ৩-৫ ছেমি গভীৰতাত বীজ সিঁচক।",
          "প্ৰথম বন নিৰাওক আৰু গছৰ গোৰাত মাটি চপাওক।",
          "ফুল ফুলাৰ সময়ত জলসিঞ্চন কৰক।",
          "সুষম NPK সাৰ প্ৰয়োগ কৰক।",
          "ফল আৰ্মীৱৰ্মৰ আক্ৰমণ পৰীক্ষা কৰক।",
          "মাটিৰ বায়ু চলাচল আৰু পাতলীয়া জলসিঞ্চন নিশ্চিত কৰক।"
        ]
      }
    }
  };

  const activeLang = advisories[lang] || advisories['en'];
  const data = activeLang[crop] || activeLang['default'];

  // Keep numerical/yield factors independent of language
  if (crop === 'Paddy') {
    sowingScore = 94;
    yieldPerAc = 2.4;
    cropPricePerTon = 22000;
  } else if (crop === 'Tomato') {
    sowingScore = 78;
    yieldPerAc = 8.5;
    cropPricePerTon = 18000;
  } else if (crop === 'Potato') {
    sowingScore = 82;
    yieldPerAc = 9.0;
    cropPricePerTon = 15000;
  } else if (crop === 'Wheat') {
    sowingScore = 88;
    yieldPerAc = 1.8;
    cropPricePerTon = 24000;
  } else {
    sowingScore = 84;
    yieldPerAc = 3.2;
    cropPricePerTon = 19500;
  }

  if (soil === 'Loamy') yieldPerAc *= 1.1;
  if (soil === 'Sandy') yieldPerAc *= 0.85;
  if (soil === 'Clay') yieldPerAc *= 0.95;

  return {
    sowingScore,
    irrigationAdvisory: data.irrigationAdvisory,
    fertilizerAdvisory: data.fertilizerAdvisory,
    weatherWarning: data.weatherWarning,
    weeklyPlan: data.weeklyPlan,
    yieldPerAc,
    cropPricePerTon
  };
};
