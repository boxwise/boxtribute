import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Wrap,
  WrapItem,
  Box,
  FormLabel,
} from "@chakra-ui/react";
import BoxFlowSankey from "../../components/visualizations/BoxFlowSankey";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import SelectField from "../../components/form/SelectField";
import { useSearchParams } from "react-router-dom";
import useMovedBoxes from "../../hooks/useMovedBoxes";

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const MovedBoxesFilterSchema = z.object({
  locations: singleSelectOptionSchema.array().optional(),
});

export type IMovedBoxesFilterInput = z.input<typeof MovedBoxesFilterSchema>;
export type IMovedBoxesFilterOutput = z.output<typeof MovedBoxesFilterSchema>;

export default function MovedBoxes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { loading, data, error } = useMovedBoxes();

  const selectedLocations = searchParams.get("locations")?.split('","');
  if (selectedLocations) {
    if (selectedLocations.length === 0) {
      searchParams.delete("locations");
      setSearchParams(searchParams);
    }
  }

  const locations = data?.movedBoxes.dimensions.target.map((e) => ({
    value: e.id,
    label: e.name,
  }));

  const {
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(MovedBoxesFilterSchema),
    defaultValues: {
      locations: locations?.filter(
        (loc) => selectedLocations?.indexOf(loc.value) !== -1
      ),
    },
  });

  watch((test: IMovedBoxesFilterOutput) => {
    const locations = searchParams.get("locations");
    if (test.locations.length > 0) {
      const locationsParams = test.locations.map((e) => e.value).join('","');
      searchParams.delete("locations");
      searchParams.append("locations", locationsParams);
      setSearchParams(searchParams);
    } else {
      searchParams.delete("locations");
      setSearchParams(searchParams);
    }
  });

  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="lg">Moved Boxes</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Wrap
          borderWidth="1px"
          borderRadius="12px"
          padding="5"
          marginBottom="30px"
        >
          <WrapItem>
            <Box width="250px">
              <FormLabel htmlFor="box-item-select">Exclude Locations</FormLabel>
              {!loading && (
                <SelectField
                  fieldId="locations"
                  fieldLabel="locations"
                  placeholder="select locations"
                  options={locations}
                  isRequired={false}
                  isMulti
                  errors={errors}
                  control={control}
                />
              )}
              {(loading || error) && <Box>loading...</Box>}
            </Box>
          </WrapItem>
          <WrapItem>
            <Box width="250px">
              <FormLabel htmlFor="box-item-select">Categories</FormLabel>
            </Box>
          </WrapItem>
        </Wrap>
        <Wrap gap={6}>
          <WrapItem overflow="auto" padding="5px">
            <BoxFlowSankey
              filter={{ locations: selectedLocations ?? [] }}
              width="1000px"
              height="600px"
            />
          </WrapItem>
        </Wrap>
      </AccordionPanel>
    </AccordionItem>
  );
}
