import React, { useState, useEffect } from "react";
import SignIn from "./Pages/Components/SignIn";
import CircularProgress from "@mui/material/CircularProgress";
import AppBarComponent from "./Pages/Components/AppBarComponent";
import awsconfig from "./aws-config";
import { useGlobalState } from "./context-store/useGlobalState";
import Routes from "./Pages/Components/Routes";
import IdleTimerContainer from "./Pages/Components/IdleTimerContainer";
import { userData } from "./API";
import { Auth, Hub, Amplify } from "aws-amplify";
import "./App.css";
import useSession from "./Pages/hooks/useSession";
import { appConsoleLog } from "./util_funcs/console";
import AccessDeniedPage from "./Pages/Components/AccessDeniedPage";
import { getUserGroup, GenericUserGroups } from "./global/userGroups";
import { getEnvironment } from "./global/env";

Amplify.configure({
  Auth: awsconfig.auth,
  Storage: awsconfig.storage,
  API: awsconfig.api,
});

const App = () => {
  const [name, setName] = useState();
  const [signIn, setSignIn] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [, dispatch] = useGlobalState();
  const [loading, setLoading] = useState(true);
  const [userGroups, setUserGroups] = useState([]);
  const { setUser } = useSession();

  useEffect(() => {
    (async () => {
      try {
        await Hub.listen("auth", ({ payload: { event, data } }) => {
          event == "signIn" || "cognitoHostedUI" ? getUser() : "";
        });
      } catch (e) {
        console.log("Auth error", e);
      }
      dispatch({ type: "SET_LOADING", value: false });
    })();

    const getUser = () => {
      return Auth.currentAuthenticatedUser()
        .then((user) => {
          //appConsoleLog("user details", user);
          userData(user.attributes);
          dispatch({ type: "SET_USER", value: { user } });
          setUser(user);
          setName(user.attributes.name);

          let groups = [];

          try {
            groups = JSON.parse(user.attributes.nickname);
            setUserGroups(groups);
          } catch (error) {
            console.error(error);
          }

          console.log("groups", groups);
          console.log(getUserGroup(getEnvironment(), GenericUserGroups.User));

          if (
            !groups?.includes(
              getUserGroup(getEnvironment(), GenericUserGroups.User)
            )
          ) {
            setAccessDenied(true);
          }

          setSignIn(false);
          setLoading(false);

          // setUserGroups([
          //   getUserGroup(AppEnvironment.Dev, GenericUserGroups.User),
          // ]);

          // setAccessDenied(true);
        })
        .catch((e) => {
          console.log("signIn error:", e);
          setLoading(false);
        });
    };
    getUser();
  }, [dispatch]); // TODO investigate why dispatch was needed to stop warning
  return (
    <>
      {loading ? (
        <div className="center-screen">
          <CircularProgress />
        </div>
      ) : signIn ? (
        <SignIn setName={setName} />
      ) : accessDenied ? (
        <AccessDeniedPage
          setGotoSignInPage={() => {
            setAccessDenied(false);
            setSignIn(true);
          }}
        />
      ) : (
        <React.Fragment>
          <IdleTimerContainer />
          <AppBarComponent
            main={<Routes userGroups={userGroups} />}
            name={name}
            userGroups={userGroups}
          />
        </React.Fragment>
      )}
    </>
  );
};

export default App;

