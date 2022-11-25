import "core-js/web/url-search-params";

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { initialState } from "./context-store/initialState";
import { reducer } from "./context-store/reducer";
import { Provider } from "./context-store/useGlobalState";
import { SnackbarProvider } from "notistack";
import PortaledAlertsRenderer from "./Pages/ReusableComponents/ConfirmationDialog";
import { Provider as ReduxStoreProvider } from "react-redux";
import reduxStore from "./redux-store/store";
import ConfirmationPrompt from "./Pages/ReusableComponents/ConfirmationPrompt";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1e96f2",
      contrastText: "#fff",
    },
    background: {
      default: "#fafafa",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Rubik",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    h2: {
      fontFamily: "Roboto",
      fontSize: "25px",
      fontWeight: 500,
      color: "#2196F3",
      marginTop: "21px",
      marginBottom: "21px",
    },
  },
});

/* TODO upgrade materialUI to v5 and add back strictMode 
  <React.StrictMode>
  https://stackoverflow.com/questions/61220424/material-ui-drawer-finddomnode-is-deprecated-in-strictmode
*/
ReactDOM.render(
  <React.StrictMode>
    <ReduxStoreProvider store={reduxStore}>
      <Provider reducer={reducer} initialState={initialState}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={5} autoHideDuration={5000}>
              <PortaledAlertsRenderer />
              <App />
              <ConfirmationPrompt />
            </SnackbarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ReduxStoreProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

