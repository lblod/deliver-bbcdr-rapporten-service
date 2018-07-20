# deliver-bbcdr-rapporten-service
Microservice that delivers a package linked to a bbcdr report to an sftp endpoint.

## installation
To add the service to your stack, add the following snippet to docker-compose.yml:

```
services:
  packagereports:
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
```
## Development
For development options, see: [mu-javascipt-template](https://github.com/mu-semtech/mu-javascript-template)
