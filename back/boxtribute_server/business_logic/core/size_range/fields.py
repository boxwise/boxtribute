from ariadne import ObjectType

size = ObjectType("Size")
size_range = ObjectType("SizeRange")


@size.field("name")
def resolve_size_name(size_obj, _):
    return size_obj.label


@size_range.field("name")
def resolve_size_range_name(size_range_obj, _):
    return size_range_obj.label


@size_range.field("sizes")
def resolve_size_range_sizes(size_range_obj, info):
    return info.context["sizes_for_size_range_loader"].load(size_range_obj.id)


@size_range.field("units")
def resolve_size_range_units(size_range_obj, info):
    return info.context["units_for_dimension_loader"].load(size_range_obj.id)
