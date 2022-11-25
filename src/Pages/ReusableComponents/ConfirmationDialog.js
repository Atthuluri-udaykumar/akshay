import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// doing this here cause I (Abayomi) tried putting it in useState and useRef
// but it wasn't working and I didn't know why.
let renderer = null;

export const useConfirmationDialogsHook = (props) => {
  /**
   * Array of FiFo dialog objects with the following fields:
   * id: string - hook assigned
   * title: string - required
   * message: string - required
   * callback: (response: boolean) => void - hook assigned
   */
  const [dialogs, setDialogs] = React.useState([]);
  const [isListenerAvailable, setIsListenerAvailable] = React.useState(true);

  React.useEffect(() => {
    if (renderer && isListenerAvailable && dialogs.length > 0) {
      const fulfill = (confirmation) => {
        const index = 0; // we are always working on index 0
        const dialog = dialogs[index];

        if (dialog) {
          const newDialogs = [...dialogs];

          newDialogs.splice(index, 1);
          setDialogs(newDialogs);

          dialog.callback(confirmation);
        }

        setIsListenerAvailable(true);
      };

      renderer({ fulfill, dialog: dialogs[0] });
      setIsListenerAvailable(false);
    }
  }, [dialogs, isListenerAvailable]);

  const enqueueDialog = React.useCallback(
    (entries) => {
      const newDialogs = [...dialogs];
      const promises = entries.map((entry) => {
        return new Promise((resolve) => {
          newDialogs.push({ ...entry, callback: resolve, id: Math.random() });
        });
      });

      setDialogs(newDialogs);
      return promises;
    },
    [dialogs]
  );

  const addListener = React.useCallback((cb) => {
    if (renderer) {
      console.error("Error adding listener: Listener already exist");
    }

    renderer = cb;
  }, []);

  return { enqueueDialog, dialogs, addListener };
};

export default function PortaledAlertsRenderer() {
  const { addListener } = useConfirmationDialogsHook();
  const [nextDialog, setDialog] = React.useState(null);

  const wrappedSetDialog = React.useCallback((data) => {
    setDialog(data);
  }, []);

  React.useEffect(() => {
    addListener(wrappedSetDialog);
  }, [addListener, wrappedSetDialog]);

  if (!nextDialog) {
    return null;
  }

  const { dialog, fulfill } = nextDialog;
  const { title, message } = dialog;

  const wrappedFulfill = (confirmation) => {
    fulfill(confirmation);
    setDialog(null);
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      onClose={() => {
        // do nothing
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => wrappedFulfill(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={() => wrappedFulfill(true)} color="primary">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
