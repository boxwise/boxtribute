import * as React from "react";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";

interface NewBoxType {
  box_id: number;
  product_id: number;
  size_id: number;
  items: number;
  location_id: number;
  comments: string;
  qr_id: number;
  box_state_id: number;
}

interface LocationState {
  state: {
    qr: string;
  };
}

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

  const [newBox, setNewBox] = React.useState({
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
          productId: Number(productId),
          items: Number(items),
          locationId: Number(locationId), // temp, until we get this from the header
          comments: comments || "", // default to an empty string
          sizeId: Number(sizeId),
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
          <input
            defaultValue={2}
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="number"
            name="locationId"
          />
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
