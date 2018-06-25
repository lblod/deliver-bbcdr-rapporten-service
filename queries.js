import { sparqlEscapeDateTime, sparqlEscapeUri } from 'mu';
import { querySudo as query, updateSudo as update } from './auth-sudo';

const STATUS_PACKAGED = "http://mu.semte.ch/vocabularies/ext/bbcdr-status/PACKAGED";
const STATUS_DELIVERING = "http://mu.semte.ch/vocabularies/ext/bbcdr-status/DELIVERING";
const STATUS_DELIVERED = "http://mu.semte.ch/vocabularies/ext/bbcdr-status/DELIVERED";
const STATUS_FAILED = "http://mu.semte.ch/vocabularies/ext/bbcdr-status/DELIVERY_FAILED";


/**
 * fetch reports by status
 * @method fetchReportDataByStatus
 * @return {Array}
 */
const fetchReportsByStatus = async function( status ) {
  const result = await query(`
       PREFIX mu:   <http://mu.semte.ch/vocabularies/core/>
       PREFIX dcterms: <http://purl.org/dc/terms/>
       PREFIX bbcdr: <http://mu.semte.ch/vocabularies/ext/bbcdr/>

       SELECT ?uri ?package ?modified
       WHERE {
         GRAPH ?graph {
             ?uri bbcdr:package ?package;
                  bbcdr:status ${sparqlEscapeUri(status)};
                  mu:uuid ?id;
                  dcterms:modified ?modified.
         }
       } ORDER BY ASC(?modified)
 `);
  return parseResult(result);
};

const updateReportStatus = async function( report, status, graph ){
  await update(`
       PREFIX bbcdr: <http://mu.semte.ch/vocabularies/ext/bbcdr/>
       PREFIX dcterms: <http://purl.org/dc/terms/>

       WITH <${graph}>
       DELETE {
         ${sparqlEscapeUri(report)} dcterms:modified ?modified.
         ${sparqlEscapeUri(report)} bbcdr:status ?status.
       }
       INSERT {
         ${sparqlEscapeUri(report)} dcterms:modified ${sparqlEscapeDateTime(new Date())};
                                    bbcdr:status ${sparqlEscapeUri(status)}.
       }
       WHERE {
         {
           ${sparqlEscapeUri(report)} dcterms:modified ?modified.
         }
         UNION
         {
           OPTIONAL{ ${sparqlEscapeUri(report)} bbcdr:status ?status }
         }
       }
  `);
};

/**
 * convert results of select query to an array of objects.
 * courtesy: Niels Vandekeybus
 * @method parseResult
 * @return {Array}
 */
const parseResult = function( result ) {
  const bindingKeys = result.head.vars;
  return result.results.bindings.map((row) => {
    const obj = {};
    bindingKeys.forEach((key) => obj[key] = row[key].value);
    return obj;
  });
};

export { fetchReportsByStatus, updateReportStatus, STATUS_PACKAGED, STATUS_DELIVERING, STATUS_FAILED, STATUS_DELIVERED}
