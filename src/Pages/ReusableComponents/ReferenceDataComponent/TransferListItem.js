import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import EditRounded from "@mui/icons-material/EditRounded";
import IconButton from "@mui/material/IconButton";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import PropTypes from "prop-types";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  icon: {
    fontSize: "18px",
  },
}));

const TransferListItem = (props) => {
  const {
    id,
    name,
    disabled,
    checked,
    showDivider,
    handleToggle,
    toggleEditing,
  } = props;

  const classes = useStyles();
  const labelId = `reference-data-${id}-label`;

  return (
    <ListItem
      button
      divider={showDivider}
      onClick={handleToggle}
      style={{ paddingLeft: 0 }}
    >
      <ListItemIcon>
        <Checkbox
          disableRipple
          color="primary"
          checked={checked}
          tabIndex={-1}
          disabled={disabled}
          inputProps={{ "aria-labelledby": labelId }}
          onChange={handleToggle}
        />
      </ListItemIcon>
      <ListItemText
        id={labelId}
        primary={name}
        primaryTypographyProps={{ style: { wordBreak: "break-all" } }}
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="edit" onClick={toggleEditing} size="large">
          <EditRounded className={classes.icon} />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default TransferListItem;

TransferListItem.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  handleToggle: PropTypes.func.isRequired,
  toggleEditing: PropTypes.func.isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  showDivider: PropTypes.bool,
};
