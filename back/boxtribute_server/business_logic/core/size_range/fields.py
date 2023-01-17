from ariadne import ObjectType

size_range = ObjectType("SizeRange")


@size_range.field("sizes")
def resolve_size_range_sizes(size_range_obj, info):
    return info.context["sizes_for_size_range_loader"].load(size_range_obj.id)
