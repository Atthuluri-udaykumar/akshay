import React from "react";
import ReferenceDataComponent from "./../../../ReusableComponents/ReferenceDataComponent";

export default function DosageForm(props) {
  return (
    <ReferenceDataComponent
      baseUrl="dosageformlist/"
      getUrl="getalldosageforms"
      postUrl="adddosageform"
      putUrl="updatedosageform"
      nameField="dosage_frm_lst_nm"
      idField="dosage_frm_lst_id"
      formLabel="Dosage Form"
      addButtonLabel="Add Dosage Form"
    />
  );
}
