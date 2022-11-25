import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';

export interface IDialogBoxProps {
  dialogTriggerButtonTitle: string;
  dialogTriggerButtonIcon?: any;
  dialogTitle: string;
  isDialogOpen: boolean;
  dialogTriggerButtonText: string;
  handleClose: () => void;
  handleSave: () => void;
  handleDialogTriggerButtonAction: () => void;
  dialogTriggerButtonToggleHandler: (value: boolean) => void;
  contentText: string,
  children: any

}


export default function DialogBox(props: IDialogBoxProps) {


  const handleClickOpen = () => {
    props.handleDialogTriggerButtonAction();
    props.dialogTriggerButtonToggleHandler(true);
  };


  const handleClose = () => {
    props.dialogTriggerButtonToggleHandler(false)
  };

  const handleSave = async () => {
    props.handleSave()
  };

  return (
    <div>
      <Button startIcon={props.dialogTriggerButtonIcon} onClick={handleClickOpen}>
        {props.dialogTriggerButtonTitle}
      </Button>
      <Dialog open={props.isDialogOpen} onClose={handleClose} >
        <DialogTitle>{props.dialogTitle || ""}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.contentText || ""}
          </DialogContentText>
          {props.children}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>{props.dialogTriggerButtonText}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
