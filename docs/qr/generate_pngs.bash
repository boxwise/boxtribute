#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"/../.. || exit 1

# Create one QR label (associated with box) per base
for camp_id in 1 2 3 4; do
    # Remove password warning and whitespace from output
    code=$(docker-compose exec -T db \
        mysql -u root -pdropapp_root -D dropapp_dev -ss -r \
        -e "select code from stock s inner join qr on s.qr_id = qr.id inner join locations loc on loc.id = s.location_id and loc.camp_id = $camp_id order by qr.id limit 1" 2>&1 | \
        grep -v password | \
        tr -d " \t"
    )
    echo Base $camp_id: "$code"
    segno "https://staging.boxwise.co/mobile.php?barcode=$code" \
        --output "$SCRIPT_DIR/code-with-box-base-$camp_id-$code.png" \
        --scale 8
done

WITHOUT_BOX_DIR="$SCRIPT_DIR"/without-box
mkdir -p "$WITHOUT_BOX_DIR"
# Create QR labels not yet associated with any boxes
docker-compose exec -T db \
    mysql -u root -pdropapp_root -D dropapp_dev -ss -r \
    -e "select code from qr left join stock s on s.qr_id = qr.id where s.qr_id is NULL order by qr.id limit 10" 2>&1 | \
    grep -v password | \
    tr -d " \t" | \
while read -r code; do
    echo No box: "$code"
    segno "https://staging.boxwise.co/mobile.php?barcode=$code" \
        --output "$WITHOUT_BOX_DIR/$code.png" \
        --scale 8
done

NOT_IN_DATABASE_DIR="$SCRIPT_DIR"/not-in-database
mkdir -p "$NOT_IN_DATABASE_DIR"
max_qr_id=$(docker-compose exec -T db \
    mysql -u root -pdropapp_root -D dropapp_dev -ss -r \
    -e "SELECT MAX(id) FROM qr" 2>&1 | \
    grep -v password | \
    tr -d " \t"
)
echo Largest QR ID: "$max_qr_id"
for i in $(seq 1001 1005); do
    qr_id=$((max_qr_id + i))
    # Generate MD5 hash like in qr_code/crud.py
    code=$(python -c "import hashlib; print(hashlib.md5(str($qr_id).encode()).hexdigest())")
    echo Not in DB: "$code"
    segno "https://staging.boxwise.co/mobile.php?barcode=$code" \
        --output "$NOT_IN_DATABASE_DIR/$code.png" \
        --scale 8
done
