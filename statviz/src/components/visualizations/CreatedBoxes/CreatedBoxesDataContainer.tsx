import { Spinner } from "@chakra-ui/react";
import useCreatedBoxes from "../../../hooks/useCreatedBoxes";
import ErrorCard from "../../ErrorCard";
import CreatedBoxesFilterContainer from "./CreatedBoxesFilterContainer";

export default function CreatedBoxesDataContainer() {
  const { data, loading, error } = useCreatedBoxes();

  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <ErrorCard error={error.message} />;
  }
  return <CreatedBoxesFilterContainer createdBoxes={data.createdBoxes} />;
}
