import React from "react";
import TasksAPI from "../../../api/task";
import TaskListContainer from "./TaskListContainer";

const AssignedTasks: React.FC<{}> = (props) => {
  return (
    <TaskListContainer
      title="Assigned Tasks"
      getTasksShort={TasksAPI.getTasksForUser}
    />
  );
};

export default AssignedTasks;
