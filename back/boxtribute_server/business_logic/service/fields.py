from ariadne import ObjectType

service = ObjectType("Service")
service_usage = ObjectType("ServiceUsage")


@service.field("totalUsage")
async def resolve_service_total_usage(service_obj, info):
    statistics = await info.context["usage_statistics_for_service_loader"].load(
        service_obj.id
    )
    return statistics["total_usage"]


@service.field("uniqueUsage")
async def resolve_service_unique_usage(service_obj, info):
    statistics = await info.context["usage_statistics_for_service_loader"].load(
        service_obj.id
    )
    return statistics["unique_usage"]


@service.field("lastUsedOn")
async def resolve_service_last_used_on(service_obj, info):
    statistics = await info.context["usage_statistics_for_service_loader"].load(
        service_obj.id
    )
    return statistics["last_used_on"]


@service_usage.field("service")
def resolve_service_usage_service(usage_obj, info):
    return info.context["service_loader"].load(usage_obj.service_id)


@service_usage.field("usedOn")
def resolve_service_usage_used_on(usage_obj, _):
    return usage_obj.created_on


@service_usage.field("registeredBy")
def resolve_service_usage_registered_by(usage_obj, info):
    return info.context["user_loader"].load(usage_obj.created_by_id)
