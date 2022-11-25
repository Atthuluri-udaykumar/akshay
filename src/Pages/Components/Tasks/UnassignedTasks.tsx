import React from "react";
import TasksAPI from "../../../api/task";
import TaskListContainer from "./TaskListContainer";

const UnassignedTasks: React.FC<{}> = (props) => {
  return (
    <TaskListContainer
      title="Unassigned Tasks"
      getTasksShort={TasksAPI.getUnassignedDraftReviewTasks}
    />
  );
};

export default UnassignedTasks;
