import React, { useState } from "react";
import ProductType from "./ProductType";
import { Typography } from "@mui/material";
import SubmissionType from "./SubmissionType";
import DosageForm from "./DosageForm";
import RequirementCategories from "./RequirementCategories";
import DossierSectionList from "./DossierSection/SectionList";
import GeneralRequirementCategories from "./GeneralRequirementCategories";
import { AntTab, AntTabs } from "../../ReusableComponents/CustomTabs";
import CountryReferenceDataComponent from "./Country/CountryReferenceDataComponent";

const TabKeysEnum = {
  ProductType: "Product Type",
  SubmissionType: "Submission Type",
  DossageForm: "Dosage Form",
  RequirementCategories: "Requirement Categories",
  DossierSection: "Dossier Section",
  GeneralRequirementCategories: "General Requirement Categories",
  Country: "Country"
};

export default function CustomizedDialogs() {
  const [activeTab, setActiveTab] = useState(TabKeysEnum.ProductType);

  let content = null;

  switch (activeTab) {
    case TabKeysEnum.DossierSection: {
      content = <DossierSectionList />;
      break;
    }

    case TabKeysEnum.DossageForm: {
      content = <DosageForm />;
      break;
    }

    case TabKeysEnum.GeneralRequirementCategories: {
      content = <GeneralRequirementCategories />;
      break;
    }

    case TabKeysEnum.ProductType: {
      content = <ProductType />;
      break;
    }

    case TabKeysEnum.RequirementCategories: {
      content = <RequirementCategories />;
      break;
    }

    case TabKeysEnum.SubmissionType: {
      content = <SubmissionType />;
      break;
    }

    case TabKeysEnum.Country: {
      content = <CountryReferenceDataComponent  
      baseUrl="countries/"
      getUrl="allcountries"
      putUrl="updategeneralrequirementcategory"
      postUrl="addgeneralrequirementcategory"
      nameField="country_nm"
      idField="countries_id"/>;
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
      <Typography variant="h2" ml={3}>
        Data Management
      </Typography>
      <AntTabs
        value={activeTab}
        onChange={(evt, value) => setActiveTab(value)}
        scrollButtons="auto"
        variant="scrollable"
      >
        <AntTab value={TabKeysEnum.ProductType} label="Product Type" />
        <AntTab value={TabKeysEnum.SubmissionType} label="Submission Type" />
        <AntTab value={TabKeysEnum.DossageForm} label="Dosage Form" />
        <AntTab
          value={TabKeysEnum.RequirementCategories}
          label="Requirement Categories"
        />
        <AntTab value={TabKeysEnum.DossierSection} label="Dossier Section" />
        <AntTab
          value={TabKeysEnum.GeneralRequirementCategories}
          label="General Requirement Categories"
        />
        <AntTab
          value={TabKeysEnum.Country}
          label="Country"
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

  return node;
}

