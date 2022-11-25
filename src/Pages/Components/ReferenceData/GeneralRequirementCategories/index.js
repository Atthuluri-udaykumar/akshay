import React from "react";
import ReferenceDataComponent from "./../../../ReusableComponents/ReferenceDataComponent";

export default function GeneralRequirementCategories(props) {
  return (
    <ReferenceDataComponent
      baseUrl="generalrequirementcategorylist/"
      getUrl="getallgeneralrequirementcategorylist"
      putUrl="updategeneralrequirementcategory"
      postUrl="addgeneralrequirementcategory"
      nameField="gen_req_cat_lst_nm"
      idField="gen_req_cat_lst_id"
      addButtonLabel="Add General Requirement"
      formLabel="General Requirement"
    />
  );
}
