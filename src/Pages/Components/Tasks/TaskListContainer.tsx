import React from "react";
import { useRequest } from "ahooks";
import { noop } from "lodash";
import assert from "assert";
import { ITaskShort } from "./types";
import TasksAPI from "../../../api/task";
import TaskList from "./TaskList";
import { useOperationWrapper } from "../../hooks/useOperationWrapper";
import { usePublishForm } from "../../hooks/usePublishForm";
import DraftFormsAPI from "../../../api/draft";

export interface ITaskListContainerProps {
  title: string;
  getTasksShort: () => Promise<ITaskShort[]>;
}

const TaskListContainer: React.FC<ITaskListContainerProps> = (props) => {
  const { title, getTasksShort } = props;
  const getTasks = React.useCallback(async () => {
    const tasksShort = await getTasksShort();
    return await Promise.all(
      tasksShort.map((item) => TasksAPI.getTask(item.taskId))
    );
  }, [getTasksShort]);

  const { data, error, loading, run } = useRequest(getTasks);
  const handleAcceptTaskFn = React.useCallback(
    async (taskId: number) => {
      await TasksAPI.acceptTask(taskId);
      run();
    },
    [run]
  );

  const handleRejectTaskFn = React.useCallback(
    async (taskId: number) => {
      await TasksAPI.rejectTask(taskId);
      run();
    },
    [run]
  );

  const publishFormHelpers = usePublishForm({
    onCompletePublishForm: run,
    saveFormFn: noop,
  });

  const handleCompleteTaskFn = React.useCallback(async (taskId: number) => {
    const task = await TasksAPI.getTask(taskId);
    assert(task, "Task not found.");
    await TasksAPI.completeTask(taskId);
    const form = await DraftFormsAPI.getForm(task.formId);
    await publishFormHelpers.run(form);
    // publishFormHelpers.run() calls run() which reloads the page
  }, []);

  const { loading: acceptingTask, run: onAcceptTask } = useOperationWrapper(
    handleAcceptTaskFn,
    {
      loadingMessage: "Accepting task...",
      successMessage: "Task accepted.",
      defaultErrorMessage: "Error accepting task.",
    }
  );

  const { loading: rejectingTask, run: onRejectTask } = useOperationWrapper(
    handleRejectTaskFn,
    {
      loadingMessage: "Dropping task...",
      successMessage: "Task dropped.",
      defaultErrorMessage: "Error dropping task.",
    }
  );

  const { loading: completingTask, run: onCompleteTask } = useOperationWrapper(
    handleCompleteTaskFn,
    {
      loadingMessage: "Completing task...",
      successMessage: "Task completed.",
      defaultErrorMessage: "Error completing task.",
    }
  );

  return (
    <TaskList
      loading={loading}
      error={error?.message}
      title={title}
      tasks={data}
      reloadFunc={run}
      onAcceptTask={onAcceptTask}
      onCompleteTask={onCompleteTask}
      onRejectTask={onRejectTask}
      disableButtons={acceptingTask || rejectingTask || completingTask}
    />
  );
};

export default TaskListContainer;
