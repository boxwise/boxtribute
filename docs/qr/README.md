## QR labels of the staging/development database

For generation (e.g. after updating the seed) run

    git rm code-with-box-base-* without-box/*
    bash generate_pngs.bash
    git add code-with-box-base-* without-box/*

Then update the links in the repo-root README.

The script requires a running `db` docker-compose service and the `segno` package:

    docker-compose up -d db
    pip install segno
