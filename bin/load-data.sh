#!/bin/bash

. "$(dirname "$0")/_settings.sh"

load() {
    dataset=$1
    shift
    
    echo "Loading $PREFIX:$dataset..."
    cartograms/bin/delete-data.py --db-name="$DB_NAME" --db-user="$DB_USER" --db-host="$DB_HOST" $PREFIX:"$dataset"
    cartograms/bin/load-data.py --db-name="$DB_NAME" --db-user="$DB_USER" --db-host="$DB_HOST" $PREFIX:"$dataset" "$@"
}

carter() {
    dataset=$1
    
    echo "Generating density grid for $dataset..."
    cartograms/bin/density-grid.py \
        --dataset $PREFIX:"$dataset" \
        --map "$MAP" \
        --db-name="$DB_NAME" --db-user="$DB_USER" --db-host="$DB_HOST" \
    > data/cart/"$dataset".density \
    && \
    ~/Side\ projects/newman-cart/cart --blur=1 --progress=detailed 1500 750 data/cart/"$dataset".density data/cart/"$dataset".cart
}

load before data/before-and-after.csv "$DIVISION" Alpha-2 Before
load after data/before-and-after.csv "$DIVISION" Alpha-2 After

carter before
carter after
