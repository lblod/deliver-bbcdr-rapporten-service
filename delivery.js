import Client from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';

const DATA_ROOT = process.env.FILE_PATH || '/data/files/';
const SHARE_PREFIX = process.env.SHARE_PREFIX || 'share:\/\/';

/**
 * The boilerplate to deliver the package linked to report
 * returns exception on fail
 * @method deliver
 */
const deliver = async function ( report ) {
  let source_path = fileUrlToPath(report.package);
  let target_path = generateTargetPath(report);
  let connection = createConnection();
  try {
    await uploadPackage(connection, source_path, target_path);
  }
  catch(e){
    console.error(e);
    throw e;
  }
};

const createConnection = function(){
  let connection = {
    host: process.env.TARGET_HOST || 'sftp',
    username: process.env.TARGET_USERNAME,
    port: process.env.TARGET_PORT || 22,
    algorithms: { serverHostKey: ['ssh-dss'] }
  };

  if(process.env.TARGET_KEY)
    connection.privateKey = fs.readFileSync(process.env.TARGET_KEY);

  if(process.env.TARGET_PASSWORD)
    connection.password = process.env.TARGET_PASSWORD;

  return connection;
};

const uploadPackage = async function( connection, file_path, target_path ){
  let sftp = new Client();
  try {
    await sftp.connect(connection);
    await sftp.mkdir(path.dirname(target_path), true);
    await sftp.put(file_path, target_path);
  }
  finally{
    await sftp.end();
  }
};

const generateTargetPath = function( report ){
  //TODO: likely to change, depending on the specs of target system
  let file_name = path.basename(report.package);
  return path.join(process.env.TARGET_DIR, file_name);
};

/**
 * convert a file url (share://the/path/to/the/file) to the local path
 * courtesy: Niels Vandekeybus
 * e.g `filePath/the/path/to/the/file`
 * @method fileUrlToPath
 * @return {String}
 */
const fileUrlToPath = function(fileUrl) {
return fileUrl.replace(SHARE_PREFIX, DATA_ROOT);
};

export { deliver };
