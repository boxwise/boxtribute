import asyncio
from typing import Any

import ariadne
import graphql
from flask import current_app, g, jsonify, request

from ..authz import check_user_beta_level
from ..exceptions import format_database_errors
from .loaders import (
    BaseLoader,
    BoxLoader,
    HistoryForBoxLoader,
    InstockItemsCountForProductLoader,
    LocationLoader,
    OrganisationLoader,
    ProductCategoryLoader,
    ProductLoader,
    QrCodeLoader,
    ResourcesForTagLoader,
    ShipmentDetailAutoMatchingLoader,
    ShipmentDetailForBoxLoader,
    ShipmentDetailsForShipmentLoader,
    ShipmentLoader,
    ShipmentsForAgreementLoader,
    SizeLoader,
    SizeRangeLoader,
    SizesForSizeRangeLoader,
    SourceBasesForAgreementLoader,
    StandardProductLoader,
    TagLastUsedOnLoader,
    TagsForBoxLoader,
    TargetBasesForAgreementLoader,
    TransferAgreementLoader,
    TransferItemsCountForProductLoader,
    UnitLoader,
    UnitsForDimensionLoader,
    UserLoader,
)


def parse_with_beta_level_check(_, data: dict[str, Any]) -> graphql.DocumentNode:
    """Custom GraphQL parser running a beta-level check on the payload of the incoming
    request.
    """
    graphql_document = graphql.parse(data["query"])
    authzed = check_user_beta_level(graphql_document, current_user=g.user)
    if not authzed:
        # This will be caught in ariadne.graphql() and added to the "errors" field of
        # the response
        raise graphql.GraphQLError("Insufficient beta-level")
    return graphql_document


def execute_async(*, schema, introspection=None, data=None, check_beta_level=False):
    """Create coroutine and execute it with high-level `asyncio.run` which takes care of
    managing the asyncio event loop, finalizing asynchronous generators, and closing
    the threadpool.
    """

    async def run():
        # Create DataLoaders and persist them for the time of processing the request.
        # DataLoaders require an event loop which is set up by asyncio.run
        context = {
            "base_loader": BaseLoader(),
            "box_loader": BoxLoader(),
            "history_for_box_loader": HistoryForBoxLoader(),
            "instock_items_count_for_product_loader": InstockItemsCountForProductLoader(),  # noqa
            "transfer_items_count_for_product_loader": TransferItemsCountForProductLoader(),  # noqa
            "location_loader": LocationLoader(),
            "organisation_loader": OrganisationLoader(),
            "product_category_loader": ProductCategoryLoader(),
            "product_loader": ProductLoader(),
            "qr_code_loader": QrCodeLoader(),
            "resources_for_tag_loader": ResourcesForTagLoader(),
            "shipment_detail_auto_matching_loader": ShipmentDetailAutoMatchingLoader(),
            "shipment_detail_for_box_loader": ShipmentDetailForBoxLoader(),
            "shipment_details_for_shipment_loader": ShipmentDetailsForShipmentLoader(),
            "shipment_loader": ShipmentLoader(),
            "shipments_for_agreement_loader": ShipmentsForAgreementLoader(),
            "size_loader": SizeLoader(),
            "size_range_loader": SizeRangeLoader(),
            "sizes_for_size_range_loader": SizesForSizeRangeLoader(),
            "source_bases_for_agreement_loader": SourceBasesForAgreementLoader(),
            "standard_product_loader": StandardProductLoader(),
            "tag_last_used_on_loader": TagLastUsedOnLoader(),
            "tags_for_box_loader": TagsForBoxLoader(),
            "target_bases_for_agreement_loader": TargetBasesForAgreementLoader(),
            "transfer_agreement_loader": TransferAgreementLoader(),
            "units_for_dimension_loader": UnitsForDimensionLoader(),
            "unit_loader": UnitLoader(),
            "user_loader": UserLoader(),
        }

        # Execute the GraphQL request against schema, passing in context
        results = await ariadne.graphql(
            schema,
            data=data or request.get_json(),
            query_parser=parse_with_beta_level_check if check_beta_level else None,
            context_value=context,
            debug=current_app.debug,
            introspection=current_app.debug if introspection is None else introspection,
            error_formatter=format_database_errors,
        )
        return results

    success, result = asyncio.run(run())

    status_code = 200 if success else 400
    return jsonify(result), status_code
