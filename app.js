import { app, errorHandler } from 'mu';
import { fetchReportsByStatus, updateReportStatus,
         STATUS_PACKAGED, STATUS_DELIVERING, STATUS_FAILED, STATUS_DELIVERED} from './queries';
import { deliver } from './delivery';
import { waitForDatabase } from './database';
import { CronJob } from 'cron';

const cronFrequency = process.env.PACKAGE_CRON_PATTERN || '*/30 * * * * *';
const hoursDeliveringTimeout = process.env.HOURS_DELIVERING_TIMEOUT || 3;

waitForDatabase(createCronJob);

app.get('/', async function( req, res ) {
  res.send('Hello from deliver-bbcdr-rapporten-service');
});

function createCronJob() {
  return new CronJob(cronFrequency, function() {
    console.log(`BBCDR delivery triggered by cron job at ${new Date().toISOString()}`);
    deliverPackages();
  }, null, true);
}

const deliverPackages = async function(){
  try {
    let reportsToDeliver = await fetchReportsByStatus(STATUS_PACKAGED);
    reportsToDeliver = reportsToDeliver.concat((await fetchReportsByStatus(STATUS_DELIVERING)).filter(filterDeliveringTimeout));
    reportsToDeliver = reportsToDeliver.concat(await fetchReportsByStatus(STATUS_FAILED));

    console.log(`Found ${reportsToDeliver.length} BBCDR reports to deliver`);
    reportsToDeliver.map(async (report) => {
      try {
        console.log(`Start delivering BBCDR report ${report.id} found in graph <${report.graph}>`);
        await updateReportStatus(report.uri, STATUS_DELIVERING, report.graph);
        await deliver(report);
        await updateReportStatus(report.uri, STATUS_DELIVERED, report.graph);
        console.log(`Delivered BBCDR report ${report.id} successfully`);
      }
      catch(e){
        console.log(`Failed to deliver BBCDR report ${report.id}`);
        console.error(e);
        await updateReportStatus(report.uri, STATUS_FAILED, report.graph);
      }
    });
  }
  catch(e){
    console.error(e);
  }
};

const filterDeliveringTimeout = function( report ) {
  let modifiedDate = new Date(report.modified);
  let currentDate = new Date();
  return ((currentDate - modifiedDate) / (1000 * 60 * 60)) >= parseInt(hoursDeliveringTimeout);
};

app.use(errorHandler);
