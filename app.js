import {app, query, update, uuid, sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeUri } from 'mu';
import {fetchReportsByStatus, updateReportStatus, STATUS_PACKAGED, STATUS_DELIVERING, STATUS_FAILED, STATUS_DELIVERED} from './queries';
import { deliver } from './delivery';
import { CronJob } from 'cron';

const cronFrequency = process.env.PACKAGE_CRON_PATTERN || '*/30 * * * * *';
const hoursDeliveringTimeout = process.env.HOURS_DELIVERING_TIMEOUT || 3;

app.get('/', async function( req, res ) {
  res.send('Hello from deliver-bbcdr-rapporten-service');
});

new CronJob(cronFrequency, function() {
  console.log(`packaging triggered by cron job at ${new Date().toISOString()}`);
  deliverPackages();
}, null, true);

const deliverPackages = async function(){
  let reportsToDeliver = await fetchReportsByStatus(STATUS_PACKAGED);
  reportsToDeliver = reportsToDeliver.concat((await fetchReportsByStatus(STATUS_DELIVERING)).filter(filterDeliveringTimeout));
  reportsToDeliver = reportsToDeliver.concat(await fetchReportsByStatus(STATUS_FAILED));

  reportsToDeliver.map(async report => {
    try {
      await updateReportStatus(report.report, STATUS_DELIVERING);
      await deliver(report);
      await updateReportStatus(report.report, STATUS_DELIVERED);
    }
    catch(e){
      console.error(e);
      await updateReportStatus(report.report, STATUS_FAILED);
    }
  });
};

const filterDeliveringTimeout = function( report ) {
  let modifiedDate = new Date(report.modified);
  let currentDate = new Date();
  return ((currentDate - modifiedDate) / (1000 * 60 * 60)) >= parseInt(hoursDeliveringTimeout);
};
