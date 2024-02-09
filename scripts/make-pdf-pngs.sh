#!/bin/bash

IN_DIR="./pdfs"
OUT_DIR="./images"
SIZE="3840x2160"

echo "STARTING"

mkdir -p "${OUT_DIR}"

for path in "$IN_DIR/"*; do
    dir=`basename "$path"`
    echo -n $dir
    mkdir -p "$OUT_DIR/$dir"
    for pdf in "$IN_DIR/$dir/"*.pdf; do
        echo -n ' .'
        name=`basename $pdf .pdf`
        convert "$pdf" \
                -gravity center \
                -resize $SIZE \
                -extent $SIZE \
                "$OUT_DIR/$dir/$name.png"
    done
    echo ''
done

echo "DONE"
