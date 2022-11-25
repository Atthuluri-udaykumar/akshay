import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import PublishedFormsPage from "./PublishedFormsPage";
import DraftFormsPage from "./DraftFormsPage";
import { AntTab, AntTabs } from "../../ReusableComponents/CustomTabs";

const TabKeysEnum = {
  ProductionForms: "Production Forms",
  DraftForms: "Draft Forms",
};

export default function FormsPage() {
  const navigate = useNavigate();
  const pathname = window.location.pathname;
  const activeTab = React.useMemo(() => {
    return pathname.includes("draftforms")
      ? TabKeysEnum.DraftForms
      : TabKeysEnum.ProductionForms;
  }, [pathname]);

  let content = null;

  switch (activeTab) {
    case TabKeysEnum.ProductionForms: {
      content = <PublishedFormsPage />;
      break;
    }

    case TabKeysEnum.DraftForms: {
      content = <DraftFormsPage />;
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
		<div>
		<Typography variant="h2" ml={2}>
		Published Forms
      </Typography>
		</div>
      <AntTabs
        value={activeTab}
        onChange={(evt, value) => {
          if (value === TabKeysEnum.ProductionForms) {
            navigate("/publishedforms");
          } else {
            navigate("/draftforms");
          }
        }}
        scrollButtons="auto"
        variant="scrollable"
      >
        <AntTab value={TabKeysEnum.ProductionForms} label="Production Forms" />
        <AntTab value={TabKeysEnum.DraftForms} label="Draft Forms" />
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
}
