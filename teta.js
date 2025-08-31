let language = "pt-PT";
let memory = []; // memória apenas em sessão
let userState = { humor: "normal", lastTopic: "" }; // estado do usuário em sessão
let dati = new Date();
let minuto = dati.getMinutes();
let timel = dati.getHours();
let moment = "dia";
let data = dati.getDate();
let mese = dati.getMonth();
let mes;
let ano = dati.getFullYear();

function momente() {
  if (timel < 10) moment = "da Manhã";
  else if (timel < 18) moment = "da Tarde";
  else moment = "da Noite";

  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho",
                 "Agosto","Setembro","Outubro","Novembro","Dezembro"];
  mes = meses[mese];
}
momente();

function setLanguage() {
  language = document.getElementById("language").value;
}

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = language;
  speechSynthesis.speak(msg);
}

function addMessage(role, text) {
  const chat = document.getElementById("chat");
  chat.innerHTML += `<p><strong>${role}:</strong> ${text}</p>`;
  chat.scrollTop = chat.scrollHeight;
  memory.push({ role, text }); // memória apenas em sessão
}

async function handleText() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  addMessage("Você", text);
  input.value = "";

  let resp = generateResponse(text);
  if (resp) {
    addMessage("TETA", resp);
    speak(resp);
    return;
  }

  addMessage("TETA", "Hmm... deixa ver esse mambo 🤔...");
  const wiki = await multiSearch(text);
  const output = wiki || generateCreativeFallback(text);
  addMessage("TETA", output);
  speak(output);
}

// Busca em sites que retornam JSON
async function multiSearch(query) {
  const urls = [
    `https://${language.substring(0,2)}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
    `http://numbersapi.com/${encodeURIComponent(query)}?json`
  ];

  for (let url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      if (data.extract) return data.extract;  // Wikipedia
      if (data.text) return data.text;        // Numbers API

    } catch (err) {
      continue;
    }
  }

  return null;
}

function generateCreativeFallback(text){
  const fallbacks = [
    "Hmm... não sei bem, mas vamos descobrir juntos! 😉",
    "Esse mambo é novo para mim 🤔, me conta mais!",
    "Interessante! Nunca pensei nisso assim 😎",
    "TETA vai pesquisar online pra ti, espera aí ⏳"
  ];
  return fallbacks[Math.floor(Math.random()*fallbacks.length)];
}

function startVoice() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = language;
  recognition.onresult = (e) => {
    document.getElementById("userInput").value = e.results[0][0].transcript;
    handleText();
  };
  recognition.start();
}

async function analyzeImageTF(event) {
  const file = event.target.files[0];
  if (!file) return;
  addMessage("TETA", "Já tou a analizar a imagem... segura aí 👀🖼️");

  const reader = new FileReader();
  reader.onload = async function () {
    const img = new Image();
    img.onload = async function () {
      const model = await cocoSsd.load();
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const predictions = await model.detect(img);

      if (predictions.length > 0) {
        let desc = predictions.map(p => `${p.class} (${Math.round(p.score * 100)}%)`).join(", ");
        predictions.forEach(pred => {
          ctx.strokeStyle = "lime";
          ctx.lineWidth = 3;
          ctx.strokeRect(...pred.bbox);
          ctx.font = "18px Arial";
          ctx.fillStyle = "red";
          ctx.fillText(pred.class, pred.bbox[0], pred.bbox[1] > 20 ? pred.bbox[1] - 5 : 20);
        });
        addMessage("TETA", `Identifiquei estes mambos: ${desc}`);
      } else {
        addMessage("TETA", "Não saquei nada na foto 🤷🏾‍♂️, tá confusa essa cena.");
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// ---------- MINI-CÉREBRO EXPANDIDO ----------
function generateResponse(text) {
  const t = text.toLowerCase();

  if (t.includes("quem es tu") || t.includes("quem és tu") || t.includes("quem tu es"))
    return "Eu sou a TETA AI 🤖, tua amiga de conversa, angolana de raiz! 🇦🇴";
  if (t.includes("bom dia") || t.includes("boa tarde") || t.includes("boa noite") || t.includes("olá") || t.includes("oi"))
    return "Qualé nengue 😎! Como tás hoje?";
  if (t.includes("mano") || t.includes("nengue") || t.includes("wy") || t.includes("brother"))
    return "Ya wy, firmeza? Tudo tranquilo contigo? 🔥";
  if (t.includes("obrigado") || t.includes("valeu") || t.includes("obas"))
    return "Não tens de quê, tamos juntos no mambo! 💯";
  if (t.includes("estás bem") || t.includes("como estás")) {
    userState.humor = "feliz"; // apenas em sessão
    return "Tou bem rijo 😁, só na boa. E tu, como tás?";
  }
  if (t.includes("hora") || t.includes("time"))
    return `Agora são ${timel}:${minuto} horas ${moment} ⏰`;
  if (t.includes("data") || t.includes("dia"))
    return `Hoje é ${data} de ${mes} de ${ano} 📅`;
  if (t.includes("angola"))
    return "🇦🇴 Angola é o coração de África! Terra do semba, kuduro, funge e alegria!";
  if (t.includes("kuduro"))
    return "🔥 Kuduro é dos duros, dança que parte chão! Só quem é de Angola entende a energia!";

  // Novos idiomas
  const langResponses = {
    "fr": ["bonjour", "salut", "Salut! Comment ça va? 😎"],
    "de": ["hallo", "guten tag", "Hallo! Wie geht's dir? 🔥"],
    "it": ["ciao", "salve", "Ciao! Come stai? 😁"],
    "zh": ["你好", "您好", "你好! 今天怎么样？🤖"],
    "ar": ["مرحبا", "", "مرحبا! كيف حالك؟ 🤖"],
    "ru": ["привет", "", "Привет! Как дела؟ 🤖"],
    "ja": ["こんにちは", "", "こんにちは! 元気ですか？ 🤖"],
    "ko": ["안녕하세요", "", "안녕하세요! 잘 지내세요? 🤖"],
    "nl": ["hallo", "goedendag", "Hallo! Hoe gaat het? 🤖"],
    "sv": ["hej", "", "Hej! Hur mår du? 🤖"],
    "tr": ["merhaba", "", "Merhaba! Nasılsın? 🤖"],
    "hi": ["नमस्ते", "", "नमस्ते! आप कैसे हैं? 🤖"],
    "el": ["γειά", "", "Γειά! Τι κάνεις? 🤖"],
    "pl": ["cześć", "", "Cześć! Jak się masz? 🤖"]
  };

  for(let k in langResponses){
    const keywords = langResponses[k].slice(0,2).filter(w=>w);
    if(keywords.some(w => t.includes(w))) return langResponses[k][2];
  }

  return null;
}
