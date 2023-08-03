const { Configuration, OpenAIApi } = require("openai")

exports.getEmbedding = getEmbedding;

const configuration = new Configuration({
  //Super secret API key should be stored in env configuration etc.
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

async function getEmbedding(input) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: input,
    });
    return response.data.data[0].embedding
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}