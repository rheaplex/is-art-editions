#!/bin/bash

NUM_TOKENS=16
OUT_DIR="./images/block-height/"
BLOCK_TIME=12
TICKS_PER_SECOND=100

mkdir -p "${OUT_DIR}"

for ((i=1; i<=NUM_TOKENS; i++)); do
    echo -n "$i "
    duration_seconds=$(($i * $BLOCK_TIME))
    duration_ticks=$(($duration_seconds * $TICKS_PER_SECOND))
    convert -delay ${duration_ticks} \
            ./images/image/is-not.png \
            -delay ${duration_ticks} \
            ./images/image/is.png  \
            "${OUT_DIR}/${i}.gif"
done

echo
