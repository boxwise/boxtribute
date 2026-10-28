import React from "react";
import { CSVLink } from "react-csv";
import { Button } from "@chakra-ui/react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { RiFileDownloadLine } from "react-icons/ri";

interface ExportToCsvButtonProps {
  selectedBoxes: Row<BoxRow>[];
}

const ExportToCsvButton: React.FC<ExportToCsvButtonProps> = ({ selectedBoxes }) => {
  const { createToast } = useNotification();

  const checkForSelectedBoxes = () => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box for export`,
      });
      return false;
    }
    return true;
  };

  const filename = `Stock_${new Date().toJSON().slice(0, 10)}_${new Date().valueOf()}`;
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
