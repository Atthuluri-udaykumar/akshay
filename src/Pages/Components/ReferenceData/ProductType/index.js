import React from "react";
import ReferenceDataComponent from "./../../../ReusableComponents/ReferenceDataComponent";

export default function ProductType(props) {
  return (
    <ReferenceDataComponent
      baseUrl="producttype/"
      getUrl="getallproducttype"
      postUrl="addproducttype"
      putUrl="updateproducttype"
      nameField="product_type_nm"
      idField="product_type_id"
      formLabel="Product Type"
      addButtonLabel="Add Product Type"
    />
  );
}
