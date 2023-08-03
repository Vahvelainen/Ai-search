const fs = require('fs');
const openai = require('./openai');
const readline = require('readline');

/**
 * Search
 * reads product data from JSON
 * Asks for a promt and return 5 best matches
 */

app()

async function app() {
  let data = await readJsonFile('data.json');
  let products = data.data;
  let query = await askQuestion('What are you searching for? ');
  let qEmbedding = await openai.getEmbedding(query);
  products.forEach(product => {
    product.similarity = cosinesim(product.embedding, qEmbedding)
  });
  products.sort( (a, b) => b.similarity - a.similarity)
  for (let i = 0; i < 5; i++) {
    let product = products[i]
    console.log({
      title: product.title,
      description: product.description,
      similarity: product.similarity,
    })
  }
}

function readJsonFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const obj = JSON.parse(data);
        resolve(obj);
      } catch (err) {
        reject(err);
      }
    });
  });
}

//https://stackoverflow.com/questions/18193953/waiting-for-user-to-enter-input-in-node-js
function askQuestion(query) {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
      rl.close();
      resolve(ans);
  }))
}

// https://stackoverflow.com/questions/51362252/javascript-cosine-similarity-function
function cosinesim(A, B) {
  var dotproduct = 0;
  var mA = 0;
  var mB = 0;

  for(var i = 0; i < A.length; i++) {
      dotproduct += A[i] * B[i];
      mA += A[i] * A[i];
      mB += B[i] * B[i];
  }

  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  var similarity = dotproduct / (mA * mB);

  return similarity;
}