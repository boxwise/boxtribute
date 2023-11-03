/* eslint-disable no-param-reassign */
/* eslint-disable react/require-default-props */
import React, { useEffect, forwardRef } from "react";

// TODO rename
interface IProps {
  indeterminate?: boolean;
  name?: string;
}

const useCombinedRefs = (...refs): React.MutableRefObject<any> => {
  const targetRef = React.useRef();

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
};

const IndeterminateCheckbox = forwardRef<HTMLInputElement, IProps>(
  ({ indeterminate, ...rest }, ref: React.Ref<HTMLInputElement>) => {
    const defaultRef = React.useRef(null);
    const combinedRef = useCombinedRefs(ref, defaultRef);

    useEffect(() => {
      if (combinedRef?.current) {
        combinedRef.current.indeterminate = indeterminate ?? false;
      }
    }, [combinedRef, indeterminate]);

    return (
      <input type="checkbox" ref={combinedRef} onClick={(e) => e.stopPropagation()} {...rest} />
    );
  },
);

export default IndeterminateCheckbox;
