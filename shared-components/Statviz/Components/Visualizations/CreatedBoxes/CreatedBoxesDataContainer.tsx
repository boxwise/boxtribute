import { Spinner } from "@chakra-ui/react";
import useCreatedBoxes from "../../../hooks/useCreatedBoxes";
import ErrorCard from "../../ErrorCard";
import CreatedBoxesFilterContainer from "./CreatedBoxesFilterContainer";

export default function CreatedBoxesDataContainer() {
  const { data, loading, error } = useCreatedBoxes();

  if (error) {
    return <ErrorCard error={error.message} />;
  }
  if (loading || data === undefined) {
    return <Spinner />;
  }
  return <CreatedBoxesFilterContainer createdBoxes={data} />;
}
