let language = "pt-PT";
let memory = [];
let dati = new Date()
let minuto = dati.getMinutes()
let timel = dati.getHours()
let moment = "dia"
let data = dati.getDate()
let mese = dati.getMonth()
let mes 
let ano = dati.getFullYear()

function momente() {
//Definindo momentos do dia
  if (timel < 10) {
    moment = "do Dia"
    
  } 
  
  if (timel >= 10){
    moment = "da Tarde"
    
  }
  
  if (timel >= 18){
    moment = "da Noite"
    
  } 
//Definindo Meses do ano
  if (mese == 0) {
    mes = "Janeiro"
  }
  if (mese == 1) {
    mes = "Fevereiro"
  }
  if (mese == 2) {
    mes = "Março"
  }
  if (mese == 3) {
    mes = "Abril"
  }
  if (mese == 4) {
    mes = "Maio"
  }
  if (mese == 5) {
    mes = "Junho"
  }
  if (mese == 6) {
    mes = "Julho"
  }
  if (mese == 7) {
    mes = "Agosto"
  }
  if (mese == 8) {
    mes = "Setembro"
  }
  if (mese == 9) {
    mes = "Outubro"
  }
  if (mese == 10) {
    mes = "Novembro"
  }
  if (mese == 11) {
    mes = "Dezembro"
  }
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
    addMessage("TETA", "Deixe-me consultar na internet...");
    const wiki = await wikiSearch(text);
    const output = wiki || "Desculpe, não encontrei nada relevante.";
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
  let keywords = words.filter(w => !["?","!","o", "a", "os", "as", "sobre", "da", "do", "de", "por", "em", "um", "uma", "qual","qualé" ,"que", "tu", "sabes","voce","você","já","estava","no","na","nos","nas","me","ma","este","esse","aquele mambo","ola"].includes(w));
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
  addMessage("TETA", "A analisar a imagem...");

  const reader = new FileReader();
  reader.onload = async function () {
    const img = new Image();
    img.onload = async function () {
      const canvas = document.getElementById("canvas");
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 224, 224);

      const model = await mobilenet.load();
      const predictions = await model.classify(canvas);

      if (predictions && predictions.length > 0) {
        const result = predictions[0];
        const message = `Esta imagem parece mostrar ${result.className}, com ${(result.probability * 100).toFixed(1)}% de certeza.`;
        addMessage("TETA", message);
        speak(message);
      } else {
        addMessage("TETA", "Não consegui identificar o que está na imagem.");
        speak("Não consegui identificar o que está na imagem.");
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);

}

function generateResponse(text) {
  const t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const last = memory.length > 0 ? memory[memory.length - 1].text.toLowerCase() : "";

  if (t.includes("quem es tu") || t.includes("quem és tu") || t.includes("quem tu es")) {
    return "Eu sou a TETA AI, tua parceira de conversa e conhecimento! <br>Hello My name is TETA IA, yours friends of the conversation!"
  }

  if (t.includes("bom dia") || t.includes("boa tarde") || t.includes("boa noite") || t.includes("olá") || t.includes("oi")){
    return "Olá! Como posso te ajudar hoje?";
  }
  if (t.includes("wy") || t.includes("brother") || t.includes("qualé") || t.includes("nengue") || t.includes("mano")){
    return "Qualé wy, tás fixe?";
  }
  if (t.includes("quem fez te") || t.includes("quem criou te") || t.includes("quem desenvolveu te") || t.includes("quem te fez") || t.includes("quem te criou") || t.includes("quem te desenvolveu")) {
    return "A TETA IA foi desenvolvida por Inácio.u.daniel 100% html e javascript puro limitando se apenas a usar apis para reconhecimento de imagem!";
  }
  if (t.includes("boa") || t.includes("fine") || t.includes("bem") || t.includes("nice") || t.includes("feliz") || t.includes("good")) {
    return "Bom saber disso! para que seu dia seja ainda melhor eu estou aqui para ti!";
  }
  if (t.includes("obrigado") || t.includes("valeu") || t.includes("Obas")) {
    return "Não tens de quê wy! Estou sempre aqui para ti.";
  }
  if (t.includes("estás bem") || t.includes("vcomo estás") || t.includes("passas bem")) {
    return "yha wy, estou bem!";
  }
  if (t.includes("mambo") || t.includes("rijo")) {
    return "Estás na boa! esse Mambo é dos duro, e kuduro é ritmo mais quante de angola!";
  }
  if (t.includes("ideia") || t.includes("novidades")) {
    return "Estou a esperar da tua parte!";
  }
  if (t.includes("Kuduaira") || t.includes("BKuduro") || t.includes("kuduro")) {
    return "Kuduo é o mais popular estilo musical de angola, com danças épicas e loucas, sempre a aquecer o teu dia e a banda(bairro), dos artistas que fazem a festa!";
  }
  if (t.includes("hora") || t.includes("time")) {
    return "Neste momento são "+timel+":"+minuto+" horas "+moment;
  }
  if (t.includes("data") || t.includes("dia")) {
    return "hoje é dia "+data+" de "+mes+" de "+ano;
  }
  if (t.includes("Angola") || t.includes("Mangole")) {
    return "Angola é um país localizado na zona Austral de África e banhada pelo oceano atlântico, faz fronteira com a RDC, ZAMBIA, NAMIBIA, RC. A língua mais falada em Angola é a língua portuguesa.";
  }
  return null;
}
