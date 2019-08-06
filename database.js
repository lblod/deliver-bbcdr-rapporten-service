import rp from 'request-promise';
const muSparqlEndpoint = process.env.MU_SPARQL_ENDPOINT;

const isDatabaseUp = async function() {
  let isUp = false;
  try {
    await rp(muSparqlEndpoint);
    isUp = true;
  } catch (e) {
    console.log("Waiting for database... ");
  }
  return isUp;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const waitForDatabase = async function(callback) {
  let loop = true;
  while (loop) {
    loop = !(await isDatabaseUp());
    await sleep(2000);
  }
  console.log('Creating cron job.');
  callback();
};

export { waitForDatabase };
