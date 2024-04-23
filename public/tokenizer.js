// from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1'
import { AutoTokenizer } from "./transformers.js";

const KEY_MODELS = "models";
const COLOURS = [
  "E40303",
  "FF8C00",
  "FFED00",
  "008026",
  "061393",
  "732982",
  "5BCEFA",
  "F5A9B8",
  "8F3F2B",
  "FFFFFF",
];

let models = [];

// TODO: take model list from URL params?
function loadModels() {
  const storedModels = localStorage.getItem(KEY_MODELS);
  try {
    if (storedModels === null)
      throw Error("No models found in LocalStorage, using default list.");
    models = JSON.parse(storedModels);
  } catch (error) {
    console.log(error);
    models = [
      "Xenova/gpt-4",
      "Xenova/gpt-3",
      "Xenova/llama-3-tokenizer",
      "hf-internal-testing/llama-tokenizer",
      "Xenova/gemma-tokenizer",
      "microsoft/Phi-3-mini-4k-instruct",
      "mistral-community/Mixtral-8x22B-v0.1",
      // 'deepseek-ai/deepseek-coder-6.7b-instruct',
      // '01-ai/Yi-34B',
      // 'Xenova/bert-base-cased',
      // 'Xenova/t5-small',
      // 'obvious/error',
    ];
    saveModels();
  }
}

function saveModels() {
  localStorage.setItem(KEY_MODELS, JSON.stringify(models));
}

function addModel(name) {
  localStorage.setItem(KEY_MODELS, JSON.stringify([...models, name]));
}

loadModels();

const loadedModels = {};
const modelsList = document.getElementById("models");

const textInput = document.getElementById("textInput");
// Need to add 2 pixels to account for the borders
textInput.setAttribute("style", `height:${textInput.scrollHeight + 2}px;`);
let textInputContent = textInput.value;
textInput.addEventListener("input", (event) => {
  textInput.style.height = 0;
  textInput.style.height = `${textInput.scrollHeight + 2}px`;
  textInputContent = event.target.value;
  updateTokens();
});

async function loadTokenizers() {
  console.log("Loading models...");
  for (const model of models) {
    if (!(model in loadedModels)) {
      try {
        console.log("Loading model: ", model);
        loadedModels[model] = await AutoTokenizer.from_pretrained(model);
      } catch (error) {
        console.error("Model loading error:", error);
        loadedModels[model] = { error };
      }

      console.log("Loaded model", loadedModels[model]);
      // some tokenizers strip spaces, let's prevent it so we can render them with the token numbers
      if (
        loadedModels[model]?.decoder?.decoders?.at(-1)?.config?.type === "Strip"
      ) {
        loadedModels[model].decoder.decoders.pop();
      }

      const newModelListItem = document.createElement("li");
      newModelListItem.dataset.model = model;
      // TODO: add delete button
      // TODO: make it possible to reorder them?
      modelsList.appendChild(newModelListItem);
    }
  }

  // TODO: see if it would be possible to render after each model loaded
  updateTokens();
}

const renderTokenAndText = (acc, { token, text }, index) => {
  return (acc +=
    text === "\n"
      ? "<br>"
      : `<span class="token">${token}</span><code style="background: #${
          COLOURS[index % COLOURS.length]
        }66">${text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</code>`);
};

// TODO: do this in a worker, see: https://github.com/xenova/transformers.js/blob/main/examples/tokenizer-playground/src/worker.js
function updateTokens() {
  for (const [modelName, model] of Object.entries(loadedModels)) {
    let modelBlockWithTextAndTokens = "";
    if (model.error) {
      modelBlockWithTextAndTokens = `
        <h2>${modelName}</h2>
        <p style='white-space: pre-line; color: red;'>
          Model doesn't exist on HuggingFace, doesn't have the required JSON files or needs licence agreement. Original error message:\n${model.error}
        </p>`;
    } else {
      const tokens = model.encode(textInputContent);
      const textFromTokens = model
        .batch_decode(
          tokens.map((token) => [token]),
          { clean_up_tokenization_spaces: false },
        )
        .map((text, index) => ({ text, token: tokens[index] }))
        .reduce(renderTokenAndText, "");

      modelBlockWithTextAndTokens = `
        <h2>${modelName} <img src="favicons/token.svg" alt="Token"> Token count: ${tokens.length}</h2>
        ${textFromTokens}
      `;
    }
    document.querySelector(`li[data-model="${modelName}"]`).innerHTML =
      modelBlockWithTextAndTokens;
  }
}

await loadTokenizers();

const addModelBox = document.getElementById("addModel");
addModelBox.querySelector("button").addEventListener("click", async () => {
  addModel(addModelBox.querySelector("input").value);
  loadModels();
  await loadTokenizers();
  window.scrollTo(0, document.body.scrollHeight);
});
