import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import React from "react";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => {
  return {
    container: {
      padding: "16px",
      overflow: "auto",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "flex",
    },
    formName: { marginBottom: "16px" },
    secondAndOtherBtns: { marginLeft: "16px" },
    btnWithMgRight: { marginRight: "16px" },
    previewContainer: {
      margin: "24px 0px",
      flex: 1,
      display: "flex",
      width: "100%",
    },
    saveContainer: {
      margin: "16px 0px",
      display: "flex",
    },
  };
});

export interface ISearchRadioButoonsProps {
  value: SearchRadioButtonsValue;
  onChange: (value: React.ChangeEvent<HTMLInputElement>) => void;
  canEditForms: boolean;
}

export enum SearchRadioButtonsValue {
  Requirement = "requirement",
  GuidanceDocument = "guidanceDocument",
  UnansweredForms = "unansweredForm",
  FormCopy = "formCopy",
}

const SearchRadioButtons: React.FC<ISearchRadioButoonsProps> = (props) => {
  const { value, onChange, canEditForms } = props;
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <FormControl>
        <RadioGroup row value={value} onChange={onChange}>
          <FormControlLabel
            // className={classes.formName}
            key={"a"}
            value={SearchRadioButtonsValue.Requirement}
            control={<Radio color="primary" />}
            label={"Requirements Search"}
          />
          {/* <FormControlLabel
            // className={classes.formName}
            key={"b"}
            value={SearchRadioButtonsValue.GuidanceDocument}
            control={<Radio color="primary" />}
            label={"Guidance Documents"}
          /> */}
          {canEditForms && (
            <FormControlLabel
              // className={classes.formName}
              key={"c"}
              value={SearchRadioButtonsValue.UnansweredForms}
              control={<Radio color="primary" />}
              label={"Unanswered Forms"}
            />
          )}
          {canEditForms && (
            <FormControlLabel
              // className={classes.formName}
              key={"d"}
              value={SearchRadioButtonsValue.FormCopy}
              control={<Radio color="primary" />}
              label={"Form Copies"}
            />
          )}
        </RadioGroup>
      </FormControl>
    </div>
  );
};

export default SearchRadioButtons;
