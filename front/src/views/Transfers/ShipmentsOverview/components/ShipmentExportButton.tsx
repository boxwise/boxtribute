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
  direction: string;
  shipmentId: string;
  shipmentLabelIdentifier: string;
  shipmentState: string | null;
  transferAgreementId: string;
  sourceBaseId: string;
  sourceBaseName: string;
  targetBaseId: string;
  targetBaseName: string;
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

type ShipmentRow = {
  id: string;
  labelIdentifier: string;
  direction: "Sending" | "Receiving";
  sourceBaseOrg: {
    id: string;
    base: string;
    organisation: string;
  };
  targetBaseOrg: {
    id: string;
    base: string;
    organisation: string;
  };
  state: string | null | undefined;
  boxes: number;
  lastUpdated: Date | undefined;
  href: string;
};

interface ShipmentExportButtonProps {
  filteredRowData: ShipmentRow[];
}

const ShipmentExportButton: React.FC<ShipmentExportButtonProps> = ({ filteredRowData }) => {
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

        // Create a map of shipment ID to direction from filteredRowData
        const shipmentDirectionMap = new Map<string, "Sending" | "Receiving">();
        filteredRowData.forEach((row) => {
          shipmentDirectionMap.set(row.id, row.direction);
        });

        // Filter shipments based on selected checkboxes
        const filteredShipments = data.shipments.filter((shipment) => {
          const direction = shipmentDirectionMap.get(shipment.id);

          // Skip if we don't have direction info (shouldn't happen)
          if (!direction) {
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
                direction: shipmentDirectionMap.get(shipment.id) || "",
                shipmentId: shipment.id,
                shipmentLabelIdentifier: shipment.labelIdentifier,
                shipmentState: shipment.state,
                transferAgreementId: shipment.transferAgreement?.id || "",
                sourceBaseId: shipment.sourceBase.id,
                sourceBaseName: shipment.sourceBase.name,
                targetBaseId: shipment.targetBase.id,
                targetBaseName: shipment.targetBase.name,
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
            direction: shipmentDirectionMap.get(shipment.id) || "",
            shipmentId: shipment.id,
            shipmentLabelIdentifier: shipment.labelIdentifier,
            shipmentState: shipment.state,
            transferAgreementId: shipment.transferAgreement?.id || "",
            sourceBaseId: shipment.sourceBase.id,
            sourceBaseName: shipment.sourceBase.name,
            targetBaseId: shipment.targetBase.id,
            targetBaseName: shipment.targetBase.name,
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

        // Check if there's any data to export after filtering
        if (flattenedData.length === 0) {
          createToast({
            type: "warning",
            message: "No shipments to export.",
          });
        } else {
          // Set the CSV data which will trigger the useEffect to download
          setCsvData(flattenedData);
          setIsOpen(false);
        }
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
            isDisabled={filteredRowData.length === 0}
          >
            Export .csv
          </Button>
        </PopoverTrigger>
        <PopoverContent data-testid="export-popover-content">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <Stack spacing={3}>
              <Text>
                Include the following shipments
                <br />
                (filters apply):
              </Text>
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
          { label: "Direction", key: "direction" },
          { label: "Shipment ID", key: "shipmentId" },
          { label: "Shipment Label", key: "shipmentLabelIdentifier" },
          { label: "Shipment State", key: "shipmentState" },
          { label: "Transfer Agreement ID", key: "transferAgreementId" },
          { label: "Source Base ID", key: "sourceBaseId" },
          { label: "Source Base Name", key: "sourceBaseName" },
          { label: "Target Base ID", key: "targetBaseId" },
          { label: "Target Base Name", key: "targetBaseName" },
          { label: "Box Label", key: "boxLabelIdentifier" },
          { label: "Source Product", key: "sourceProductName" },
          { label: "Target Product", key: "targetProductName" },
          { label: "Source Size", key: "sourceSizeName" },
          { label: "Target Size", key: "targetSizeName" },
          { label: "Source Location", key: "sourceLocationName" },
          { label: "Source Quantity", key: "sourceQuantity" },
          { label: "Target Quantity", key: "targetQuantity" },
          { label: "Detail created on", key: "createdOn" },
          { label: "Detail created by", key: "createdByName" },
          { label: "Detail removed on", key: "removedOn" },
          { label: "Detail removed by", key: "removedByName" },
          { label: "Detail lost on", key: "lostOn" },
          { label: "Detail lost by", key: "lostByName" },
          { label: "Detail received on", key: "receivedOn" },
          { label: "Detail received by", key: "receivedByName" },
          { label: "Shipment started on", key: "startedOn" },
          { label: "Shipment started by", key: "startedByName" },
          { label: "Shipment sent on", key: "sentOn" },
          { label: "Shipment sent by", key: "sentByName" },
          { label: "Shipment receiving started on", key: "receivingStartedOn" },
          { label: "Shipment receiving started by", key: "receivingStartedByName" },
          { label: "Shipment completed on", key: "completedOn" },
          { label: "Shipment completed by", key: "completedByName" },
          { label: "Shipment canceled on", key: "canceledOn" },
          { label: "Shipment canceled by", key: "canceledByName" },
        ]}
        style={{ display: "none" }}
      />
    </>
  );
};

export default ShipmentExportButton;
