import React from "react";
import ReferenceDataComponent from "./../../../ReusableComponents/ReferenceDataComponent";

export default function SubmissionType(props) {
  return (
    <ReferenceDataComponent
      baseUrl="submissiontype/"
      getUrl="getallsubmissiontypes"
      postUrl="addsubmissiontype"
      putUrl="updatesubmissiontype"
      nameField="sub_typ_nm"
      idField="sub_typ_id"
      addButtonLabel="Add Submission Type"
      formLabel="Submission Type"
    />
  );
}
