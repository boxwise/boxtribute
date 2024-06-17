## QR labels of the staging/development database

For generation (e.g. after updating the seed) run

    bash generate_pngs.bash

The script requires a running `db` docker-compose service and the `segno` package:

    docker-compose up -d db
    pip install segno
