import * as React from "react";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { NewBoxType, LocationState } from "../../Types";

export default function CreateBox() {
  const CREATE_BOX = gql`
    mutation(
      $boxId: Int!
      $productId: Int!
      $items: Int
      $locationId: Int!
      $comments: String!
      $sizeId: Int!
      $qrId: Int!
      $boxStateId: Int!
    ) {
      createBox(
        input: {
          box_id: $boxId
          product_id: $productId
          size_id: $sizeId
          items: $items
          location_id: $locationId
          comments: $comments
          qr_id: $qrId
          box_state_id: $boxStateId
        }
      ) {
        id
        box_id
        product_id
        items
      }
    }
  `;

  const [createBoxMutation, { loading: mutationLoading, error: mutationError }] = useMutation(
    CREATE_BOX,
  );

  const location: LocationState = useLocation();
  const qrUrl: string = location.state.qr;

  const locationOptions = {
    "Shop Lesvos": 1,
    "LOST Lesvos": 2,
    "SCRAP Lesvos": 3,
    "Stockroom Lesvos": 4,
    "WH Lesvos": 5,
    "WH Women": 6,
    "WH Men": 7,
    "WH Children": 8,
    "WH Babies": 9,
    "WH Shoes": 10,
    "WH New arrivals": 11,
    "WH Hygiene": 12,
    "WH Seasonal": 13,
    "LOST Thessaloniki": 14,
    "SCRAP Thessaloniki": 15,
    "Stockroom Thessaloniki": 16,
    WH1: 17,
    WH2: 18,
    "Shop Samos": 19,
    "LOST Samos": 20,
    "SCRAP Samos": 21,
    "Stockroom Samos": 22,
    TestShop: 100000000,
    TestLOST: 100000001,
    TestDonated: 100000002,
    TestWarehouse: 100000003,
    TestStockroom: 100000004,
    TestDummyLocation: 100000005,
    TestSCRAP: 100000006,
  };

  const [newBox, setNewBox] = React.useState<NewBoxType>({
    box_id: null,
    product_id: null,
    size_id: null,
    items: null,
    location_id: null,
    comments: "",
    qr_id: null,
    box_state_id: null,
  });

  const { register, handleSubmit } = useForm();
  const onSubmit = async (data) => {
    const { productId, items, locationId, comments, sizeId } = data;

    try {
      const { data } = await createBoxMutation({
        variables: {
          productId: Number(productId), // dropdown
          items: Number(items),
          locationId: Number(locationId), // dropdown
          comments: comments || "", // default to an empty string
          sizeId: Number(sizeId), // dropdown
          qrId: Number(qrUrl),
        },
      });
      setNewBox(data.createBox);
    } catch (e) {
      // TODO error handling
      console.log("fail", e);
    }
  };

  return (
    <div className="flex flex-col">
      <h2>Create a Box</h2>
      {newBox && <h1> You created a new box!</h1>}
      <form id="make-a-box" className="flex flex-col">
        <label className="p-2" htmlFor="locationId">
          locationId*
          <select name="locationId" id="locationId">
            {Object.keys(locationOptions).map((item) => (
              <option key={item} value={locationOptions[item]}>
                {item}
              </option>
            ))}
          </select>
          {/* <input
            defaultValue={2}
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="number"
            name="locationId"
          /> */}
        </label>

        <label className="p-2" htmlFor="productId">
          productId*
          <input
            defaultValue={2}
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="number"
            name="productId"
          />
        </label>
        <label className="p-2" htmlFor="items">
          items*
          <input
            defaultValue={2}
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="number"
            name="items"
          />
        </label>
        <label className="p-2" htmlFor="sizeId">
          sizeId*
          <input
            defaultValue={2}
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="number"
            name="sizeId"
          />
        </label>
        <label className="p-2" htmlFor="comments">
          comments*
          <input
            defaultValue=""
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="text"
            name="comments"
          />
        </label>
      </form>
      <button
        type="submit"
        className="border bg-blue-400 rounded w-64"
        onClick={handleSubmit((d) => onSubmit(d))}
      >
        do the mutation
      </button>
      {mutationLoading && <p>Loading...</p>}
      {mutationError && <p>Error :( Please try again</p>}
    </div>
  );
}
