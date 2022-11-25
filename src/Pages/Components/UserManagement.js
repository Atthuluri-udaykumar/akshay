import React, { useState } from "react";
import Audit from "./Audit";
import UserData from "./UserData";
import { AntTab, AntTabs } from "../ReusableComponents/CustomTabs";

const TabKeysEnum = {
  UserManagement: "User Data",
  Audit: "Audit Data",
};

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState(TabKeysEnum.UserManagement);

  let content = null;

  switch (activeTab) {
    case TabKeysEnum.UserManagement: {
      content = <UserData />;
      break;
    }

    case TabKeysEnum.Audit: {
      content = <Audit />;
      break;
    }

    default: {
      content = null;
    }
  }

  const node = (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <AntTabs
        value={activeTab}
        onChange={(evt, value) => setActiveTab(value)}
        scrollButtons="auto"
        variant="scrollable"
      >
        <AntTab value={TabKeysEnum.UserManagement} label="User Data" />
        <AntTab value={TabKeysEnum.Audit} label="Audit Data" />
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

  return node;
}
