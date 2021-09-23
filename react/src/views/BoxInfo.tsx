import { useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BOX_BY_QR } from "../utils/queries";
import { BoxDetails } from "../utils/Types";

type BoxInfoUrlParams = {
  id: string;
};

function BoxInfo(props) {
  const [boxData, setBox] = useState<BoxDetails | null>(null);
  const { id } = useParams<BoxInfoUrlParams>();

  const [getBoxQuery] = useLazyQuery(BOX_BY_QR, {
    onCompleted: (data) => {
      const box = data.box;
      setBox({
        box_id: box.box_id,
        product_name: box.product.name,
        product_gender: box.product.gender,
        qr_code: box.qrCode.code,
        no_of_items: box.items,
        location_label: box.location.name,
      });
    },
    onError: (err) => {},
  });

  useEffect(() => {
    getBoxQuery({
      variables: { id },
    });
  }, [id, getBoxQuery]);

  return <>{boxData === null ? <p>Fetching box now...</p> :
    <div>
      <h2>Box Found!</h2>
      <p>Box ID: {boxData.box_id}</p>
      <p>Location Name: {boxData.location_label}</p>
      <p>Product Name: {boxData.product_name}</p>
      <p>Product Size: XXXXXX</p>
      <p># of Items: {boxData.no_of_items}</p>
      <p>Product Gender: {boxData.product_gender} </p>
      <p>Comments: {boxData.product_gender} </p>
      <p>Box Status: XXXXXX</p>
      <p>QR Code: {boxData.qr_code}</p>
    </div>
  }</>;
}

export default BoxInfo;
