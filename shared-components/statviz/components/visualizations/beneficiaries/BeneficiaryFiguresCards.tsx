import { Box, SimpleGrid, Text, Card, CardBody } from "@chakra-ui/react";
import { BeneficiaryFigures } from "../../../../../graphql/types";

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
      label: "Avg. major head of household",
      value: `${(figures.majorFamilyHeadGenderPercentage * 100).toFixed(1)}% ${figures.majorFamilyHeadGender}`,
    },
    {
      label: "Average household size",
      value: figures.averageFamilySize.toFixed(1),
    },
    {
      label: "Avg. items per visit per beneficiary",
      value: figures.averageItemsPerVisitPerBeneficiary.toFixed(1),
    },
    {
      label: "Avg. total items per beneficiary",
      value: figures.averageTotalItemsPerBeneficiary.toFixed(1),
    },
    {
      label: "New registrations (last 30 days)",
      value: String(figures.newRegistrationsLast30Days),
    },
    {
      label: "Without Freeshop Visit (last 90 days)",
      value: `${(figures.percentageWithoutFreeshopVisitLast90Days * 100).toFixed(1)}%`,
    },
  ];

  return (
    <Card>
      <CardBody>
        <Text mb={5} fontWeight="bold" fontSize="xl">
          Beneficiary Insights
        </Text>
        <SimpleGrid columns={2} spacing={3} minChildWidth="160px">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
}
