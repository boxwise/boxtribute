import { useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { emptyBox } from "../utils/emptyBox";
import { BOX_BY_QR } from "../utils/queries";

function BoxInfo(props) {
  const [boxData, setBox] = useState(emptyBox);

  const [getBoxQuery] = useLazyQuery(BOX_BY_QR, {
    onCompleted: (data) => {
      var box = data.box;
      setBox({
        box_id: box.box_id,
        product_id: box.product_id,
        size_id: box.size_id,
        items: box.items,
        location_id: box.location_id,
        comments: box.comments,
        qr_id: box.qr_id,
        box_state_id: box.box_state_id,
      });
    },
    onError: (err) => {},
  });

  useEffect(() => {
    getBoxQuery({
      variables: { qrCode: props.location.state.qr },
    });
  }, [getBoxQuery, props.location.state.qr]);

  //TODO: replace first option with a load spinner
  const boxDataMarkup =
    boxData.box_id === null ? (
      <p>Fetching box now...</p>
    ) : (
      <div>
        <h2>Box Found!</h2>
          <p>Box ID: {boxData.box_id}</p>
          <p># of Items: {boxData.items}</p>
          <p>Product Type: XXXXX-WIP-XXXXX</p>
          <p>Product ID: {boxData.product_id}</p>
          <p>Location ID: {boxData.location_id}</p>
      </div>
    );

  // console.log("boxData");
  // console.log(boxData);
  // console.log("boxDataMarkup");
  // console.log(boxDataMarkup);
  return <>TEST{boxDataMarkup}</>;
}

export default BoxInfo;
