import * as React from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { useLocation, Link } from "react-router-dom";
import { NewBoxType, LocationState, Product } from "../../utils/Types";
import { CREATE_BOX, PRODUCTS, SIZES_FOR_PRODUCT } from "../../utils/queries";
import { emptyBox } from "../../utils/emptyBox";
import { useCallback, useEffect, useState } from "react";

export default function CreateBox() {
  // NOTE: getting the user will likely eventually have to be done in a more global-place,
  // maybe App and make a context for it? If that happens, consider using useLazyQuery for it
  // https://www.apollographql.com/docs/react/data/queries/#executing-queries-manually

  const [createBoxMutation, { loading: mutationLoading, error: mutationError }] = useMutation(
    CREATE_BOX,
  );

  const [products, setProducts] = useState<Product[]>();
  const [sizes, setSizes] = useState<string[]>();

  const [selectedProductId, setSelectedProductId] = useState<number>();

  const [getProductsQuery] = useLazyQuery(PRODUCTS, {
    onCompleted: (data) => {
      setProducts(data.products);
    },
    onError: (err) => {},
  });

  const [getSizesQuery] = useLazyQuery(SIZES_FOR_PRODUCT, {
    onCompleted: (data) => {
      console.log(data);
      setSizes(data.product.sizes);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  useEffect(() => {
    getProductsQuery();
  }, []);

  const changeProduct = useCallback(
    (product) => {
      const newSelectedProductId = product.target.value;
      setSelectedProductId(parseInt(newSelectedProductId));
    },
    [setSelectedProductId],
  );

  useEffect(() => {
    console.log(selectedProductId);
    getSizesQuery({
      variables: { productId: selectedProductId },
    });
  }, [selectedProductId]);

  // const location: LocationState = useLocation();
  // const qrUrl: string = location?.state?.qr;
  // const qrBarcode = qrUrl.split("barcode=")[1];
  const qrBarcode = "149ff66629377f6404b5c8d32936855";

  const [newBox, setNewBox] = React.useState<NewBoxType>(emptyBox);

  const { register, handleSubmit } = useForm();
  const onSubmit = async (formFields) => {
    const { productId, items, locationId, comments, sizeId } = formFields;

    try {
      console.log(formFields);
      const { data: mutationData } = await createBoxMutation({
        variables: {
          productId: Number(productId), // dropdown??
          items: Number(items),
          locationId: Number(locationId),
          comments: comments || "",
          sizeId: Number(sizeId), // dropdown? comes from productId?
          qrBarcode,
        },
      });
      setNewBox(mutationData.createBox);
    } catch (e) {
      // TODO error handling
      console.log("fail", e);
    }
  };

  return (
    <div className="flex flex-col">
      <h2>Create a Box</h2>
      {newBox.box_id && (
        <div data-testid="createdBox">
          <h1> You created a new box!</h1>
          <h1>The Box ID is: {newBox.box_id}</h1>
          <h1>Please write that on the top of the label.</h1>
          <h1>Scan another QR code to create another.</h1>
        </div>
      )}
      {!newBox.box_id && (
        <div>
          <form id="make-a-box" data-testid="createBoxForm" className="flex flex-col">
            {/* Note: eventually we will get the base from the URL,
            which will determine the locations via a query */}
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

            <br />

            <label className="p-2" htmlFor="comments">
              Product*
              <select onChange={changeProduct} name="productId" ref={register()}>
                {products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            <br />

            <label className="p-2" htmlFor="comments">
              Size*
              <select>
                {sizes?.map((size, i) => (
                  <option key={i} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <br />

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

            <br />

            <label className="p-2" htmlFor="items">
              # of items*
              <input
                defaultValue={2}
                className="border rounded"
                ref={register({ required: true, maxLength: 20 })}
                type="number"
                name="items"
              />
            </label>

            <br />

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

            <br />
          </form>

          <button
            type="submit"
            className="border bg-blue-400 rounded w-64"
            onClick={handleSubmit((formFields) => onSubmit(formFields))}
          >
            do the mutation
          </button>
        </div>
      )}
      {mutationLoading && <p data-testid="loadingState">Loading...</p>}
      {mutationError && <p data-testid="errorState">Error :( Please try again</p>}

      <Link
        to="/"
        className="m-1 leading-loose bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button"
      >
        Go Home
      </Link>
    </div>
  );
}
