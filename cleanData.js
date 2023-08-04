const fs = require('fs')
const csv = require('csv-parser')
const openai = require('./openai')

/**
 * Reads data from csv and saves necessary fields to JSON with embeddings
 * Note: the openAI account must be over 48hours old to have rate limit of 3500 RPM
 * The maxim amout of requests is 350 000 per day without increased rate limit
 */

// node cleanData.js
saveDataWithEmbeddings('data/home_depot_data_1_2021_12.csv', 'data.json')

async function saveDataWithEmbeddings(readFile, writeFile) {
  let data = await readCsvFile(readFile);

  let dataToSave = []
  let promises = []

  for ( let i = 0; i < data.length; i++) {
    console.log("Requesting embedding for product number: " + ( i+1 ) + "/" + data.length )
    let item = data[i]
    let promise = openai.getEmbedding( item.brand + ' ' + item.title + ' ' + item.description)
      .then( embedding => {
        dataToSave.push({
          title: item.title,
          description: item.description,
          product_id: item.product_id,
          brand: item.brand,
          embedding: embedding,
        });
      });
    promises.push(promise);

    //wait 20ms to not exceed the rate limit of 3500rpm
    await timeout(20)
  }

  //Await all requests at once
  await Promise.all(promises);

  console.log(dataToSave);
  writeJson(dataToSave, writeFile)
}


function readCsvFile(file) {
  try {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(file)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
      });
  } catch (error) {
    console.log(error);
  }
}

function writeJson(data, file) {
  let obj = {data: data}
  var json = JSON.stringify(obj);
  fs.writeFile(file, json, 'utf8', error => {
    if (error) {
      console.log(error)
    } else {
      console.log('File succesfully written to ' + file)
    }
  });
}

//https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Example product:
// {
//   index: '99',
//   url: 'https://www.homedepot.com/p/Glomar-1-Light-PAR30-White-Gimbal-Ring-Track-Lighting-Head-HD-TH222/202501490',
//   title: '1-Light PAR30 White Gimbal Ring Track Lighting Head',
//   images: 'https://images.thdstatic.com/productImages/61682d54-5d2c-4bb8-bb07-8d52e53e0a64/svn/white-glomar-track-lighting-heads-hd-th222-64_100.jpg',
//   description: 'With its gimbal ring design this track head is stylish and practical. This track head can find itself at home in many applications. This track head is beautifully finished in White.',
//   product_id: '202501490',
//   sku: '1000549400.0',
//   gtin13: '45923402227.0',
//   brand: 'Glomar',
//   price: '21.99',
//   currency: 'USD',
//   availability: 'InStock',
//   uniq_id: '2477e96a-df1e-55cb-b827-30d8ff0d667d',
//   scraped_at: '2021-12-14 00:56:18.533660'
// }