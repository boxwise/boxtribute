import asyncio

from ariadne import graphql
from flask import current_app, jsonify, request

from ..exceptions import format_database_errors
from .loaders import (
    BaseLoader,
    LocationLoader,
    ProductCategoryLoader,
    ProductLoader,
    SizeLoader,
    SizeRangeLoader,
    SizesForSizeRangeLoader,
    TagsForBoxLoader,
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
            "location_loader": LocationLoader(),
            "product_category_loader": ProductCategoryLoader(),
            "product_loader": ProductLoader(),
            "size_loader": SizeLoader(),
            "size_range_loader": SizeRangeLoader(),
            "sizes_for_size_range_loader": SizesForSizeRangeLoader(),
            "tags_for_box_loader": TagsForBoxLoader(),
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
