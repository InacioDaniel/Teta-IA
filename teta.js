let language = "pt-PT";
let memory = [];
let userState = { humor: "normal" }; // mini-cérebro
let dati = new Date()
let minuto = dati.getMinutes()
let timel = dati.getHours()
let moment = "dia"
let data = dati.getDate()
let mese = dati.getMonth()
let mes 
let ano = dati.getFullYear()

function momente() {
  if (timel < 10) moment = "da Manhã";
  else if (timel < 18) moment = "da Tarde";
  else moment = "da Noite";

  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho",
                 "Agosto","Setembro","Outubro","Novembro","Dezembro"];
  mes = meses[mese];
}
momente()

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
  memory.push({ role, text });
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
  } else {
    addMessage("TETA", "Hmm... deixa ver esse mambo 🤔...");
    const wiki = await wikiSearch(text);
    const output = wiki || "Ainda não sei bem desse mambo, mas bora pesquisar junto. 😉";
    addMessage("TETA", output);
    speak(output);
  }
}

async function wikiSearch(query) {
  const keyword = extractKeyword(query);
  const url = `https://${language.substring(0,2)}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.extract) return data.extract;
    return null;
  } catch {
    return null;
  }
}

function extractKeyword(text) {
  let clean = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  let words = clean.split(" ");
  let keywords = words.filter(w => !["?","!","o","a","os","as","sobre","da","do","de","por","em","um","uma","que","tu","sabes","voce","já","no","na","nos","nas"].includes(w));
  return keywords.slice(-1)[0] || clean;
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
  addMessage("TETA", "A analisar a imagem... 🖼️");

  const reader = new FileReader();
  reader.onload = async function () {
    const img = new Image();
    img.onload = async function () {
      const model = await mobilenet.load();
      const predictions = await model.classify(img);

      if (predictions && predictions.length > 0) {
        const result = predictions[0];
        const message = `😎 Esse mambo parece ser **${result.className}**, com ${(result.probability * 100).toFixed(1)}% de certeza.`;
        addMessage("TETA", message);
        speak(message);
      } else {
        addMessage("TETA", "Não consegui sacar o que tá nessa foto 😅");
        speak("Não consegui identificar.");
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// ---------- MINI-CÉREBRO ----------
function generateResponse(text) {
  const t = text.toLowerCase();
  const last = memory.length > 0 ? memory[memory.length - 1].text.toLowerCase() : "";

  if (t.includes("quem es tu") || t.includes("quem és tu") || t.includes("quem tu es")) {
    return "Eu sou a TETA AI 🤖, tua amiga de conversa, angolana de raiz! 🇦🇴";
  }
  if (t.includes("bom dia") || t.includes("boa tarde") || t.includes("boa noite") || t.includes("olá") || t.includes("oi")){
    return "Qualé nengue 😎! Como tás hoje?";
  }
  if (t.includes("mano") || t.includes("nengue") || t.includes("wy") || t.includes("brother")){
    return "Ya wy, firmeza? Tudo tranquilo contigo? 🔥";
  }
  if (t.includes("obrigado") || t.includes("valeu") || t.includes("obas")) {
    return "Não tens de quê, tamos juntos no mambo! 💯";
  }
  if (t.includes("estás bem") || t.includes("como estás")) {
    userState.humor = "feliz";
    return "Tou bem rijo 😁, só na boa. E tu, como tás?";
  }
  if (t.includes("hora") || t.includes("time")) {
    return `Agora são ${timel}:${minuto} horas ${moment} ⏰`;
  }
  if (t.includes("data") || t.includes("dia")) {
    return `Hoje é ${data} de ${mes} de ${ano} 📅`;
  }
  if (t.includes("angola")) {
    return "🇦🇴 Angola é o coração de África! Terra do semba, kuduro, funge e alegria!";
  }
  if (t.includes("kuduro")) {
    return "🔥 Kuduro é dos duros, dança que parte chão! Só quem é de Angola entende a energia!";
  }
  
  // fallback criativo
  return null;
}
