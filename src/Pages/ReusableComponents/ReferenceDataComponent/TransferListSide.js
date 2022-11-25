import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import PropTypes from "prop-types";
import { indexReferenceDataRecords, sortRecordsAlphabetically } from "./utils";
import TransferListItem from "./TransferListItem";
import { Typography } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  side: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sideHeader: {
    padding: theme.spacing(1, 2),
    paddingLeft: 0,
    display: "flex",
  },
  titleContainer: {
    marginLeft: "16px",
  },
  title: {
    fontSize: "14px",
    color: theme.typography.body1.color,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: "14px",
    color: theme.typography.subtitle2.color,
  },
  list: {
    width: "100%",
    height: "100%",
    overflow: "auto",
  },
  listOuterContainer: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  listInnerContainer: {
    height: "100%",
    width: "100%",
  },
}));

const TransferListSide = (props) => {
  const {
    title,
    items,
    checkedItems,
    idField,
    nameField,
    disabled,
    handleToggleAll,
    handleToggle,
    toggleEditing,
    render,
  } = props;
  const classes = useStyles();

  const indexedRecords = React.useMemo(() => {
    return indexReferenceDataRecords(checkedItems, idField);
  }, [checkedItems, idField]);

  const sortedRecords = React.useMemo(() => {
    return sortRecordsAlphabetically(items, nameField);
  }, [items, nameField]);

  return (
    <div className={classes.side}>
      <div className={classes.sideHeader}>
        <Checkbox
          color="primary"
          onChange={handleToggleAll}
          checked={
            checkedItems.length !== 0 && checkedItems.length === items.length
          }
          indeterminate={
            checkedItems.length !== 0 && checkedItems.length !== items.length
          }
          disabled={disabled || items.length === 0}
          inputProps={{ "aria-label": "all items selected" }}
        />
        <div className={classes.titleContainer}>
          <Typography className={classes.title}>{title}</Typography>
          <Typography
            className={classes.subTitle}
          >{`${checkedItems.length} of ${items.length} selected`}</Typography>
        </div>
      </div>
      <Divider />
      <div className={classes.listOuterContainer}>
        <div className={classes.listInnerContainer}>
          <List className={classes.list} dense component="div" role="list">
            {sortedRecords.map((value, i) => {
              const id = value[idField];
              const checked = !!indexedRecords[id];
              const name = value[nameField];
              const showDivider = i !== sortedRecords.length - 1;
              const itemHandleToggle = () => handleToggle(value);
              const itemToggleEditing = () => toggleEditing(value);

              if (render) {
                return render(value, {
                  idField,
                  nameField,
                  checked,
                  disabled,
                  showDivider,
                  handleToggle: itemHandleToggle,
                  toggleEditing: itemToggleEditing,
                });
              }

              return (
                <TransferListItem
                  key={id}
                  id={id}
                  checked={checked}
                  name={name}
                  disabled={disabled}
                  showDivider={showDivider}
                  handleToggle={itemHandleToggle}
                  toggleEditing={itemToggleEditing}
                />
              );
            })}
            <ListItem />
          </List>
        </div>
      </div>
    </div>
  );
};

export default TransferListSide;

TransferListSide.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  checkedItems: PropTypes.array.isRequired,
  idField: PropTypes.string.isRequired,
  nameField: PropTypes.string.isRequired,
  handleToggleAll: PropTypes.func.isRequired,
  handleToggle: PropTypes.func.isRequired,
  toggleEditing: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  render: PropTypes.func,
};
