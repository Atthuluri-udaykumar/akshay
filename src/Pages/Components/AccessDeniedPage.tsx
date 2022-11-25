import React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import  {makeStyles} from "@mui/styles";
import Container from "@mui/material/Container";
import Atmosphere from "../../assets/atmosphere.svg";
import Globe from "../../assets/globe.svg";
import { Theme } from '@mui/material';


const useStyles = makeStyles((theme:Theme) => ({
  paper: {
    marginTop: theme.spacing(11),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(0, 0, 1),
  },
  submit: {
    margin: theme.spacing(0, 0, 1),
  },
}));

export interface IAcessDeniedPageProps {
  setGotoSignInPage: () => void;
}

const AccessDeniedPage: React.FC<IAcessDeniedPageProps> = (props) => {
  const { setGotoSignInPage } = props;
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <div className={classes.paper}>
      <img className={`spinreverse`} src={Atmosphere} alt="atmosphere" />
      <img className={`spin`} src={Globe} alt="globe" />
        {/* <Typography
          align="left"
          color="error"
          component="h1"
          variant="subtitle2"
          gutterBottom={true}
        >
          YOU SHALL NOT PASS - Gandalf
        </Typography> */}
        <Typography
          component="h3"
          variant="h5"
          align="center"
          gutterBottom={false}
        >
          YOU DO NOT HAVE ACCESS TO THE APPLICATION.
        </Typography>
        <Typography
          component="h3"
          variant="subtitle1"
          align="center"
          gutterBottom={false}
        >
          If you believe this to be an error please contact the system
          administrator.
        </Typography>
        <form className={classes.form} noValidate>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={setGotoSignInPage}
          >
            Sign In
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default AccessDeniedPage;
