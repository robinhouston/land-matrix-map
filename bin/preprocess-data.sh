#!/bin/bash

set -e

cartograms/bin/encode-country-names.py --country-col="Target Country" --code-col="Target Alpha-2" data/land-matrix.csv > data/x
cartograms/bin/encode-country-names.py --country-col="Investor Country 1" --code-col="Investor Country 1 Alpha-2" data/x > data/land-matrix-with-alpha-2.csv
rm data/x
