import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { List, Typography, Paper, Theme } from "@mui/material";
import LoadStateAndError from "../../ReusableComponents/LoadStateAndError";
import { ITask } from "./types";
import TaskListItem, { TaskListItemProps } from "./TaskListItem";

const useStyles = makeStyles((theme:Theme) => {
  return {
    root: {
      width: "100%",
      height: "100%",
      padding: "16px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    },
    listHeader: {
      margin: "16px 0px",
      marginBottom: "8px",
      padding: "0px 16px",
    },
    paperContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      marginTop: theme.spacing(2),
    },
    textContainer: {
      padding: "16px",
    },
    loadingContainer: {
      padding: "16px",
    },
  };
});

export interface ITaskListProps extends Omit<TaskListItemProps, "task"> {
  loading?: boolean;
  error?: string;
  title: string;
  tasks?: ITask[];
  reloadFunc?: () => void;
}

const TaskList: React.FC<ITaskListProps> = (props) => {
  const { loading, error, title, tasks, reloadFunc } = props;
  const classes = useStyles();
  let contentNode: React.ReactNode = null;

  if (loading || error || !tasks) {
    contentNode = (
      <div className={classes.loadingContainer}>
        <LoadStateAndError
          loading={loading || (!error && !tasks)}
          loadingMessage="Loading tasks..."
          error={error}
          reloadFunc={reloadFunc}
        />
      </div>
    );
  } else if (tasks.length === 0) {
    contentNode = (
      <Typography variant="body1" className={classes.textContainer}>
        No task found.
      </Typography>
    );
  } else {
    contentNode = (
      <List>
        {tasks.map((task, index) => {
          return (
            <TaskListItem
              {...props}
              key={task.taskId}
              task={task}
              showDivider={index < tasks.length - 1}
            />
          );
        })}
      </List>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.paperContainer}>
        <Paper>
          <Typography
            variant="h6"
            component="div"
            className={classes.listHeader}
          >
            {title}
          </Typography>
          {contentNode}
        </Paper>
      </div>
    </div>
  );
};

export default TaskList;
