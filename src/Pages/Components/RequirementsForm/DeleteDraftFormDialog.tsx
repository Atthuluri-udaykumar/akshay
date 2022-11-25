import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  DialogTitle,
  Dialog,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { noop } from "lodash";

export interface IPublishDraftFormDialogProps {
  onClose: () => void;
  onContinue: () => void;
  open: boolean;
}

const useStyles = makeStyles((theme) => {
  return {
    dot: {
      display: "inline-block",
      fontWeight: "bold",
      margin: "0px 8px",
    },
  };
});

const DeleteDraftFormDialog: React.FC<IPublishDraftFormDialogProps> = (
  props
) => {
  const { onClose, onContinue, open } = props;

  return (
    <Dialog
      onClose={noop}
      aria-labelledby="submit-question-template-form-dialog-title"
      open={open}
    >
      <DialogTitle id="submit-question-template-form-dialog-title">
        Delete Draft Form
      </DialogTitle>
      <DialogContent dividers>
        <Typography>
          Are you sure you want to delete this draft form?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          No
        </Button>
        <Button onClick={onContinue} color="primary">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDraftFormDialog;
