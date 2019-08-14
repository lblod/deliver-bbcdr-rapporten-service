# deliver-bbcdr-rapporten-service
Microservice that delivers a package linked to a BBCDR report to an sftp endpoint.

## Installation
To add the service to your stack, add the following snippet to docker-compose.yml:

```
services:
  deliverreports:
    image: lblod/deliver-bbcdr-rapporten-service

```
### Environment variables
```
  TARGET_HOST: optional, default 'sftp'
  TARGET_USERNAME: required, 'aUsername'
  TARGET_PORT: optional, default '22'
  TARGET_KEY: optional
  TARGET_PASSWORD: optional
  TARGET_DIR: optional
  ENABLE_CREATE_TARGET_DIR: optional, default 'false'
  PACKAGE_CRON_PATTERN: optional, default '*/30 * * * * *'
  HOURS_DELIVERING_TIMEOUT: optional,  default '3'
  FILE_PATH: optional, default '/data/files'
  SHARE_PREFIX: optional, default 'share:\/\/'
  DISABLE_SSH_DSS: optional, default empty (useful in testing scenarios)
  PING_DB_INTERVAL: optional, default '2' (seconds)
```
## Development
For development options, see: [mu-javascipt-template](https://github.com/mu-semtech/mu-javascript-template)

To test the full flow, you can include
```
  sftp:
    image: atmoz/sftp
    volumes:
      - ./data/sftpfiles:/home/user
    ports:
      - "2222:22"
    command: user:aPassword:::share
```
in your `docker-compose.override.yml` or use an independent service [sftp-service](https://github.com/lblod/sftp-service).
Probably, you will want to enable the flag `DISABLE_SSH_DSS` to make it work on normal sftp servers.
