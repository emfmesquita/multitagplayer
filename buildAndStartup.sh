#!/bin/bash
set -e
mvn clean install -Dmaven.test.skip=true -Pdebug,embedded
sh multitagplayer-app/target/bin/webapp.sh