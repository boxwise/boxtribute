import * as React from "react";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import AuthContext from "../../AuthContext";
import { NewBoxType, LocationState, AuthObjectType } from "../../utils/Types";
import { USER, CREATE_BOX } from "../../utils/queries";
import { locationOptions } from "../../utils/locationOptions";
import { emptyBox } from "../../utils/emptyBox";

export default function CreateBox() {
  const authObject: AuthObjectType = React.useContext(AuthContext);
  const { email } = authObject.idTokenPayload;

  // NOTE: getting the user will likely eventually have to be done in a more global-place,
  // maybe App and make a context for it? If that happens, consider using useLazyQuery for it
  // https://www.apollographql.com/docs/react/data/queries/#executing-queries-manually
  const { loading: queryLoading, error: queryError, data: queryData } = useQuery(USER, {
    variables: { email },
  });

  const [createBoxMutation, { loading: mutationLoading, error: mutationError }] = useMutation(
    CREATE_BOX,
  );

  const location: LocationState = useLocation();
  const qrUrl: string = location?.state?.qr || "barcode=I am fake";
  const qrBarcode = qrUrl.split("barcode=")[1];

  const [newBox, setNewBox] = React.useState<NewBoxType>(emptyBox);

  const { register, handleSubmit } = useForm();
  const onSubmit = async (formFields) => {
    const { productId, items, locationId, comments, sizeId } = formFields;

    try {
      const { data: mutataionData } = await createBoxMutation({
        variables: {
          productId: Number(productId), // dropdown??
          items: Number(items),
          locationId: Number(locationId),
          comments: comments || "",
          sizeId: Number(sizeId), // dropdown? comes from productId?
          qrBarcode,
          createdBy: email,
        },
      });

      setNewBox(mutataionData.createBox);
    } catch (e) {
      // TODO error handling
      console.log("fail", e);
    }
  };

  if (queryLoading) return <p>Loading...</p>;
  if (queryError) {
    return (
      <div className="p-6">
        <h3>Something went wrong, please log out and try again</h3>
        <p>Error :(</p>
        {queryError.graphQLErrors.map((item) => (
          <p key={item.name}>{item.message}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h2>Create a Box</h2>
      {newBox && <h1> You created a new box!</h1>}
      <form id="make-a-box" className="flex flex-col">
        <label className="p-2" htmlFor="locationId">
          locationId*
          <select ref={register} name="locationId" id="locationId">
            {queryData && queryData.user.base_id.map((item) => (
              <option key={item} value={item}>
                {locationOptions[item]}
              </option>
            ))}
          </select>
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
            ref={register({ maxLength: 20 })}
            type="text"
            name="comments"
          />
        </label>
      </form>
      <button
        type="submit"
        className="border bg-blue-400 rounded w-64"
        onClick={handleSubmit((formFields) => onSubmit(formFields))}
      >
        do the mutation
      </button>
      {mutationLoading && <p>Loading...</p>}
      {mutationError && <p>Error :( Please try again</p>}
    </div>
  );
}
