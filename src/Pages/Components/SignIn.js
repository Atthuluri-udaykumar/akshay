import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';
import Container from "@mui/material/Container";
import Globe from "../../assets/RCubed-earth.png";
import { Auth } from "aws-amplify";
import { useGlobalState } from "../../context-store/useGlobalState";
import awsconfig from "../../aws-config";
import { Box } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn({ setName, setIsAuthenticating }) {
  const classes = useStyles();

  const [, dispatch] = useGlobalState();

  useEffect(() => {
    // TODO: figure out why couses infinite loop
    // dispatch({ type: "SET_LOADING", value: true });
    (async () => {
      dispatch({ type: "SET_LOADING", value: false });
    })();
  }, [dispatch]);

  return (
    <>
      <Container component="main" maxWidth="xs">
        <CssBaseline />

        <div className={classes.paper}>
          <Box
            component="img"
            sx={{
            maxHeight: 280,
            marginTop:0.5,
            marginLeft:0
            }}
            alt="Logo"
            src={Globe}
          />
          <Typography component="h1" variant="h4" sx={{color:'#1e96f2', marginTop:5}}>
            RCubed
          </Typography>
          <form className={classes.form} noValidate>
            <Button
              fullWidth
              variant="contained"
              sx={{background:'#4050b5'}}
              className={classes.submit}
              onClick={() => Auth.federatedSignIn({ provider: awsconfig.identity_provider.identity_provider_name })}
            >
              Sign In
            </Button>
          </form>
        </div>
      </Container>
    </>
  );
}
