import { IoPencil } from "react-icons/io5";
import {
  Box,
  Button,
  Center,
  Flex,
  Field,
  IconButton,
  List,
  ListItem,
  Separator,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spacer,
  Stack,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FaWarehouse } from "react-icons/fa";
import { ShipmentIcon } from "./Icon/Transfer/ShipmentIcon";

export function BreadcrumbNavigationSkeleton() {
  return <Skeleton height="24px" width="500px" mb={4} />;
}

export function TableSkeleton() {
  return (
    <Stack data-testid="TableSkeleton">
      <Skeleton height={12} />
      <Skeleton height={12} />
      <Skeleton height={12} />
    </Stack>
  );
}

export function TabsSkeleton() {
  return (
    <>
      <Skeleton height="50px" my="4" />
      <SkeletonText mt="2" lineClamp={2} gap={4} />
      <Skeleton height="50px" my="4" />
      <SkeletonCircle size="5" mt="4" />
      <SkeletonText mt="4" lineClamp={4} gap={4} />
    </>
  );
}

export function ShipmentCardSkeleton() {
  return (
    <Box
      boxShadow="lg"
      p={0}
      rounded="lg"
      bg="white"
      width={{ base: "240pt", md: "250pt", lg: "250pt" }}
      borderColor="blackAlpha.800"
      borderWidth={1.5}
    >
      <VStack padding={0} rounded="md" bg="white" gap={1} align="stretch">
        <VStack gap={2} padding={1} align="center">
          <Wrap fontSize="xl" fontWeight="extrabold">
            <WrapItem>
              <Skeleton height={8} width={24} />
            </WrapItem>
            <WrapItem>
              <Skeleton height={8} width={16} />
            </WrapItem>
          </Wrap>
          <Box fontWeight="xl">
            <Wrap>
              <WrapItem>Status:</WrapItem>
              <WrapItem fontWeight="extrabold">
                <Skeleton height={8} width={10} />
              </WrapItem>
            </Wrap>
          </Box>
        </VStack>
        <Separator borderColor="blackAlpha.800" />
        <Box border={0}>
          <Flex minWidth="max-content" alignItems="center" gap={2}>
            <Box p="4">
              <List.Root gap={1}>
                <ListItem>
                  <Flex alignContent="right">
                    <Skeleton height={8} width={12} />
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex alignContent="right">
                    <Skeleton height={6} width={12} />
                  </Flex>
                </ListItem>
              </List.Root>
            </Box>
            <Spacer />
            <Box>
              <Flex alignContent="center">
                <ShipmentIcon boxSize={9} />
              </Flex>
            </Box>
            <Spacer />
            <Box p="4">
              <List.Root gap={1}>
                <ListItem>
                  <Flex alignContent="left">
                    <Skeleton height={8} width={12} />
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex alignContent="left">
                    <Skeleton height={6} width={12} />
                  </Flex>
                </ListItem>
              </List.Root>
            </Box>
          </Flex>
          <Center alignContent="stretch">
            <Spacer />
            <Skeleton height={8} width={8} />
            <Spacer />
          </Center>
        </Box>
        <Separator borderColor="blackAlpha.800" marginTop={-1.5} />
        <Box p={4}>
          <Flex minWidth="max-content" alignItems="center" gap={2}>
            <Box bg="gray.200" p={1} marginTop={-15}>
              <Skeleton width={20} height={6} />
            </Box>
            <Spacer />
            <Box>
              <Wrap gap={2} align="center">
                <WrapItem>
                  <Center>
                    <SkeletonCircle size="12" />
                  </Center>
                </WrapItem>
              </Wrap>
            </Box>

            <Spacer />
            <Box>
              <VStack gap={2} align="stretch">
                <Box>
                  <SkeletonCircle size="8" />
                </Box>
                <Box>
                  <SkeletonCircle size="8" />
                </Box>
              </VStack>
            </Box>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
}

export function ButtonSkeleton() {
  return (
    <Button variant="solid" marginTop={2}>
      <SkeletonCircle size="12" />
      <Skeleton height="20px" width="150px" />
    </Button>
  );
}

export function QrReaderSkeleton() {
  return (
    <Stack data-testid="QrReaderSkeleton">
      <Skeleton width="clamp(200px, 100%, 416px)" height="416px" />
      <br />
      <Skeleton width="clamp(200px, 100%, 416px)" height="104px" />
    </Stack>
  );
}

export function QrReaderMultiBoxSkeleton() {
  return (
    <Stack direction="column" gap={4} data-testid="QrReaderMultiBoxSkeleton">
      {[1, 2, 3].map((num) => (
        <Skeleton key={num} height="50px" />
      ))}
    </Stack>
  );
}

export function BoxViewSkeleton() {
  return (
    <Flex
      direction={["column", "column", "row"]}
      alignItems={["center", "center", "flex-start"]}
      w="100%"
      justifyContent="center"
      data-testid="box-sections"
    >
      <Box
        w={["100%", "80%", "30%", "30%"]}
        border="2px solid"
        borderColor="gray.300"
        mb={6}
        pb={2}
        mr={["0", "0", "4rem", "4rem"]}
      >
        <Flex py={2} px={4} alignItems="center">
          <SkeletonText ml="4" lineClamp={1} width="50%" />
          <Skeleton ml="auto">
            <IconButton aria-label="Edit box" borderRadius="0" border="2px solid">
              <IoPencil size={24} />
            </IconButton>
          </Skeleton>
        </Flex>
        <Skeleton height="18rem" />
      </Box>
      <Flex>
        <SkeletonText ml="4" lineClamp={1} width="50%" />
      </Flex>
      <Box w={["100%", "80%", "30%", "30%"]}>
        <Stack direction="column" alignContent="flex-start" p={2}>
          <Stack direction="row" alignItems="center" alignContent="center" gap={2}>
            <Skeleton>
              <FaWarehouse size={24} />
            </Skeleton>
            <SkeletonText
              ml="4"
              lineClamp={1}
              width="50%"
              alignItems="center"
              alignContent="center"
            />
          </Stack>
          <Stack direction="row" alignItems="center" alignContent="center" gap={2}>
            <Skeleton>
              <ShipmentIcon boxSize={6} alignItems="center" />
            </Skeleton>
            <SkeletonText
              ml="4"
              lineClamp={1}
              width="50%"
              alignItems="center"
              alignContent="center"
            />
          </Stack>
        </Stack>
        <TabsSkeleton />
      </Box>
    </Flex>
  );
}

export function FormSkeleton() {
  return (
    <>
      <Box mb={4} p={2}>
        <VStack gap={4} pt={4}>
          {/* First form field */}
          <Field.Root>
            <Field.Label>
              <Skeleton height="20px" width="80px" />
            </Field.Label>
            <Skeleton height="40px" width="100%" />
          </Field.Root>

          {/* Second form field */}
          <Field.Root>
            <Field.Label>
              <Skeleton height="20px" width="100px" />
            </Field.Label>
            <Skeleton height="40px" width="100%" />
          </Field.Root>

          {/* Third form field */}
          <Field.Root>
            <Field.Label>
              <Skeleton height="20px" width="90px" />
            </Field.Label>
            <Skeleton height="40px" width="100%" />
          </Field.Root>
        </VStack>
      </Box>

      {/* Buttons */}
      <Stack gap={2} my={4}>
        <ButtonSkeleton />
        <ButtonSkeleton />
      </Stack>
    </>
  );
}
