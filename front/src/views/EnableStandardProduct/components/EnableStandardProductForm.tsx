import {
  HStack,
  Stack,
  Button,
  Switch,
  Box,
  Text,
  Skeleton,
  Select,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertWithoutAction } from "components/Alerts";
import { useAtomValue } from "jotai";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { selectedBaseAtom } from "stores/globalPreferenceStore";
import { z } from "zod";

const SingleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const StandardProductInfoSchema = z.object({
  productName: z.string(),
  category: SingleSelectOptionSchema,
  gender: z.string(),
  sizeRange: SingleSelectOptionSchema,
});

export type IStandardProductInfoInput = z.input<typeof StandardProductInfoSchema>;

export const EnableStandardProductFormSchema = z.object({
  comment: z.string().optional(),
  inShop: z.boolean().optional(),
  price: z
    .number({
      invalid_type_error: "Please enter a positive integer number.",
    })
    .int()
    .nonnegative()
    .optional(),
});

export type IEnableStandardProductFormInput = z.input<typeof EnableStandardProductFormSchema>;
export type IEnableStandardProductFormOutput = z.output<typeof EnableStandardProductFormSchema>;

export type IEnableStandardProductFormProps = {
  standardProductData: IStandardProductInfoInput;
  onSubmit: (data: IEnableStandardProductFormOutput) => void;
};

function EnableStandardProductForm({
  standardProductData,
  onSubmit,
}: IEnableStandardProductFormProps) {
  const navigate = useNavigate();
  const selectedBase = useAtomValue(selectedBaseAtom);
  const baseName = selectedBase?.name;

  const {
    handleSubmit,
    // control,
    // register,
    // resetField,
    // setError,
    // watch,
    // formState: { errors, isSubmitting },
  } = useForm<IEnableStandardProductFormInput>({
    resolver: zodResolver(EnableStandardProductFormSchema),
    // defaultValues,
  });

  return (
    <>
      <AlertWithoutAction
        type="info"
        closeable={true}
        alertText=" For ASSORT standard products, only the product description, and free shop settings can be edited."
        mb={2}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box border="2px" mb={8}>
          <HStack mb={4} borderBottom="2px" p={2}>
            <Text fontWeight="bold" fontSize="md">
              {baseName ? baseName?.toUpperCase() : <Skeleton height={6} width={20} mr={2} />}{" "}
              PRODUCT DETAILS
            </Text>
          </HStack>
          <HStack my={4} p={2}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Select isReadOnly>
                <option selected>{standardProductData.productName}</option>
              </Select>
            </FormControl>
          </HStack>
        </Box>
        <Box border="2px" mb={8}>
          <HStack mb={4} borderBottom="2px" p={2}>
            <Text fontWeight="bold" fontSize="md">
              FREE SHOP SETTINGS
            </Text>
          </HStack>
          <HStack my={4} p={2}>
            <Switch id="show-in-stockroom" mr={2} />
            <Text fontWeight="medium" fontSize="md">
              Always Show in Stockroom?
            </Text>
          </HStack>
        </Box>
        <Stack spacing={4} mt={8}>
          <Button
            // isLoading={isFormLoading}
            type="submit"
            borderRadius="0"
            w="full"
            variant="solid"
            backgroundColor="blue.500"
            color="white"
          >
            Enable Product
          </Button>
          <Button
            size="md"
            type="button"
            borderRadius="0"
            w="full"
            variant="outline"
            onClick={() => navigate("../../")}
          >
            Nevermind
          </Button>
        </Stack>
      </form>
    </>
  );
}

export default EnableStandardProductForm;
