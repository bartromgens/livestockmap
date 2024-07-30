#!/usr/bin/env bash
set -e

cd client || exit
ng build
rsync -a dist/client/browser/ bart@romgens.com:/home/bart/webapps/static/livestockmap/client
