import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createPortal } from 'react-dom';
import useConfirmationPrompt from '../hooks/useConfirmationPrompt';

const ConfirmationPrompt = () => {
    const { onConfirm, onCancel, confirmState } = useConfirmationPrompt();
    const theme = useTheme();
    const portalElement = document.getElementById('portal');
    let contentCode = '';
    if(confirmState?.dialogType == 'confirmation'){
        contentCode = <React.Fragment>
                        <Button autoFocus onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button onClick={onConfirm} autoFocus>
                            Ok
                        </Button>
                    </React.Fragment>
    }
    if(confirmState?.dialogType == 'info'){
        contentCode = <React.Fragment>
                        <Button onClick={onConfirm} autoFocus>
                            Ok
                        </Button>
                     </React.Fragment>
    }
    if(confirmState?.dialogType == 'alert'){
        contentCode = <React.Fragment>
                        <Button autoFocus onClick={onCancel}>
                            No
                        </Button>
                        <Button onClick={onConfirm} autoFocus>
                            Yes
                        </Button>
                     </React.Fragment>
    }

    const component = (
        <div>
            <Dialog
                open={confirmState.show}
                onClose={onCancel}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                {confirmState?.title && confirmState.title}
                </DialogTitle>
                <DialogContent>
                <DialogContentText>
                {confirmState?.text && confirmState.text}
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                {contentCode}
                </DialogActions>
            </Dialog>
        </div>
    )

    return createPortal(component, portalElement);
};
export default ConfirmationPrompt;