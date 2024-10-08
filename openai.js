const OpenAI  = require("openai")
require('dotenv').config();

exports.getEmbedding = getEmbedding;

const openai = new OpenAI({
  //API key needs to be set on .env file as OPENAI_API_KEY
  apiKey: process.env.OPENAI_API_KEY,
});

async function getEmbedding(input) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: input,
    });
    return response.data[0].embedding
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}