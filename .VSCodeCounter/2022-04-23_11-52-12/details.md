# Details

Date : 2022-04-23 11:52:12

Directory /Users/danielspaude/code/boxtribute/boxtribute/back

Total : 115 files,  7658 codes, 1749 comments, 1760 blanks, all 11167 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [back/Dockerfile](/back/Dockerfile) | Docker | 14 | 8 | 6 | 28 |
| [back/README.md](/back/README.md) | Markdown | 221 | 0 | 143 | 364 |
| [back/app-api.yaml](/back/app-api.yaml) | YAML | 15 | 0 | 1 | 16 |
| [back/app.yaml](/back/app.yaml) | YAML | 19 | 0 | 1 | 20 |
| [back/boxtribute_server/__init__.py](/back/boxtribute_server/__init__.py) | Python | 2 | 0 | 2 | 4 |
| [back/boxtribute_server/app.py](/back/boxtribute_server/app.py) | Python | 11 | 4 | 8 | 23 |
| [back/boxtribute_server/auth.py](/back/boxtribute_server/auth.py) | Python | 171 | 34 | 34 | 239 |
| [back/boxtribute_server/authz.py](/back/boxtribute_server/authz.py) | Python | 38 | 11 | 7 | 56 |
| [back/boxtribute_server/box_transfer/__init__.py](/back/boxtribute_server/box_transfer/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [back/boxtribute_server/box_transfer/agreement.py](/back/boxtribute_server/box_transfer/agreement.py) | Python | 128 | 35 | 20 | 183 |
| [back/boxtribute_server/box_transfer/shipment.py](/back/boxtribute_server/box_transfer/shipment.py) | Python | 264 | 60 | 46 | 370 |
| [back/boxtribute_server/db.py](/back/boxtribute_server/db.py) | Python | 7 | 4 | 4 | 15 |
| [back/boxtribute_server/enums.py](/back/boxtribute_server/enums.py) | Python | 45 | 4 | 18 | 67 |
| [back/boxtribute_server/exceptions.py](/back/boxtribute_server/exceptions.py) | Python | 88 | 13 | 25 | 126 |
| [back/boxtribute_server/graph_ql/__init__.py](/back/boxtribute_server/graph_ql/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [back/boxtribute_server/graph_ql/definitions.py](/back/boxtribute_server/graph_ql/definitions.py) | Python | 8 | 2 | 5 | 15 |
| [back/boxtribute_server/graph_ql/enums.py](/back/boxtribute_server/graph_ql/enums.py) | Python | 19 | 0 | 3 | 22 |
| [back/boxtribute_server/graph_ql/filtering.py](/back/boxtribute_server/graph_ql/filtering.py) | Python | 56 | 9 | 17 | 82 |
| [back/boxtribute_server/graph_ql/inputs.graphql](/back/boxtribute_server/graph_ql/inputs.graphql) | GraphQL | 74 | 8 | 9 | 91 |
| [back/boxtribute_server/graph_ql/mutations.graphql](/back/boxtribute_server/graph_ql/mutations.graphql) | GraphQL | 15 | 5 | 3 | 23 |
| [back/boxtribute_server/graph_ql/pagination.py](/back/boxtribute_server/graph_ql/pagination.py) | Python | 102 | 80 | 31 | 213 |
| [back/boxtribute_server/graph_ql/queries.graphql](/back/boxtribute_server/graph_ql/queries.graphql) | GraphQL | 33 | 6 | 1 | 40 |
| [back/boxtribute_server/graph_ql/resolvers.py](/back/boxtribute_server/graph_ql/resolvers.py) | Python | 522 | 70 | 185 | 777 |
| [back/boxtribute_server/graph_ql/scalars.py](/back/boxtribute_server/graph_ql/scalars.py) | Python | 14 | 0 | 9 | 23 |
| [back/boxtribute_server/graph_ql/schema.py](/back/boxtribute_server/graph_ql/schema.py) | Python | 28 | 0 | 4 | 32 |
| [back/boxtribute_server/graph_ql/types.graphql](/back/boxtribute_server/graph_ql/types.graphql) | GraphQL | 364 | 142 | 74 | 580 |
| [back/boxtribute_server/main.py](/back/boxtribute_server/main.py) | Python | 15 | 1 | 3 | 19 |
| [back/boxtribute_server/models/__init__.py](/back/boxtribute_server/models/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [back/boxtribute_server/models/crud.py](/back/boxtribute_server/models/crud.py) | Python | 171 | 32 | 31 | 234 |
| [back/boxtribute_server/models/definitions/__init__.py](/back/boxtribute_server/models/definitions/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [back/boxtribute_server/models/definitions/base.py](/back/boxtribute_server/models/definitions/base.py) | Python | 97 | 0 | 6 | 103 |
| [back/boxtribute_server/models/definitions/beneficiary.py](/back/boxtribute_server/models/definitions/beneficiary.py) | Python | 94 | 0 | 5 | 99 |
| [back/boxtribute_server/models/definitions/box.py](/back/boxtribute_server/models/definitions/box.py) | Python | 93 | 6 | 5 | 104 |
| [back/boxtribute_server/models/definitions/box_state.py](/back/boxtribute_server/models/definitions/box_state.py) | Python | 6 | 0 | 5 | 11 |
| [back/boxtribute_server/models/definitions/history.py](/back/boxtribute_server/models/definitions/history.py) | Python | 23 | 0 | 5 | 28 |
| [back/boxtribute_server/models/definitions/language.py](/back/boxtribute_server/models/definitions/language.py) | Python | 13 | 0 | 5 | 18 |
| [back/boxtribute_server/models/definitions/location.py](/back/boxtribute_server/models/definitions/location.py) | Python | 52 | 0 | 5 | 57 |
| [back/boxtribute_server/models/definitions/log.py](/back/boxtribute_server/models/definitions/log.py) | Python | 9 | 0 | 5 | 14 |
| [back/boxtribute_server/models/definitions/organisation.py](/back/boxtribute_server/models/definitions/organisation.py) | Python | 25 | 0 | 5 | 30 |
| [back/boxtribute_server/models/definitions/product.py](/back/boxtribute_server/models/definitions/product.py) | Python | 63 | 0 | 5 | 68 |
| [back/boxtribute_server/models/definitions/product_category.py](/back/boxtribute_server/models/definitions/product_category.py) | Python | 15 | 0 | 5 | 20 |
| [back/boxtribute_server/models/definitions/product_gender.py](/back/boxtribute_server/models/definitions/product_gender.py) | Python | 34 | 0 | 5 | 39 |
| [back/boxtribute_server/models/definitions/qr_code.py](/back/boxtribute_server/models/definitions/qr_code.py) | Python | 12 | 0 | 6 | 18 |
| [back/boxtribute_server/models/definitions/shipment.py](/back/boxtribute_server/models/definitions/shipment.py) | Python | 36 | 0 | 4 | 40 |
| [back/boxtribute_server/models/definitions/shipment_detail.py](/back/boxtribute_server/models/definitions/shipment_detail.py) | Python | 24 | 0 | 4 | 28 |
| [back/boxtribute_server/models/definitions/size.py](/back/boxtribute_server/models/definitions/size.py) | Python | 35 | 0 | 5 | 40 |
| [back/boxtribute_server/models/definitions/size_range.py](/back/boxtribute_server/models/definitions/size_range.py) | Python | 7 | 0 | 5 | 12 |
| [back/boxtribute_server/models/definitions/transaction.py](/back/boxtribute_server/models/definitions/transaction.py) | Python | 36 | 3 | 5 | 44 |
| [back/boxtribute_server/models/definitions/transfer_agreement.py](/back/boxtribute_server/models/definitions/transfer_agreement.py) | Python | 44 | 0 | 4 | 48 |
| [back/boxtribute_server/models/definitions/transfer_agreement_detail.py](/back/boxtribute_server/models/definitions/transfer_agreement_detail.py) | Python | 10 | 0 | 3 | 13 |
| [back/boxtribute_server/models/definitions/user.py](/back/boxtribute_server/models/definitions/user.py) | Python | 40 | 0 | 5 | 45 |
| [back/boxtribute_server/models/definitions/x_beneficiary_language.py](/back/boxtribute_server/models/definitions/x_beneficiary_language.py) | Python | 24 | 0 | 4 | 28 |
| [back/boxtribute_server/models/fields.py](/back/boxtribute_server/models/fields.py) | Python | 16 | 33 | 12 | 61 |
| [back/boxtribute_server/models/metrics.py](/back/boxtribute_server/models/metrics.py) | Python | 113 | 26 | 18 | 157 |
| [back/boxtribute_server/models/utils.py](/back/boxtribute_server/models/utils.py) | Python | 3 | 4 | 3 | 10 |
| [back/boxtribute_server/routes.py](/back/boxtribute_server/routes.py) | Python | 69 | 9 | 22 | 100 |
| [back/gunicorn.conf.py](/back/gunicorn.conf.py) | Python | 4 | 4 | 1 | 9 |
| [back/init.sql](/back/init.sql) | SQL | 1,180 | 282 | 188 | 1,650 |
| [back/requirements.txt](/back/requirements.txt) | pip requirements | 10 | 0 | 1 | 11 |
| [back/scripts/list_models.py](/back/scripts/list_models.py) | Python | 27 | 8 | 10 | 45 |
| [back/scripts/load-test.js](/back/scripts/load-test.js) | JavaScript | 37 | 43 | 10 | 90 |
| [back/setup.cfg](/back/setup.cfg) | Properties | 25 | 0 | 6 | 31 |
| [back/setup.py](/back/setup.py) | Python | 14 | 1 | 3 | 18 |
| [back/test/auth.py](/back/test/auth.py) | Python | 74 | 17 | 16 | 107 |
| [back/test/auth_tests/__init__.py](/back/test/auth_tests/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [back/test/auth_tests/test_auth.py](/back/test/auth_tests/test_auth.py) | Python | 15 | 0 | 9 | 24 |
| [back/test/auth_tests/test_authz.py](/back/test/auth_tests/test_authz.py) | Python | 82 | 0 | 17 | 99 |
| [back/test/conftest.py](/back/test/conftest.py) | Python | 68 | 47 | 22 | 137 |
| [back/test/data/__init__.py](/back/test/data/__init__.py) | Python | 152 | 14 | 14 | 180 |
| [back/test/data/base.py](/back/test/data/base.py) | Python | 42 | 0 | 9 | 51 |
| [back/test/data/beneficiary.py](/back/test/data/beneficiary.py) | Python | 65 | 2 | 16 | 83 |
| [back/test/data/box.py](/back/test/data/box.py) | Python | 90 | 0 | 32 | 122 |
| [back/test/data/box_state.py](/back/test/data/box_state.py) | Python | 12 | 0 | 9 | 21 |
| [back/test/data/history.py](/back/test/data/history.py) | Python | 10 | 0 | 7 | 17 |
| [back/test/data/language.py](/back/test/data/language.py) | Python | 6 | 0 | 5 | 11 |
| [back/test/data/location.py](/back/test/data/location.py) | Python | 54 | 0 | 19 | 73 |
| [back/test/data/log.py](/back/test/data/log.py) | Python | 10 | 0 | 7 | 17 |
| [back/test/data/organisation.py](/back/test/data/organisation.py) | Python | 21 | 0 | 9 | 30 |
| [back/test/data/product.py](/back/test/data/product.py) | Python | 35 | 0 | 13 | 48 |
| [back/test/data/product_category.py](/back/test/data/product_category.py) | Python | 16 | 0 | 9 | 25 |
| [back/test/data/product_gender.py](/back/test/data/product_gender.py) | Python | 12 | 0 | 9 | 21 |
| [back/test/data/qr_code.py](/back/test/data/qr_code.py) | Python | 17 | 0 | 11 | 28 |
| [back/test/data/shipment.py](/back/test/data/shipment.py) | Python | 61 | 0 | 15 | 76 |
| [back/test/data/shipment_detail.py](/back/test/data/shipment_detail.py) | Python | 56 | 0 | 12 | 68 |
| [back/test/data/size.py](/back/test/data/size.py) | Python | 15 | 0 | 11 | 26 |
| [back/test/data/size_range.py](/back/test/data/size_range.py) | Python | 10 | 0 | 7 | 17 |
| [back/test/data/transaction.py](/back/test/data/transaction.py) | Python | 39 | 1 | 14 | 54 |
| [back/test/data/transfer_agreement.py](/back/test/data/transfer_agreement.py) | Python | 62 | 0 | 17 | 79 |
| [back/test/data/transfer_agreement_detail.py](/back/test/data/transfer_agreement_detail.py) | Python | 20 | 0 | 8 | 28 |
| [back/test/data/user.py](/back/test/data/user.py) | Python | 70 | 0 | 20 | 90 |
| [back/test/endpoint_tests/__init__.py](/back/test/endpoint_tests/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [back/test/endpoint_tests/conftest.py](/back/test/endpoint_tests/conftest.py) | Python | 13 | 10 | 6 | 29 |
| [back/test/endpoint_tests/test_app.py](/back/test/endpoint_tests/test_app.py) | Python | 96 | 29 | 18 | 143 |
| [back/test/endpoint_tests/test_base.py](/back/test/endpoint_tests/test_base.py) | Python | 23 | 15 | 10 | 48 |
| [back/test/endpoint_tests/test_beneficiary.py](/back/test/endpoint_tests/test_beneficiary.py) | Python | 189 | 108 | 21 | 318 |
| [back/test/endpoint_tests/test_box.py](/back/test/endpoint_tests/test_box.py) | Python | 83 | 61 | 13 | 157 |
| [back/test/endpoint_tests/test_location.py](/back/test/endpoint_tests/test_location.py) | Python | 19 | 17 | 5 | 41 |
| [back/test/endpoint_tests/test_metrics.py](/back/test/endpoint_tests/test_metrics.py) | Python | 123 | 3 | 14 | 140 |
| [back/test/endpoint_tests/test_organisation.py](/back/test/endpoint_tests/test_organisation.py) | Python | 13 | 6 | 5 | 24 |
| [back/test/endpoint_tests/test_permissions.py](/back/test/endpoint_tests/test_permissions.py) | Python | 175 | 66 | 39 | 280 |
| [back/test/endpoint_tests/test_product.py](/back/test/endpoint_tests/test_product.py) | Python | 19 | 14 | 5 | 38 |
| [back/test/endpoint_tests/test_product_categories.py](/back/test/endpoint_tests/test_product_categories.py) | Python | 16 | 14 | 5 | 35 |
| [back/test/endpoint_tests/test_qr.py](/back/test/endpoint_tests/test_qr.py) | Python | 41 | 20 | 14 | 75 |
| [back/test/endpoint_tests/test_shipment.py](/back/test/endpoint_tests/test_shipment.py) | Python | 483 | 175 | 66 | 724 |
| [back/test/endpoint_tests/test_simple.py](/back/test/endpoint_tests/test_simple.py) | Python | 13 | 0 | 5 | 18 |
| [back/test/endpoint_tests/test_transfer_agreement.py](/back/test/endpoint_tests/test_transfer_agreement.py) | Python | 167 | 83 | 27 | 277 |
| [back/test/endpoint_tests/test_user.py](/back/test/endpoint_tests/test_user.py) | Python | 18 | 12 | 7 | 37 |
| [back/test/integration_tests/__init__.py](/back/test/integration_tests/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [back/test/integration_tests/conftest.py](/back/test/integration_tests/conftest.py) | Python | 12 | 5 | 5 | 22 |
| [back/test/integration_tests/test_jwt.py](/back/test/integration_tests/test_jwt.py) | Python | 61 | 7 | 13 | 81 |
| [back/test/integration_tests/test_operations.py](/back/test/integration_tests/test_operations.py) | Python | 69 | 29 | 19 | 117 |
| [back/test/model_tests/conftest.py](/back/test/model_tests/conftest.py) | Python | 13 | 5 | 4 | 22 |
| [back/test/model_tests/test_all.py](/back/test/model_tests/test_all.py) | Python | 46 | 4 | 14 | 64 |
| [back/test/model_tests/test_crud.py](/back/test/model_tests/test_crud.py) | Python | 85 | 13 | 17 | 115 |
| [back/test/utils.py](/back/test/utils.py) | Python | 33 | 25 | 14 | 72 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)