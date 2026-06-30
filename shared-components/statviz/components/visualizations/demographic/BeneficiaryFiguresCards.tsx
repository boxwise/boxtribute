import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import { ResultOf } from "gql.tada";
import { BENEFICIARY_FIGURES_QUERY } from "../../../queries/queries";

type BeneficiaryFigures = NonNullable<
  ResultOf<typeof BENEFICIARY_FIGURES_QUERY>["beneficiaryFigures"]
>;

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      px={4}
      py={3}
      textAlign="center"
    >
      <Text fontSize="sm" color="gray.500" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color="black">
        {value}
      </Text>
    </Box>
  );
}

interface BeneficiaryFiguresCardsProps {
  figures: BeneficiaryFigures;
}

export default function BeneficiaryFiguresCards({ figures }: BeneficiaryFiguresCardsProps) {
  const cards: StatCardProps[] = [
    {
      label: "New Registrations (last 30 days)",
      value: String(figures.newRegistrationsLast30Days),
    },
    {
      label: "Average Family Size",
      value: figures.averageFamilySize.toFixed(1),
    },
    {
      label: "Major Family Head Gender",
      value: figures.majorFamilyHeadGender,
    },
    {
      label: "Major Family Head Gender %",
      value: `${(figures.majorFamilyHeadGenderPercentage * 100).toFixed(1)}%`,
    },
    {
      label: "Avg. Items per Visit per Beneficiary",
      value: figures.averageItemsPerVisitPerBeneficiary.toFixed(1),
    },
    {
      label: "Avg. Total Items per Beneficiary",
      value: figures.averageTotalItemsPerBeneficiary.toFixed(1),
    },
    {
      label: "Without Freeshop Visit (last 90 days)",
      value: `${(figures.percentageWithoutFreeshopVisitLast90Days * 100).toFixed(1)}%`,
    },
  ];

  return (
    <SimpleGrid columns={3} spacing={3} minChildWidth="160px">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </SimpleGrid>
  );
}
