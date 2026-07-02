import { Accordion, Heading } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import BeneficiaryOverview from "./BeneficiaryOverview";
import MovedBoxes from "./MovedBoxes";
import StockOverview from "./StockOverview";
import InfoText from "./InfoText";
import { graphql } from "../../../graphql/graphql";
import ErrorCard from "../components/ErrorCard";
import type {
  IProductOption,
  ICategoryOption,
  ILocationOption,
  ITagOption,
} from "../utils/dashboardFilters";

export const DASHBOARD_FILTER_DATA_QUERY = graphql(`
  query DashboardFilterData($baseId: ID!) {
    base(id: $baseId) {
      products {
        id
        name
        gender
        category {
          id
          name
        }
      }
      locations {
        id
        name
      }
      tags {
        id
        name
        color
      }
    }
  }
`);

export default function Dashboard() {
  const { baseId } = useParams();
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

  const tags = useMemo<ITagOption[]>(
    () =>
      (data?.base?.tags ?? []).map((t) => ({
        id: Number(t.id),
        name: t.name,
        color: t.color ?? "#999",
        value: String(t.id),
        label: t.name,
        urlId: String(t.id),
      })),
    [data],
  );

  if (error) {
    return <ErrorCard error={error.message} />;
  }

  return (
    <div>
      <Heading style={{ marginBottom: "15px" }}>Dashboard</Heading>
      <InfoText />

      <Accordion defaultIndex={[0]} allowMultiple marginBottom="100px">
        <StockOverview
          products={products}
          categories={categories}
          locations={locations}
          tags={tags}
        />
        <MovedBoxes products={products} categories={categories} tags={tags} />
        <BeneficiaryOverview tags={tags} />
      </Accordion>
    </div>
  );
}
