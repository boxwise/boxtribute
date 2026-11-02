import React from "react";
import { CSVLink } from "react-csv";
import { Button } from "@chakra-ui/react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { RiFileDownloadLine } from "react-icons/ri";
import { useApolloClient } from "@apollo/client";
import { FilterBoxInput } from "queries/types";
import { EXPORT_BOX_ROWS_TO_CSV_QUERY } from "../BoxesView";

interface ExportToCsvButtonProps {
  selectedBoxes: Row<BoxRow>[];
  /** Set while select-all is active: the CSV of all matching boxes is created by the backend */
  selectAllExport?: { baseId: number; filters: FilterBoxInput };
}

const decodeBase64Utf8 = (encoded: string) => {
  const binary = atob(encoded);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
};

const ExportToCsvButton: React.FC<ExportToCsvButtonProps> = ({
  selectedBoxes,
  selectAllExport,
}) => {
  const { createToast } = useNotification();
  const client = useApolloClient();

  const filename = `Stock_${new Date().toJSON().slice(0, 10)}_${new Date().valueOf()}`;

  const exportAllBoxes = async () => {
    if (!selectAllExport) return;
    try {
      const { data } = await client.query({
        query: EXPORT_BOX_ROWS_TO_CSV_QUERY,
        variables: selectAllExport,
        fetchPolicy: "no-cache",
      });
      if (!data?.exportBoxRowsToCsv) {
        throw new Error("No CSV data received");
      }
      const url = URL.createObjectURL(
        new Blob([decodeBase64Utf8(data.exportBoxRowsToCsv)], { type: "text/csv;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      createToast({
        type: "error",
        message: "Could not export the boxes. Please try again.",
      });
    }
  };

  const checkForSelectedBoxes = () => {
    if (selectAllExport) {
      exportAllBoxes();
      // Prevents the download of the rows of the current page
      return false;
    }
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box for export`,
      });
      return false;
    }
    return true;
  };

  return (
    <>
      <Button
        key="export"
        data-testid="export-button"
        variant="ghost"
        leftIcon={<RiFileDownloadLine />}
        iconSpacing={2}
        padding={1}
      >
        <CSVLink
          onClick={checkForSelectedBoxes}
          data={selectedBoxes.map(({ original: box }) => ({
            labelIdentifier: box.labelIdentifier,
            product: box.productName,
            productCategory: box.productCategoryName,
            gender: box.productGender,
            size: box.sizeName,
            numberOfItems: box.numberOfItems,
            state: box.state,
            location: box.locationName,
            tags: box.tags.map((tag) => tag.name),
            shipmentId: box.shipmentId,
            comment: box.comment,
            age: box.age,
            lastModified: box.lastModified?.toISOString().replace("Z", "+00:00") ?? "",
            lastModifiedBy: box.lastModifiedBy,
            createdBy: box.createdBy,
          }))}
          filename={filename}
          headers={[
            { label: "Box Number", key: "labelIdentifier" },
            { label: "Product", key: "product" },
            { label: "Product Category", key: "productCategory" },
            { label: "Gender", key: "gender" },
            { label: "Size", key: "size" },
            { label: "Number of items", key: "numberOfItems" },
            { label: "State", key: "state" },
            { label: "Location", key: "location" },
            { label: "Tags", key: "tags" },
            { label: "Shipment ID", key: "shipmentId" },
            { label: "Comment", key: "comment" },
            { label: "Age at Export", key: "age" },
            { label: "Last Modified (UTC time)", key: "lastModified" },
            { label: "Last Modified By", key: "lastModifiedBy" },
            { label: "Created By", key: "createdBy" },
          ]}
          key="export-csv"
        >
          Export CSV
        </CSVLink>
      </Button>
    </>
  );
};

export default ExportToCsvButton;
