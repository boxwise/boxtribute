import React from "react";
import { Button } from "@chakra-ui/react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { RiQrCodeLine } from "react-icons/ri";

interface MakeLabelsButtonProps {
  selectedBoxes: Row<BoxRow>[];
}

const MakeLabelsButton: React.FC<MakeLabelsButtonProps> = ({ selectedBoxes }) => {
  const { createToast } = useNotification();

  const MAKE_LABELS_URL = `${import.meta.env.FRONT_OLD_APP_BASE_URL}/pdf/qr.php?label=`;
  const selectedBoxIds = selectedBoxes.map((box) => box.values.id).join();
  const makeLabels = () => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box for making labels`,
      });
      return false;
    }
    window.open(MAKE_LABELS_URL + selectedBoxIds, "_blank");
    return true;
  };

  return (
    <>
      <Button
        key="make-labels"
        variant="ghost"
        data-testid="make-labels-button"
        leftIcon={<RiQrCodeLine />}
        iconSpacing={2}
        padding={1}
        onClick={makeLabels}
      >
        Make Labels
      </Button>
    </>
  );
};

export default MakeLabelsButton;
