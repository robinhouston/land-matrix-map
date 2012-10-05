#!/bin/bash

cd "$(dirname "$0")"/../site

for filename in *
do
    case "$filename" in
    *.js)  mime_type=application/javascript ;;
    *.css) mime_type=text/css ;;
    *) mime_type=$(file --brief --mime-type "$filename") ;;
    esac
    aws put -v "Content-type: $mime_type" "x-amz-acl:public-read" \
        s3.boskent.com/land-matrix-map/"$filename" "$filename"
done

