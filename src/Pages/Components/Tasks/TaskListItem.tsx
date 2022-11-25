import React from "react";
import {
  ListItem,
  ListItemText,
  Typography,
  Button,
  ButtonGroup,
  Chip,
  Theme,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { useNavigate } from "react-router-dom";
import { ITask } from "./types";
import { formatDate } from "../../../util_funcs/reusables";

const useStyles = makeStyles((theme:Theme) => {
  return {
    buttons: {
      marginTop: "16px",
      display: "flex",
    },
    buttonsLeftContainer: {
      flex: 1,
      marginRight: theme.spacing(2),
    },
    gotoDraftFormLink: {
      color: "#1890ff",
    },
    chip: {
      marginRight: "8px",
    },
    chipContainer: {
      marginTop: theme.spacing(2),
    },
  };
});

export interface TaskListItemProps {
  disableButtons?: boolean;
  showDivider?: boolean;
  task: ITask;
  onAcceptTask: (id: number) => void;
  onRejectTask: (id: number) => void;
  onCompleteTask: (id: number) => void;
}

const TaskListItem: React.FC<TaskListItemProps> = (props) => {
  const {
    disableButtons,
    showDivider,
    task,
    onAcceptTask,
    onRejectTask,
    onCompleteTask,
  } = props;

  const classes = useStyles();
  const navigate = useNavigate();
  const wrappedOnAcceptTask = React.useCallback(() => {
    onAcceptTask(task.taskId);
  }, [task, onAcceptTask]);

  const wrappedOnCompleteTask = React.useCallback(() => {
    onCompleteTask(task.taskId);
  }, [task, onCompleteTask]);

  const wrappedOnRejectTask = React.useCallback(() => {
    onRejectTask(task.taskId);
  }, [task, onRejectTask]);

  const onGotoDraftForm = React.useCallback(() => {
    navigate(`/draftforms/${task.formId}?diffForm=true`);
  }, [history]);

  let controlsNode: React.ReactNode = null;
  let statusNodes: React.ReactNode[] = [];

  if (task.assignedTo && task.formId) {
    controlsNode = (
      <div className={classes.buttons}>
        <ButtonGroup
          size="small"
          aria-label="assigned task action button group"
          className={classes.buttonsLeftContainer}
          variant="outlined"
        >
          <Button
            key="reject-task"
            onClick={wrappedOnRejectTask}
            disabled={disableButtons || !task.formId || task.isComplete}
            variant="outlined"
            aria-label="reject task"
          >
            Reject Task
          </Button>
          <Button
            key="complete-task"
            onClick={wrappedOnCompleteTask}
            disabled={disableButtons || !task.formId || task.isComplete}
            variant="outlined"
            aria-label="complete task"
          >
            Complete Task
          </Button>
        </ButtonGroup>
        <div>
          <Button
            variant="text"
            aria-label="go to draft form"
            className={classes.gotoDraftFormLink}
            onClick={onGotoDraftForm}
            disabled={!task.formId}
          >
            Diff Form
          </Button>
        </div>
      </div>
    );
  }

  if (!task.assignedTo && task.formId) {
    controlsNode = (
      <div className={classes.buttons}>
        <ButtonGroup
          size="small"
          aria-label="unassigned task action button group"
          className={classes.buttonsLeftContainer}
          variant="outlined"
        >
          <Button
            key="accept-task"
            onClick={wrappedOnAcceptTask}
            disabled={disableButtons || !task.formId}
            variant="outlined"
            aria-label="accept task"
          >
            Accept Task
          </Button>
        </ButtonGroup>

        <div>
          <Button
            variant="text"
            aria-label="preview task"
            className={classes.gotoDraftFormLink}
            disabled={disableButtons || !task.formId}
            onClick={onGotoDraftForm}
          >
            Diff Form
          </Button>
        </div>
      </div>
    );
  }

  if (task.completeDate) {
    statusNodes.push(
      <Chip
        label={`Completed ${formatDate(task.completeDate)}`}
        // variant="outlined"
        className={classes.chip}
      />
    );
  }

  if (task.createDate) {
    statusNodes.push(
      <Chip
        label={`Created ${formatDate(task.createDate)}`}
        // variant="outlined"
        className={classes.chip}
      />
    );
  }

  if (task.dueDate) {
    statusNodes.push(
      <Chip
        label={`Due ${formatDate(task.dueDate)}`}
        // variant="outlined"
        className={classes.chip}
      />
    );
  }

  if (task.acceptDate && task.assignedTo) {
    statusNodes.push(
      <Chip
        label={`Accepted ${formatDate(task.acceptDate)}`}
        // variant="outlined"
        className={classes.chip}
      />
    );
  }

  if (task.isReviewed) {
    statusNodes.push(
      <Chip
        label={"Reviewed"}
        // variant="outlined"
        className={classes.chip}
      />
    );
  }

  return (
    <ListItem button divider={showDivider} key={task.taskId}>
      <ListItemText
        primary={task.details}
        secondary={
          <div>
            {!task.assignedTo && !task.formId && !task.isComplete && (
              <Typography variant="body2">Task draft form not found</Typography>
            )}
            <div className={classes.chipContainer}>{statusNodes}</div>
            {controlsNode}
          </div>
        }
      />
    </ListItem>
  );
};

export default TaskListItem;
