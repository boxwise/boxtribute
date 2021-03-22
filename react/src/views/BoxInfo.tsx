import { useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { emptyBox } from "../utils/emptyBox";
import { BOX_BY_QR } from "../utils/queries";

function BoxInfo(qrCode) {
  const [box, setBox] = useState(emptyBox);

  const [getBoxQuery, { loading: queryLoading, error: queryError }] = useLazyQuery(BOX_BY_QR, {
    onCompleted: (data) => {
      var newBox = data.box;
      setBox({
        box_id: newBox.box_id,
        product_id: newBox.product_id,
        size_id: newBox.size_id,
        items: newBox.items,
        location_id: newBox.location_id,
        comments: newBox.comments,
        qr_id: newBox.qr_id,
        box_state_id: newBox.box_state_id,
      });
    },
    onError: (err) => {},
  });

  useEffect(() => {
    getBoxQuery(qrCode);
  }, []);

  //TODO: replace first option with a load spinner
  const boxData =
    box.box_id === null ? (
      <p>Fetching box now...</p>
    ) : (
      <div>
        <h2>Box Found!</h2>
        <p>Box ID: {box.box_id}</p>
        <p>Items: {box.items}</p>
        <p>Product ID: {box.product_id}</p>
        <p>Location ID: {box.location_id}</p>
      </div>
    );
  return <>{boxData}</>;
}

export default BoxInfo;
