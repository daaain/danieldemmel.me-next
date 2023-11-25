// from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.8.0'
import { AutoTokenizer } from './transformers.js'

const KEY_MODELS = 'models'
const COLOURS = [
  'E40303',
  'FF8C00',
  'FFED00',
  '008026',
  '061393',
  '732982',
  '5BCEFA',
  'F5A9B8',
  '8F3F2B',
  'FFFFFF',
]

let models = []

function loadModels() {
  const storedModels = localStorage.getItem(KEY_MODELS)
  try {
    if (storedModels === null) throw Error()
    models = JSON.parse(storedModels)
  } catch {
    models = [
      'Xenova/gpt-3',
      'Xenova/gpt-4',
      'mistralai/Mistral-7B-v0.1',
      'hf-internal-testing/llama-tokenizer',
      'deepseek-ai/deepseek-coder-6.7b-instruct',
      'microsoft/phi-1_5',
      '01-ai/Yi-34B',
      'Xenova/bert-base-cased',
      'Xenova/t5-small',
      // 'obvious/error',
      // 'meta-llama/Llama-2-7b-chat-hf',
    ]
    saveModels()
  }
}

function saveModels() {
  localStorage.setItem(KEY_MODELS, JSON.stringify(models))
}

loadModels()

const loadedModels = {}
const modelsList = document.getElementById('models')

const textInput = document.getElementById('textInput')
// Need to add 2 pixels to account for the borders
textInput.setAttribute('style', 'height:' + (textInput.scrollHeight + 2) + 'px;')
let textInputContent = textInput.value
textInput.addEventListener('input', (event) => {
  textInput.style.height = 0
  textInput.style.height = textInput.scrollHeight + 2 + 'px'
  textInputContent = event.target.value
  updateTokens()
})

async function loadTokenizers() {
  modelsList.innerHTML = ''

  for (const model of models) {
    if (!(model in loadedModels)) {
      try {
        loadedModels[model] = await AutoTokenizer.from_pretrained(model)
      } catch (error) {
        loadedModels[model] = { error }
      }

      // some tokenizers strip spaces, let's prevent it so we can render text with the token numbers
      if (loadedModels[model]?.decoder?.decoders?.at(-1)?.config?.type === 'Strip') {
        loadedModels[model].decoder.decoders.pop()
      }
    }

    const newModelListItem = document.createElement('li')
    newModelListItem.dataset.model = model
    // TODO: add delete button
    // TODO: make it possible to reorder them?
    // TODO: add token count to each box
    modelsList.appendChild(newModelListItem)
    textInput.addEventListener('input', (event) => {
      textInput.style.height = 0
      textInput.style.height = textInput.scrollHeight + 2 + 'px'
      textInputContent = event.target.value
      updateTokens()
    })
    updateTokens()
  }

  // const addModelListItem = document.createElement('li')
  // addModelListItem.id = 'addModel'
  // addModelListItem.innerHTML = `<input /><button class="addModel">Add</button>`
  // modelsList.appendChild(addModelListItem)
}

const renderTokenAndText = (acc, { token, text }, index) => {
  return (acc +=
    text == '\n'
      ? '<br>'
      : `<span class="token">${token}</span><code style="background: #${
          COLOURS[index % COLOURS.length]
        }66">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`)
}

function updateTokens() {
  for (const [modelName, model] of Object.entries(loadedModels)) {
    let modelBlockWithTextAndTokens = ''
    if (model.error) {
      modelBlockWithTextAndTokens = `
        <h2>${modelName}</h2>
        <p style='white-space: pre-line; color: red;'>
          Model doesn't exist on HuggingFace, doesn't have the required JSON files or needs licence agreement. Original error message:\n${model.error}
        </p>`
    } else {
      const tokens = model.encode(textInputContent)
      const textFromTokens = model
        .batch_decode(
          tokens.map((token) => [token]),
          { clean_up_tokenization_spaces: false }
        )
        .map((text, index) => ({ text, token: tokens[index] }))
        .reduce(renderTokenAndText, '')

      modelBlockWithTextAndTokens = `
        <h2>${modelName} | Token count: ${tokens.length}</h2>
        ${textFromTokens}
      `
    }
    document.querySelector(`li[data-model="${modelName}"]`).innerHTML = modelBlockWithTextAndTokens
  }
}

await loadTokenizers()
