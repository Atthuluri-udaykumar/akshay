import React from "react";
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
} from "@mui/material";
import { noop } from "lodash";

export enum PublishFormDecision {
  CreateTask = "create-task",
  PublishForm = "publish-form",
}

export interface IPublishDraftFormDialogProps {
  onClose: () => void;
  onContinue: (decision: PublishFormDecision) => void;
  open: boolean;
}

const PublishDraftFormDialog: React.FC<IPublishDraftFormDialogProps> = (
  props
) => {
  const { onClose, onContinue, open } = props;
  const [value, setValue] = React.useState<PublishFormDecision>();
  const handleChange = React.useCallback((event) => {
    setValue(event.target.value);
  }, []);

  const handleOk = React.useCallback(() => {
    if (value) {
      onContinue(value);
    }
  }, [value, onContinue]);

  return (
    <Dialog
      onClose={noop}
      aria-labelledby="submit-question-template-form-dialog-title"
      open={open}
    >
      <DialogTitle id="submit-question-template-form-dialog-title">
        Publish Form Preference
      </DialogTitle>
      <DialogContent dividers>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="publish form preference"
            value={value}
            onChange={handleChange}
          >
            <FormControlLabel
              value={PublishFormDecision.CreateTask}
              control={<Radio />}
              label="Create task for review"
            />
            <FormControlLabel
              value={PublishFormDecision.PublishForm}
              control={<Radio />}
              label="Publish form"
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOk} color="primary" disabled={!value}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishDraftFormDialog;
