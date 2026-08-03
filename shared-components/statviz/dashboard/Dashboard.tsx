import { Accordion, Heading } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import BeneficiaryOverview from "./BeneficiaryOverview";
import GuideBanner from "./GuideBanner";
import MovedBoxes from "./MovedBoxes";
import StockOverview from "./StockOverview";
import InfoText from "./InfoText";
import { DASHBOARD_FILTER_DATA_QUERY } from "../queries/queries";
import ErrorCard from "../components/ErrorCard";
import { isFreeShopVolunteer, isWarehouseVolunteer } from "../../utils/roles";
import type {
  IProductOption,
  ICategoryOption,
  ILocationOption,
  ITagOption,
} from "../utils/dashboardFilters";
import type { TagType } from "../../../graphql/types";

interface DashboardProps {
  roles?: string[];
}

export default function Dashboard({ roles = [] }: DashboardProps) {
  const { baseId } = useParams();

  // Determine section visibility based on roles
  const freeShopOnly = isFreeShopVolunteer(roles) && !isWarehouseVolunteer(roles);
  const warehouseOnly = isWarehouseVolunteer(roles) && !isFreeShopVolunteer(roles);
  const showStock = !freeShopOnly;
  const showMovedBoxes = !freeShopOnly;
  const showBeneficiary = !warehouseOnly;

  // Compute accordion index for each visible section
  let idx = 0;
  const stockIdx = showStock ? idx++ : -1;
  const movedBoxesIdx = showMovedBoxes ? idx++ : -1;
  const beneficiaryIdx = showBeneficiary ? idx++ : -1;

  const [everOpened, setEverOpened] = useState<Set<number>>(new Set());

  const handleAccordionChange = (indices: number | number[]) => {
    const next = Array.isArray(indices) ? indices : [indices];
    setEverOpened((prev) => new Set([...prev, ...next]));
  };

  const { data, error } = useQuery(DASHBOARD_FILTER_DATA_QUERY, {
    variables: { baseId: baseId! },
  });

  const products = useMemo<IProductOption[]>(
    () =>
      (data?.base?.products ?? []).map((p) => ({
        id: Number(p.id),
        name: p.name,
        gender: p.gender ?? null,
      })),
    [data],
  );

  const categories = useMemo<ICategoryOption[]>(() => {
    const seen = new Set<number>();
    const result: ICategoryOption[] = [];
    for (const product of data?.base?.products ?? []) {
      const catId = Number(product.category.id);
      if (!seen.has(catId)) {
        seen.add(catId);
        result.push({ id: catId, name: product.category.name });
      }
    }
    return result;
  }, [data]);

  const locations = useMemo<ILocationOption[]>(
    () =>
      (data?.base?.locations ?? []).map((l) => ({
        id: Number(l.id),
        name: l.name ?? "",
      })),
    [data],
  );

  const allTags = useMemo<ITagOption[]>(
    () =>
      (data?.base?.tags ?? []).map((t) => ({
        id: Number(t.id),
        name: t.name,
        color: t.color ?? "#999",
        type: t.type as TagType,
        value: String(t.id),
        label: t.name,
        urlId: String(t.id),
      })),
    [data],
  );

  const boxTags = useMemo<ITagOption[]>(
    () => allTags.filter((t) => t.type === "Box" || t.type === "All"),
    [allTags],
  );

  const beneficiaryTags = useMemo<ITagOption[]>(
    () => allTags.filter((t) => t.type === "Beneficiary" || t.type === "All"),
    [allTags],
  );

  if (error) {
    return <ErrorCard error={error.message} />;
  }

  return (
    <div>
      <Heading style={{ marginBottom: "15px" }}>Dashboard</Heading>
      <InfoText />
      <GuideBanner />
      <Accordion
        defaultIndex={[]}
        allowMultiple
        marginBottom="100px"
        onChange={handleAccordionChange}
      >
        {showStock && (
          <StockOverview
            isActive={everOpened.has(stockIdx)}
            products={products}
            categories={categories}
            locations={locations}
            tags={boxTags}
          />
        )}
        {showMovedBoxes && (
          <MovedBoxes
            isActive={everOpened.has(movedBoxesIdx)}
            products={products}
            categories={categories}
            tags={boxTags}
          />
        )}
        {showBeneficiary && (
          <BeneficiaryOverview isActive={everOpened.has(beneficiaryIdx)} tags={beneficiaryTags} />
        )}
      </Accordion>
    </div>
  );
}
