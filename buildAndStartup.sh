#!/bin/bash
set -e
mvn clean install -Dmaven.test.skip=true -Pdebug
sh multitagplayer-app/target/bin/webapp.sh