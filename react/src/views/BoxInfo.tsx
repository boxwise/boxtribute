import { useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BOX_BY_QR } from "../utils/queries";

type BoxInfoParams = {
  id: string;
};

interface BoxDetails {
  box_id: string
  product_name: string,
  no_of_items: number,
  location_label: string,
}

function BoxInfo(props) {
  const [boxData, setBox] = useState<BoxDetails | null>(null);
  let { id } = useParams<BoxInfoParams>();

  const [getBoxQuery] = useLazyQuery(BOX_BY_QR, {
    onCompleted: (data) => {
      var box = data.box;
      setBox({
        box_id: box.box_id,
        product_name: box.product_id,
        no_of_items: box.items,
        location_label: box.location.name,
        // comments: box.comments,
        // qr_id: box.qr_id,
        // box_state_id: box.box_state_id,
      });
    },
    onError: (err) => {},
  });

  useEffect(() => {
    console.log("box id")
    console.log(id)
    getBoxQuery({
      // variables: { qrCode: props.location.state.qr },
      variables: { id },
    });
  }, [id, getBoxQuery]);

  //TODO: replace first option with a load spinner
  const boxDataMarkup =
    boxData === null ? (
      <p>Fetching box now...</p>
    ) : (
      <div>
        <h2>Box Found!</h2>
          <p>Box ID: {boxData.box_id}</p>
          <p># of Items: {boxData.no_of_items}</p>
          <p>Product Type: XXXXX-WIP-XXXXX</p>
          <p>Product ID: {boxData.product_name}</p>
          <p>Location ID: {boxData.location_label}</p>
      </div>
    );

  // console.log("boxData");
  // console.log(boxData);
  // console.log("boxDataMarkup");
  // console.log(boxDataMarkup);
  return <>TEST{boxDataMarkup}</>;
}

export default BoxInfo;
