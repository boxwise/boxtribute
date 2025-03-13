import asyncio

from ariadne import graphql
from flask import current_app, jsonify, request

from ..exceptions import format_database_errors
from .loaders import (
    BaseLoader,
    BoxLoader,
    HistoryForBoxLoader,
    ItemsCountForProductLoader,
    LocationLoader,
    OrganisationLoader,
    ProductCategoryLoader,
    ProductLoader,
    ShipmentDetailAutoMatchingLoader,
    ShipmentDetailForBoxLoader,
    ShipmentDetailsForShipmentLoader,
    ShipmentLoader,
    ShipmentsForAgreementLoader,
    SizeLoader,
    SizeRangeLoader,
    SizesForSizeRangeLoader,
    StandardProductLoader,
    TagsForBoxLoader,
    TransferAgreementLoader,
    UnitLoader,
    UnitsForDimensionLoader,
    UserLoader,
)


def execute_async(*, schema, introspection=None):
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
            "items_count_for_product_loader": ItemsCountForProductLoader(),
            "location_loader": LocationLoader(),
            "organisation_loader": OrganisationLoader(),
            "product_category_loader": ProductCategoryLoader(),
            "product_loader": ProductLoader(),
            "shipment_detail_auto_matching_loader": ShipmentDetailAutoMatchingLoader(),
            "shipment_detail_for_box_loader": ShipmentDetailForBoxLoader(),
            "shipment_details_for_shipment_loader": ShipmentDetailsForShipmentLoader(),
            "shipment_loader": ShipmentLoader(),
            "shipments_for_agreement_loader": ShipmentsForAgreementLoader(),
            "size_loader": SizeLoader(),
            "size_range_loader": SizeRangeLoader(),
            "sizes_for_size_range_loader": SizesForSizeRangeLoader(),
            "standard_product_loader": StandardProductLoader(),
            "tags_for_box_loader": TagsForBoxLoader(),
            "transfer_agreement_loader": TransferAgreementLoader(),
            "units_for_dimension_loader": UnitsForDimensionLoader(),
            "unit_loader": UnitLoader(),
            "user_loader": UserLoader(),
        }

        # Execute the GraphQL request against schema, passing in context
        results = await graphql(
            schema,
            data=request.get_json(),
            context_value=context,
            debug=current_app.debug,
            introspection=current_app.debug if introspection is None else introspection,
            error_formatter=format_database_errors,
        )
        return results

    success, result = asyncio.run(run())

    status_code = 200 if success else 400
    return jsonify(result), status_code
