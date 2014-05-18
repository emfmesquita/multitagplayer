#!/bin/bash
set -e
export DATABASE_URL=postgres://multitagplayer:multitagplayer@localhost:5432/multitagplayer  
mvn clean install -Dmaven.test.skip=true -Pdebug,embedded
sh multitagplayer-app/target/bin/webapp.sh