#!/bin/bash

. "$(dirname "$0")/_settings.sh"

cartograms/bin/as-js.py \
    --map "$MAP" \
    --simplification=2500 \
    --data-var=map_data \
    --db-name="$DB_NAME" --db-user="$DB_USER" --db-host="$DB_HOST" \
    --output-grid=1600x800 \
    data/cart/*.cart \
> site/data.js

echo "mapDataHaveLoaded();" >> site/data.js
