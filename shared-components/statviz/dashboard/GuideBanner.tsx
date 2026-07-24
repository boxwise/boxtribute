import { Box, Button, HStack, Icon, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useParams } from "react-router-dom";

const FEATURED_GUIDES = [
  { slug: "roles-and-permissions", title: "Set up roles & team permissions" },
  { slug: "import-stock-beneficiaries", title: "Import your existing stock or beneficiaries" },
  { slug: "identify-most-vulnerable", title: "Identify & prioritise the most vulnerable" },
  { slug: "organise-warehouse-space", title: "Organise your warehouse space" },
];

export default function GuideBanner() {
  const { baseId } = useParams();
  const guidesPath = `/bases/${baseId}/guides`;

  return (
    <Box bg="brandBlue.300" borderRadius="lg" p={{ base: 5, md: 8 }} mb={6} color="white">
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <VStack align="flex-start" spacing={4}>
          <HStack spacing={2}>
            <Box w={2} h={2} borderRadius="full" bg="brandYellow.200" />
            <Text
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="wider"
              textTransform="uppercase"
              color="brandYellow.200"
            >
              Guide · Start here
            </Text>
          </HStack>

          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" lineHeight="short">
            New here? Start with what most teams ask.
          </Text>

          <Text fontSize="sm" color="whiteAlpha.800" maxW="sm">
            The Guide maps your own requirements to how Boxtribute already does them. Browse the
            most-asked capabilities.
          </Text>

          <Button
            as={RouterLink}
            to={guidesPath}
            bg="brandYellow.200"
            color="brandBlue.300"
            size="sm"
            fontWeight="bold"
            _hover={{ bg: "brandYellow.300", color: "white" }}
            rightIcon={<ArrowForwardIcon />}
            data-heap-event="guide-banner-open-app"
            borderRadius="sm"
          >
            Open in app
          </Button>
        </VStack>

        <VStack align="flex-start" spacing={3}>
          {FEATURED_GUIDES.map((guide) => (
            <HStack
              key={guide.slug}
              as={RouterLink}
              to={`${guidesPath}/${guide.slug}`}
              spacing={3}
              _hover={{ textDecoration: "none" }}
              data-heap-event="guide-banner-item-click"
              data-heap-guide={guide.slug}
              w="full"
            >
              <Box w={2} h={2} borderRadius="full" bg="brandGreen" flexShrink={0} mt="3px" />
              <Text fontSize="sm" color="whiteAlpha.900" _hover={{ color: "white" }}>
                {guide.title}
              </Text>
              <Icon
                as={ArrowForwardIcon}
                boxSize={3}
                color="whiteAlpha.700"
                ml="auto"
                flexShrink={0}
              />
            </HStack>
          ))}

          <Text
            as={RouterLink}
            to={guidesPath}
            fontSize="sm"
            color="brandYellow.200"
            fontWeight="semibold"
            _hover={{ textDecoration: "underline" }}
            pt={2}
            data-heap-event="guide-banner-browse-full"
          >
            Browse the full guide →
          </Text>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}
