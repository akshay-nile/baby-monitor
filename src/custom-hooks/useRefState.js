import { useState, useRef, useCallback } from "react";

function useRefState(defaultValue) {
  const [state, setState] = useState(defaultValue);
  const ref = useRef(defaultValue);

  const setValue = useCallback((valueOrUpdater) => {
    if (typeof valueOrUpdater === "function") {
      setState(prev => {
        const newValue = valueOrUpdater(prev);
        ref.current = newValue;
        return newValue;
      });
    } else {
      ref.current = valueOrUpdater;
      setState(valueOrUpdater);
    }
  }, []);

  const getValue = useCallback(() => ref.current, []);

  return [state, setValue, getValue];
}

export default useRefState;