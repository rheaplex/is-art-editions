#!/bin/bash

IN_DIR="./pdfs"
OUT_DIR="./images"
SIZE="3840x2160"
OTHERS=(burn griefing lottery proof-of-work proxy token)

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

for other in "${OTHERS[@]}"; do
    echo -n $other
    mkdir -p "$OUT_DIR/$other"
    cp ./images/image/is.png "$OUT_DIR/$other"
    echo ' .'
done

echo "DONE"
