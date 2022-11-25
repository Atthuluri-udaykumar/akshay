import { Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AntTab, AntTabs } from "../../ReusableComponents/CustomTabs";
import AssignedTasks from "./AssignedTasks";
import UnassignedTasks from "./UnassignedTasks";

const TabKeysEnum = {
  AssignedTasks: "Assigned Tasks",
  UnassignedTasks: "Unassigned Tasks",
};

export interface ITasksProps {}

const Tasks: React.FC<ITasksProps> = (props) => {
  const navigate = useNavigate();
  let content: React.ReactNode = null;
  const pathname = window.location.pathname;
  const activeTab = React.useMemo(() => {
    return pathname.includes("unassignedtasks")
      ? TabKeysEnum.UnassignedTasks
      : TabKeysEnum.AssignedTasks;
  }, [pathname]);

  switch (activeTab) {
    case TabKeysEnum.AssignedTasks: {
      content = <AssignedTasks />;
      break;
    }

    case TabKeysEnum.UnassignedTasks: {
      content = <UnassignedTasks />;
      break;
    }

    default: {
      content = null;
    }
  }
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Typography variant="h2" ml={3}>
        Tasks
      </Typography>
      <AntTabs
        value={activeTab}
        onChange={(evt, value) => {
          if (value === TabKeysEnum.AssignedTasks) {
            navigate("/assignedtasks");
          } else {
            navigate("/unassignedtasks");
          }
        }}
        scrollButtons="auto"
        variant="scrollable"
      >
        <AntTab
          value={TabKeysEnum.AssignedTasks}
          label={TabKeysEnum.AssignedTasks}
        />
        <AntTab
          value={TabKeysEnum.UnassignedTasks}
          label={TabKeysEnum.UnassignedTasks}
        />
      </AntTabs>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export default Tasks;

