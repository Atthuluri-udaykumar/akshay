import React from "react";
import { useSelector, useDispatch } from "react-redux";
import SessionActions from "../../redux-store/session/actions";
import SessionSelectors from "../../redux-store/session/selectors";

function useSession() {
  const dispatch = useDispatch();

  const user = useSelector(SessionSelectors.getUser);

  const setUser = React.useCallback(
    (userData) => {
      dispatch(SessionActions.setUser(userData));
    },
    [dispatch]
  );

  return { user, setUser };
}

export default useSession;
