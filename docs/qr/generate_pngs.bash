#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"/../.. || exit 1

# Create one QR label (associated with box) per base
for camp_id in 1 2 3 4; do
    # Remove password warning and whitespace from output
    code=$(docker-compose exec -T db \
        mysql -u root -pdropapp_root -D dropapp_dev -ss -r \
        -e "select code from stock s inner join qr on s.qr_id = qr.id inner join locations loc on loc.id = s.location_id inner join camps c on c.id = loc.camp_id and c.id = $camp_id limit 1" 2>&1 | \
        grep -v password | \
        tr -d " \t"
    )
    echo Base $camp_id: "$code"
    segno "https://staging.boxwise.co/mobile.php?barcode=$code" \
        --output "$SCRIPT_DIR/code-with-box-base-$camp_id-$code.png" \
        --scale 8
done

# Create QR labels not yet associated with any boxes
docker-compose exec -T db \
    mysql -u root -pdropapp_root -D dropapp_dev -ss -r \
    -e "select code from qr left join stock s on s.qr_id = qr.id where s.qr_id is NULL limit 10" 2>&1 | \
    grep -v password | \
    tr -d " \t" | \
while read -r code; do
    echo No box: "$code"
    segno "https://staging.boxwise.co/mobile.php?barcode=$code" \
        --output "$SCRIPT_DIR/without-box/$code.png" \
        --scale 8
done
