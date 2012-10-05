#!/usr/bin/python

from __future__ import division

import csv
import optparse
import sys

def each_csv_row(filename):
  with open(filename) as f:
    r = csv.reader(f)
    header = r.next()
    for row in r:
      yield dict(zip(header, row))

parser = optparse.OptionParser()
parser.add_option("", "--multiplier",
                  action="store", default=1, type="int",
                  help="amount by which to multiply the proportional differences")

(options, args) = parser.parse_args()
if args:
  parser.error("Unexpected command-line argument: " + args[0])


before, after = {}, {}

for d in each_csv_row("data/area-with-alpha-2.csv"):
  area_str = d["Land area (sq. km)"]
  if area_str:
    alpha_2 = d["Alpha-2"]
    before[alpha_2] = after[alpha_2] = int(float(area_str) * 100)

for d in each_csv_row("data/land-matrix-with-alpha-2.csv"):
  hectares = int(d["Hectares"])
  target = d["Target Alpha-2"]
  investor = d["Investor Country 1 Alpha-2"]
  
  if investor == "":
    print >>sys.stderr, "No investor in deal " + d["Deal Number"]
    continue
  
  if target in after:
    after[target] -= hectares
  if investor in after:
    after[investor] += hectares

def exaggerate_difference(before, after, multiplier):
  if before == after:
    return after
  elif before < after:
    return before * ( (after/before - 1) * multiplier + 1 )
  else:
    return before / ( (before/after - 1) * multiplier + 1 )

with open("data/before-and-after.csv", 'w') as f:
  w = csv.writer(f)
  w.writerow(["Alpha-2", "Before", "After"])
  for country in before.keys():
    before_hectares, after_hectares = before[country], after[country]
    after_hectares = exaggerate_difference(before_hectares, after_hectares, options.multiplier)
    w.writerow([country, before_hectares, after_hectares])
