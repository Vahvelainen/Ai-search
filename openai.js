const { Configuration, OpenAIApi } = require("openai")
require('dotenv').config();

exports.getEmbedding = getEmbedding;

const configuration = new Configuration({
  //API key needs to be set on .env file as OPENAI_API_KEY
  apiKey: process.env.OPENAI_API_KEY,
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