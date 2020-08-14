import * as React from "react";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useForm } from "react-hook-form";

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
    CREATE_BOX
  );

  const [newBox, setNewBox] = React.useState();

  const { register, handleSubmit } = useForm();
  const onSubmit = async (data) => {
    const { boxId, productId, items, locationId, comments, sizeId, qrId, boxStateId } = data;

    try {
      const { data } = await createBoxMutation({
        variables: {
          boxId: Number(boxId),
          productId: Number(productId),
          items: Number(items),
          locationId: Number(locationId),
          comments,
          sizeId: Number(sizeId),
          qrId: Number(qrId),
          boxStateId: Number(boxStateId),
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
      {newBox && <h1> You created box id: {newBox.box_id}</h1>}
      <form id="make-a-box" className="flex flex-col">
        <label className="p-2" htmlFor="boxId">
          boxId*
          <input
            defaultValue={2002}
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="number"
            name="boxId"
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
        <label className="p-2" htmlFor="comments">
          comments*
          <input
            defaultValue={2}
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="text"
            name="comments"
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
        <label className="p-2" htmlFor="qrId">
          qrId*
          <input
            defaultValue={2}
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="number"
            name="qrId"
          />
        </label>
        <label className="p-2" htmlFor="boxStateId">
          boxStateId*
          <input
            defaultValue={2}
            className="border rounded"
            ref={register({ required: true, maxLength: 20 })}
            type="number"
            name="boxStateId"
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
