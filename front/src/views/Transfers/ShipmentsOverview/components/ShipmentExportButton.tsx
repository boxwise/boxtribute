import React, { useState, useRef, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import {
  Button,
  Popover,
  PopoverTrigger as OrigPopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Checkbox,
  Stack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { RiFileDownloadLine } from "react-icons/ri";
import { CSVLink } from "react-csv";
import { SHIPMENT_DATA_FOR_EXPORT_QUERY } from "queries/queries";
import { useNotification } from "hooks/useNotification";

// Workaround for Chakra UI issue #5896
const PopoverTrigger: React.FC<{ children: React.ReactNode }> = OrigPopoverTrigger;

interface ShipmentCsvRow {
  shipmentId: string;
  shipmentLabelIdentifier: string;
  shipmentState: string | null;
  transferAgreementId: string;
  sourceBaseId: string;
  sourceBaseName: string;
  targetBaseId: string;
  targetBaseName: string;
  detailId: string;
  boxLabelIdentifier: string;
  sourceProductName: string;
  targetProductName: string;
  sourceSizeName: string;
  targetSizeName: string;
  sourceLocationName: string;
  sourceQuantity: string;
  targetQuantity: string;
  createdOn: string;
  createdByName: string;
  removedOn: string;
  removedByName: string;
  lostOn: string;
  lostByName: string;
  receivedOn: string;
  receivedByName: string;
  startedOn: string;
  startedByName: string;
  sentOn: string;
  sentByName: string;
  receivingStartedOn: string;
  receivingStartedByName: string;
  completedOn: string;
  completedByName: string;
  canceledOn: string;
  canceledByName: string;
}

interface ShipmentExportButtonProps {
  baseId: string;
  currentBaseName: string;
}

// Helper function to determine shipment direction based on labelIdentifier format
// LabelIdentifier format: S001-231111-LExTH (where last 5 chars represent source and target base codes)
// The last 5 characters follow the pattern: SourceCodeXTargetCode (e.g., "LExTH" for Lesvos to Thessaloniki)
const determineShipmentDirection = (
  labelIdentifier: string,
  currentBaseName: string,
): "Sending" | "Receiving" => {
  if (labelIdentifier.length < 5 || currentBaseName.length < 2) {
    // Fallback to "Receiving" if format is unexpected
    return "Receiving";
  }
  const lastFiveChars = labelIdentifier.slice(-5);
  const currentBaseCode = currentBaseName.slice(0, 2).toUpperCase();
  return lastFiveChars.startsWith(currentBaseCode) ? "Sending" : "Receiving";
};

const ShipmentExportButton: React.FC<ShipmentExportButtonProps> = ({ baseId, currentBaseName }) => {
  const [includeReceiving, setIncludeReceiving] = useState(true);
  const [includeSending, setIncludeSending] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [csvData, setCsvData] = useState<ShipmentCsvRow[]>([]);
  const [filename, setFilename] = useState("");
  const csvLinkRef = useRef<CSVLink & HTMLAnchorElement>(null);
  const { createToast } = useNotification();

  const [fetchShipments] = useLazyQuery(SHIPMENT_DATA_FOR_EXPORT_QUERY);

  // Trigger download when csvData is set
  useEffect(() => {
    if (csvData.length > 0 && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setCsvData([]); // Reset after download
    }
  }, [csvData]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await fetchShipments();

      if (error) {
        createToast({
          type: "error",
          message: "Failed to fetch shipment data. Please try again.",
        });
        return;
      }

      if (data?.shipments) {
        // Generate filename with current timestamp
        const now = new Date();
        setFilename(`Shipments_${now.toJSON().slice(0, 10)}_${now.valueOf()}`);

        // Filter shipments based on selected checkboxes
        const filteredShipments = data.shipments.filter((shipment) => {
          const direction = determineShipmentDirection(shipment.labelIdentifier, currentBaseName);

          // Only include shipments from current base
          if (shipment.sourceBase.id !== baseId && shipment.targetBase.id !== baseId) {
            return false;
          }

          if (direction === "Sending" && includeSending) return true;
          if (direction === "Receiving" && includeReceiving) return true;
          return false;
        });

        // Flatten shipment data for CSV export
        const flattenedData = filteredShipments.flatMap((shipment) => {
          // If shipment has no details, create one row for the shipment
          if (!shipment.details || shipment.details.length === 0) {
            return [
              {
                shipmentId: shipment.id,
                shipmentLabelIdentifier: shipment.labelIdentifier,
                shipmentState: shipment.state,
                transferAgreementId: shipment.transferAgreement?.id || "",
                sourceBaseId: shipment.sourceBase.id,
                sourceBaseName: shipment.sourceBase.name,
                targetBaseId: shipment.targetBase.id,
                targetBaseName: shipment.targetBase.name,
                detailId: "",
                boxLabelIdentifier: "",
                sourceProductName: "",
                targetProductName: "",
                sourceSizeName: "",
                targetSizeName: "",
                sourceLocationName: "",
                sourceQuantity: "",
                targetQuantity: "",
                createdOn: "",
                createdByName: "",
                removedOn: "",
                removedByName: "",
                lostOn: "",
                lostByName: "",
                receivedOn: "",
                receivedByName: "",
                startedOn: shipment.startedOn || "",
                startedByName: shipment.startedBy?.name || "",
                sentOn: shipment.sentOn || "",
                sentByName: shipment.sentBy?.name || "",
                receivingStartedOn: shipment.receivingStartedOn || "",
                receivingStartedByName: shipment.receivingStartedBy?.name || "",
                completedOn: shipment.completedOn || "",
                completedByName: shipment.completedBy?.name || "",
                canceledOn: shipment.canceledOn || "",
                canceledByName: shipment.canceledBy?.name || "",
              },
            ];
          }

          // Create one row per detail
          return shipment.details.map((detail) => ({
            shipmentId: shipment.id,
            shipmentLabelIdentifier: shipment.labelIdentifier,
            shipmentState: shipment.state,
            transferAgreementId: shipment.transferAgreement?.id || "",
            sourceBaseId: shipment.sourceBase.id,
            sourceBaseName: shipment.sourceBase.name,
            targetBaseId: shipment.targetBase.id,
            targetBaseName: shipment.targetBase.name,
            detailId: detail.id,
            boxLabelIdentifier: detail.box.labelIdentifier,
            sourceProductName: detail.sourceProduct?.name || "",
            targetProductName: detail.targetProduct?.name || "",
            sourceSizeName: detail.sourceSize?.label || "",
            targetSizeName: detail.targetSize?.label || "",
            sourceLocationName: detail.sourceLocation?.name || "",
            sourceQuantity: detail.sourceQuantity?.toString() || "",
            targetQuantity: detail.targetQuantity?.toString() || "",
            createdOn: detail.createdOn || "",
            createdByName: detail.createdBy?.name || "",
            removedOn: detail.removedOn || "",
            removedByName: detail.removedBy?.name || "",
            lostOn: detail.lostOn || "",
            lostByName: detail.lostBy?.name || "",
            receivedOn: detail.receivedOn || "",
            receivedByName: detail.receivedBy?.name || "",
            startedOn: shipment.startedOn || "",
            startedByName: shipment.startedBy?.name || "",
            sentOn: shipment.sentOn || "",
            sentByName: shipment.sentBy?.name || "",
            receivingStartedOn: shipment.receivingStartedOn || "",
            receivingStartedByName: shipment.receivingStartedBy?.name || "",
            completedOn: shipment.completedOn || "",
            completedByName: shipment.completedBy?.name || "",
            canceledOn: shipment.canceledOn || "",
            canceledByName: shipment.canceledBy?.name || "",
          }));
        });

        // Set the CSV data which will trigger the useEffect to download
        setCsvData(flattenedData);
      }
    } catch (err) {
      createToast({
        type: "error",
        message: "An error occurred while exporting shipments. Please try again.",
      });
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const isExportDisabled = !includeReceiving && !includeSending;

  return (
    <>
      <Popover isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <PopoverTrigger>
          <Button
            leftIcon={<RiFileDownloadLine />}
            borderRadius="0"
            onClick={() => setIsOpen(true)}
            data-testid="export-csv-button"
          >
            Export .csv
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <Stack spacing={3}>
              <Text>Include following shipments:</Text>
              <Checkbox
                isChecked={includeReceiving}
                onChange={(e) => setIncludeReceiving(e.target.checked)}
                data-testid="receiving-checkbox"
              >
                Receiving
              </Checkbox>
              <Checkbox
                isChecked={includeSending}
                onChange={(e) => setIncludeSending(e.target.checked)}
                data-testid="sending-checkbox"
              >
                Sending
              </Checkbox>
              <Button
                colorScheme="blue"
                isDisabled={isExportDisabled || isExporting}
                onClick={handleExport}
                data-testid="export-button"
              >
                {isExporting ? (
                  <>
                    <Spinner size="sm" mr={2} />
                    Exporting...
                  </>
                ) : (
                  "Export"
                )}
              </Button>
            </Stack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <CSVLink
        ref={csvLinkRef}
        data={csvData}
        filename={filename}
        headers={[
          { label: "Shipment ID", key: "shipmentId" },
          { label: "Shipment Label", key: "shipmentLabelIdentifier" },
          { label: "Shipment State", key: "shipmentState" },
          { label: "Transfer Agreement ID", key: "transferAgreementId" },
          { label: "Source Base ID", key: "sourceBaseId" },
          { label: "Source Base Name", key: "sourceBaseName" },
          { label: "Target Base ID", key: "targetBaseId" },
          { label: "Target Base Name", key: "targetBaseName" },
          { label: "Detail ID", key: "detailId" },
          { label: "Box Label", key: "boxLabelIdentifier" },
          { label: "Source Product", key: "sourceProductName" },
          { label: "Target Product", key: "targetProductName" },
          { label: "Source Size", key: "sourceSizeName" },
          { label: "Target Size", key: "targetSizeName" },
          { label: "Source Location", key: "sourceLocationName" },
          { label: "Source Quantity", key: "sourceQuantity" },
          { label: "Target Quantity", key: "targetQuantity" },
          { label: "Created On", key: "createdOn" },
          { label: "Created By", key: "createdByName" },
          { label: "Removed On", key: "removedOn" },
          { label: "Removed By", key: "removedByName" },
          { label: "Lost On", key: "lostOn" },
          { label: "Lost By", key: "lostByName" },
          { label: "Received On", key: "receivedOn" },
          { label: "Received By", key: "receivedByName" },
          { label: "Started On", key: "startedOn" },
          { label: "Started By", key: "startedByName" },
          { label: "Sent On", key: "sentOn" },
          { label: "Sent By", key: "sentByName" },
          { label: "Receiving Started On", key: "receivingStartedOn" },
          { label: "Receiving Started By", key: "receivingStartedByName" },
          { label: "Completed On", key: "completedOn" },
          { label: "Completed By", key: "completedByName" },
          { label: "Canceled On", key: "canceledOn" },
          { label: "Canceled By", key: "canceledByName" },
        ]}
        style={{ display: "none" }}
      />
    </>
  );
};

export default ShipmentExportButton;
