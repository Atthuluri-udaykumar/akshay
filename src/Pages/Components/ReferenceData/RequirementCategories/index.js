import React from "react";
import ReferenceDataComponent from "./../../../ReusableComponents/ReferenceDataComponent";

export default function RequirementCategories(props) {
  return (
    <ReferenceDataComponent
      baseUrl="requirementcategorylist/"
      getUrl="getallrequirementcategorylist"
      putUrl="updaterequirementcategory"
      postUrl="addrequirementcategory"
      nameField="req_cat_lst_nm"
      idField="req_cat_lst_id"
      formLabel="Requirement Category"
      addButtonLabel="Add Requirement Category"
    />
  );
}
