import { EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Flex,
  IconButton,
  List,
  ListItem,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spacer,
  Stack,
  StackDivider,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FaWarehouse } from "react-icons/fa";
import { ShipmentIcon } from "./Icon/Transfer/ShipmentIcon";

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
      <SkeletonText mt="2" noOfLines={2} spacing="4" />
      <Skeleton height="50px" my="4" />
      <SkeletonCircle size="5" mt="4" />
      <SkeletonText mt="4" noOfLines={4} spacing="4" />
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
      <VStack
        padding={0}
        rounded="md"
        bg="white"
        divider={<StackDivider borderColor="blackAlpha.800" />}
        spacing={1}
        align="stretch"
      >
        <VStack spacing={2} padding={1} align="center">
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
        <Box border={0}>
          <Flex minWidth="max-content" alignItems="center" gap="2">
            <Box p="4">
              <List spacing={1}>
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
              </List>
            </Box>
            <Spacer />
            <Box>
              <Flex alignContent="center">
                <ShipmentIcon boxSize={9} />
              </Flex>
            </Box>
            <Spacer />
            <Box p="4">
              <List spacing={1}>
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
              </List>
            </Box>
          </Flex>
          <Center alignContent="stretch">
            <Spacer />
            <Skeleton height={8} width={8} />
            <Spacer />
          </Center>
        </Box>
        <StackDivider borderColor="blackAlpha.800" marginTop={-1.5} />
        <Box p={4}>
          <Flex minWidth="max-content" alignItems="center" gap={2}>
            <Box bg="gray.200" p={1} marginTop={-15}>
              <Skeleton width={20} height={6} />
            </Box>
            <Spacer />
            <Box>
              <Wrap spacing={2} align="center">
                <WrapItem>
                  <Center>
                    <SkeletonCircle size="12" />
                  </Center>
                </WrapItem>
              </Wrap>
            </Box>

            <Spacer />
            <Box>
              <VStack spacing={2} align="stretch">
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
    <Button leftIcon={<SkeletonCircle size="12" />} variant="solid" marginTop={2}>
      <Skeleton height="20px" width="150px" />
    </Button>
  );
}

export function QrReaderMultiBoxSkeleton() {
  return (
    <Stack direction="column" spacing={4}>
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
        border="2px"
        borderColor="gray.300"
        mb={6}
        pb={2}
        mr={["0", "0", "4rem", "4rem"]}
      >
        <Flex py={2} px={4} alignItems="center">
          <SkeletonText ml="4" noOfLines={1} width="50%" />
          <Skeleton ml="auto">
            <IconButton
              aria-label="Edit box"
              borderRadius="0"
              icon={<EditIcon h={6} w={6} />}
              border="2px"
            />
          </Skeleton>
        </Flex>
        <Skeleton height="18rem" />
      </Box>
      <Flex>
        <SkeletonText ml="4" noOfLines={1} width="50%" />
      </Flex>
      <Box w={["100%", "80%", "30%", "30%"]}>
        <Stack direction="column" alignContent="flex-start" p={2}>
          <Stack direction="row" alignItems="center" alignContent="center" spacing={2}>
            <Skeleton>
              <FaWarehouse size={24} />
            </Skeleton>
            <SkeletonText
              ml="4"
              noOfLines={1}
              width="50%"
              alignItems="center"
              alignContent="center"
            />
          </Stack>
          <Stack direction="row" alignItems="center" alignContent="center" spacing={2}>
            <Skeleton>
              <ShipmentIcon boxSize={6} alignItems="center" />
            </Skeleton>
            <SkeletonText
              ml="4"
              noOfLines={1}
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
