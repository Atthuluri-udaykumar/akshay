/**
 * @fileoverview
 * Project: RCubed
 * Authors: Ara Lena
 * File: IdleTimerContainer.js
 * Description: This file handles User Logout due to inactivity
 */

import React, { useState, useRef } from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import { Button } from "@mui/material";
import { useIdleTimer } from 'react-idle-timer';
import { Auth } from "aws-amplify";

const IdleTimerContainer = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const idleTimerRef = useRef(null)
  const sessionTimeoutRef = useRef(null)

  const onIdle = () => {
    setModalIsOpen(true)
    sessionTimeoutRef.current = setTimeout(LogOut, 10000)
  }
  const idleTimer = useIdleTimer({ onIdle:onIdle,timeout: 1200 * 1000 });

  const handleClose = () => {
    setModalIsOpen(false);
  }
  const LogOut = () => {
    setModalIsOpen(false);
    Auth.signOut();
    clearTimeout(sessionTimeoutRef.current);
  }
  const stayActive = () => {
    setModalIsOpen(false);
    //if user was active after modal opens, we don't need timeout anymore
    clearTimeout(sessionTimeoutRef.current);
  }

  return (
    <>
      <Dialog
        open={modalIsOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {" "}
          User Inactivity
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You will be logged out soon
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              LogOut({ vertical: "bottom", horizontal: "right" })
            }
            color="primary"
            autoFocus
          >
            LogOut
          </Button>
          <Button onClick={stayActive} color="primary">
            Stay Active
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default IdleTimerContainer;