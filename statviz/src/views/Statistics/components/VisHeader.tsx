import { DownloadIcon } from "@chakra-ui/icons";
import {
  CardHeader,
  Flex,
  Heading,
  Spacer,
  Checkbox,
  Button,
} from "@chakra-ui/react";

export default function VisHeader(params: {
  heading: string;
  visId: string;
  custom?: boolean;
}) {
  const download = () => {
    const chart = params.custom
      ? document.getElementById(params.visId)
      : document.getElementById(params.visId)?.firstChild?.firstChild
          ?.firstChild;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(chart);

    //add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const a = document.createElement("a");
    a.setAttribute(
      "href",
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source)
    );

    a.setAttribute("download", params.visId + ".svg");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <CardHeader>
      <Flex>
        <Heading size="md">{params.heading}</Heading>
        <Spacer></Spacer>
        <Button backgroundColor="white" onClick={download}>
          <DownloadIcon />
        </Button>
      </Flex>
    </CardHeader>
  );
}
