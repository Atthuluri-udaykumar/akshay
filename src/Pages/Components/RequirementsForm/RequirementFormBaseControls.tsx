import React from "react";
import { Button, Chip, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { ITask } from "../Tasks/types";
import { getLillyIDForAPI } from "../../../api/utils";

const useStyles = makeStyles(() => {
  return {
    btnWithMgRight: { marginRight: "16px" },
    gotoTaskLink: {
      color: "#1890ff",
    },
    root: {},
    leftButtons: {
      flex: 1,
      // marginRight: "16px",
    },
    acceptedTask: {
      marginTop: "8px",
      padding: "2px 0px",
      height: "24px !important",
      marginBottom: "16px",
    },
  };
});

export interface IRequirementFormBaseControlsProps {
  isReview?: boolean;
  isDeleting?: boolean;
  draftFormTask?: ITask;
  isSaving?: boolean;
  isPublishing?: boolean;
  isCreatingTask?: boolean;
  isCompletingReview?: boolean;
  isDraftForm?: boolean;
  disableDeleteForm?: boolean;
  isPreviewMode?: boolean;
  onEditForm: () => void;
  onSaveForm: () => void;
  onCompleteReview: () => void;
  setDeleteFormDialogVisibility: (show: boolean) => void;
  setPublishFormDialogVisibility: (show: boolean) => void;
  setShowPreview: (show: boolean) => void;
}

const RequirementFormBaseControls: React.FC<
  IRequirementFormBaseControlsProps
> = (props) => {
  const {
    isReview,
    isDeleting,
    draftFormTask,
    isSaving,
    isPublishing,
    isCreatingTask,
    isCompletingReview,
    isDraftForm,
    disableDeleteForm,
    isPreviewMode,
    onEditForm,
    onSaveForm,
    onCompleteReview,
    setDeleteFormDialogVisibility,
    setPublishFormDialogVisibility,
    setShowPreview,
  } = props;

  const classes = useStyles();
  const openDeleteFormDialog = React.useCallback(() => {
    setDeleteFormDialogVisibility(true);
  }, []);

  const openPublishFormDialog = React.useCallback(() => {
    setPublishFormDialogVisibility(true);
  }, []);

  const isPerformingAction =
    isSaving ||
    isPublishing ||
    isDeleting ||
    isCreatingTask ||
    isCompletingReview;

  const disableDraftButtons = isReview || isPerformingAction;
  const leftButtons = (
    <div className={classes.leftButtons}>
      {isDraftForm ? (
        <React.Fragment>
          {!disableDeleteForm && (
            <Button
              disableElevation
              variant="contained"
              color="secondary"
              onClick={openDeleteFormDialog}
              size="small"
              disabled={disableDraftButtons || disableDeleteForm}
              className={classes.btnWithMgRight}
            >
              {isDeleting ? "Deleting Form..." : "Delete Form"}
            </Button>
          )}
          <Button
            disableElevation
            variant="contained"
            color="primary"
            onClick={onSaveForm}
            size="small"
            disabled={disableDraftButtons}
            className={classes.btnWithMgRight}
          >
            {isSaving ? "Saving Form..." : "Save Form"}
          </Button>
          {!disableDeleteForm && !draftFormTask && (
            <Button
              disableElevation
              variant="contained"
              color="primary"
              onClick={openPublishFormDialog}
              size="small"
              className={classes.btnWithMgRight}
              disabled={disableDraftButtons || disableDeleteForm}
            >
              {isPublishing
                ? "Publishing Form..."
                : isCreatingTask
                ? "Creating Task..."
                : "Publish Form"}
            </Button>
          )}
          {!disableDeleteForm && draftFormTask && (
            <Button
              disableElevation
              variant="contained"
              color="primary"
              onClick={onCompleteReview}
              size="small"
              className={classes.btnWithMgRight}
              disabled={
                isPerformingAction ||
                draftFormTask.assignedTo !== getLillyIDForAPI()
              }
            >
              {isCompletingReview ? "Completing Review..." : "Complete Review"}
            </Button>
          )}
        </React.Fragment>
      ) : (
        <Button
          disableElevation
          variant="contained"
          color="primary"
          onClick={onEditForm}
          className={classes.btnWithMgRight}
          size="small"
        >
          Edit Form
        </Button>
      )}
      {isPreviewMode ? (
        <Button
          disableElevation
          variant="contained"
          color="secondary"
          onClick={() => {
            setShowPreview(false);
          }}
          size="small"
          disabled={isReview}
        >
          End Preview
        </Button>
      ) : (
        <Button
          disableElevation
          variant="contained"
          color="primary"
          onClick={() => {
            setShowPreview(true);
          }}
          size="small"
          disabled={isReview}
        >
          Preview Form
        </Button>
      )}
    </div>
  );

  return (
    <div className={classes.root}>
      {leftButtons}
      {draftFormTask && (
        <>
          {/* <Chip
            label="Accepted task"
            className={classes.acceptedTask}
            // variant="outlined"
          /> */}
          <Typography className={classes.acceptedTask} variant="body2">
            "Complete Review" is disabled because the draft form's task is not
            assigned to you.
          </Typography>
        </>
      )}
    </div>
  );
};

export default RequirementFormBaseControls;
