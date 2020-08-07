import * as React from "react";
import { FormControl, Input, InputLabel } from "@material-ui/core";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useForm } from "react-hook-form";

export default function CreateBox() {
  const CREATE_BOX = gql`
    mutation($createBoxInput: createBoxInput) {
      createBox(input: $createBoxInput)
    }
  `;

  const [createBoxMutation, { loading: mutationLoading, error: mutationError }] = useMutation(CREATE_BOX);

  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    console.log(data);
    createBoxMutation({ variables: { createBoxInput: data } });
  };

  return (
    <div className="">
      <h2>Create a Box</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}
        id="make-a-box"
        className="ui form"
      >
        <FormControl name="boxId">
          <InputLabel htmlFor="boxId">boxId*</InputLabel>
          <Input inputRef={register({ required: true, maxLength: 20 })} type="text" name="boxId" />
        </FormControl>
        <FormControl name="productId">
          <InputLabel htmlFor="productId">productId*</InputLabel>
          <Input
            inputRef={register({ required: true, maxLength: 20 })}
            type="text"
            name="productId"
          />
        </FormControl>
        <FormControl name="items">
          <InputLabel htmlFor="items">items*</InputLabel>
          <Input inputRef={register({ required: true, maxLength: 20 })} type="text" name="items" />
        </FormControl>
        <FormControl name="locationId">
          <InputLabel htmlFor="locationId">locationId*</InputLabel>
          <Input
            inputRef={register({ required: true, maxLength: 20 })}
            type="text"
            name="locationId"
          />
        </FormControl>
        <FormControl name="comments">
          <InputLabel htmlFor="comments">comments*</InputLabel>
          <Input
            inputRef={register({ required: true, maxLength: 20 })}
            type="text"
            name="comments"
          />
        </FormControl>
        <FormControl name="sizeId">
          <InputLabel htmlFor="sizeId">sizeId*</InputLabel>
          <Input inputRef={register({ required: true, maxLength: 20 })} type="text" name="sizeId" />
        </FormControl>
        <FormControl name="qrId">
          <InputLabel htmlFor="qrId">qrId*</InputLabel>
          <Input inputRef={register({ required: true, maxLength: 20 })} type="text" name="qrId" />
        </FormControl>
        <FormControl name="boxStateId">
          <InputLabel htmlFor="boxStateId">boxStateId*</InputLabel>
          <Input
            inputRef={register({ required: true, maxLength: 20 })}
            type="text"
            name="boxStateId"
          />
        </FormControl>
        <button type="submit" form="make-a-box" className="ui button">
          Save here
        </button>
      </form>
      {mutationLoading && <p>Loading...</p>}
      {mutationError && <p>Error :( Please try again</p>}
    </div>
  );
}
