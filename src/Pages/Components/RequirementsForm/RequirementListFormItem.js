import React from "react";
import PropTypes from "prop-types";
import { ListItem, ListItemText } from "@mui/material";

const RequirementListFormItem = (props) => {
  const { form, showDivider, onClick } = props;

  return (
    <ListItem
      button
      key={form.formId}
      divider={showDivider}
      onClick={() => onClick(form)}
    >
      <ListItemText primary={form.formName} />
    </ListItem>
  );
};

RequirementListFormItem.propTypes = {
  form: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  showDivider: PropTypes.bool,
};

export default RequirementListFormItem;
