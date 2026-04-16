const output = document.getElementById("output");
const startBtn = document.getElementById("startBtn");
const inputLanguage = document.getElementById("inputLanguage");
const promptText = document.getElementById("promptText");
const diagOutput = document.getElementById("diagOutput");
const diagBtn = document.getElementById("diagBtn");

const SUPPORTED_OUTPUT_LANGS = ["en", "es", "ja"];
const EXAMPLE_BY_INPUT_LANG = {
  pt: "Quem inventou o JavaScript?",
  en: "Who invented JavaScript?",
  es: "Quien invento JavaScript?",
  ja: "JavaScript is invented by who?",
};

const read = {
  inputLang: () => (inputLanguage?.value || "pt").trim(),
  prompt: () => (promptText?.value || "").trim(),
};

const lm = {
  exists: () => typeof LanguageModel !== "undefined",
  availability: (opts) => LanguageModel.availability(opts),
  params: (opts) => LanguageModel.params(opts),
  create: (opts) => LanguageModel.create(opts),
};

function setMessage(message, className = "") {
  output.className = className;
  output.innerHTML = message;
}

function maybeSetExamplePrompt() {
  const current = read.prompt();
  if (!current || Object.values(EXAMPLE_BY_INPUT_LANG).includes(current)) {
    promptText.value = EXAMPLE_BY_INPUT_LANG[read.inputLang()] || EXAMPLE_BY_INPUT_LANG.pt;
  }
}

async function safeLabel(promiseFactory) {
  try {
    return await promiseFactory();
  } catch (error) {
    return "erro: " + (error?.message || String(error));
  }
}

function buildSessionOptions(inputLang) {
  return {
    expectedInputLanguages: [inputLang],
    expectedOutputLanguages: SUPPORTED_OUTPUT_LANGS,
    initialPrompts: [
      {
        role: "system",
        content:
          "You are an AI assistant that responds clearly and objectively. Respect the output language requested by the user inside the prompt.",
      },
    ],
  };
}

async function enrichWithSamplingParams(options, inputLang) {
  if (typeof LanguageModel.params !== "function") return options;

  const params = await lm.params({
    expectedInputLanguages: [inputLang],
    expectedOutputLanguages: SUPPORTED_OUTPUT_LANGS,
  });

  if (typeof params?.defaultTemperature === "number") options.temperature = params.defaultTemperature;
  if (typeof params?.defaultTopK === "number") options.topK = params.defaultTopK;
  return options;
}

async function renderResponse(session, prompt) {
  let fullText = "";
  setMessage("", "");

  if (typeof session.promptStreaming === "function") {
    const responseStream = await session.promptStreaming(prompt);
    for await (const token of responseStream) {
      fullText += token;
      output.innerHTML = markdown.toHTML(fullText);
    }
    return;
  }

  const response = await session.prompt(prompt);
  fullText = typeof response === "string" ? response : String(response);
  output.innerHTML = markdown.toHTML(fullText);
}

async function runDiagnostics() {
  const inputLang = read.inputLang();

  if (!lm.exists()) {
    diagOutput.textContent = [
      "LanguageModel presente: nao",
      "Sugestao: use o mesmo perfil do Chrome onde availability() retornou available.",
    ].join("\n");
    return;
  }

  const availabilityNoArgs = await safeLabel(() => lm.availability());
  const availabilityWithLang = await safeLabel(() =>
    lm.availability({
      expectedInputLanguages: [inputLang],
      expectedOutputLanguages: SUPPORTED_OUTPUT_LANGS,
    })
  );

  diagOutput.textContent = [
    "LanguageModel presente: sim",
    "Idioma de entrada selecionado: " + inputLang,
    "Idiomas de saida configurados: " + SUPPORTED_OUTPUT_LANGS.join(", "),
    "availability() sem args: " + availabilityNoArgs,
    "availability() com idiomas: " + availabilityWithLang,
    "params() disponivel: " + (typeof LanguageModel.params === "function" ? "sim" : "nao"),
    "create() disponivel: " + (typeof LanguageModel.create === "function" ? "sim" : "nao"),
    "Metodos estaticos: " + Object.getOwnPropertyNames(LanguageModel).sort().join(", "),
    "Metodos de sessao: " + Object.getOwnPropertyNames(LanguageModel.prototype || {}).sort().join(", "),
  ].join("\n");
}

async function runPrompt() {
  startBtn.disabled = true;
  const inputLang = read.inputLang();
  const prompt = read.prompt();

  try {
    if (!lm.exists()) throw new Error("API LanguageModel nao disponivel. Verifique o Chrome e as flags de Web AI.");
    if (!prompt) throw new Error("Preencha a pergunta/prompt antes de iniciar.");

    setMessage("Verificando disponibilidade do modelo para entrada " + inputLang + "...", "muted");

    const availability = await lm.availability({
      expectedInputLanguages: [inputLang],
      expectedOutputLanguages: SUPPORTED_OUTPUT_LANGS,
    });

    if (availability === "unavailable") throw new Error("Modelo indisponivel neste navegador/perfil.");
    if (availability === "downloadable") setMessage("Modelo disponivel para download. Iniciando download local...", "muted");

    const options = await enrichWithSamplingParams(buildSessionOptions(inputLang), inputLang);
    const session = await lm.create(options);
    await renderResponse(session, prompt);
  } catch (error) {
    console.error(error);
    const details = error?.message || String(error);
    const supportedLanguages = details.match(/\[([^\]]+)\]/)?.[1] || "";
    const languageHelp = supportedLanguages
      ? "<br><br>A API reportou estes idiomas de saida: " + supportedLanguages
      : "<br><br>Peca explicitamente no prompt o idioma de resposta desejado (ex.: Responda em espanhol).";

    setMessage(
      "Erro ao executar. " +
        details +
        languageHelp +
        "<br><br>Dica: rode por servidor local (http://localhost), nao em file://, e confira se a API Web AI esta habilitada no Chrome.",
      "error"
    );
  } finally {
    startBtn.disabled = false;
  }
}

startBtn.addEventListener("click", runPrompt);
diagBtn.addEventListener("click", runDiagnostics);
inputLanguage.addEventListener("change", () => {
  maybeSetExamplePrompt();
  runDiagnostics();
});

maybeSetExamplePrompt();
runDiagnostics();
