import React from "react";
import PropTypes from "prop-types";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import makeStyles from '@mui/styles/makeStyles';
import IconButton from "@mui/material/IconButton";
import TransferListSide from "./TransferListSide";

function indexOf(list, value, idField) {
  return list.findIndex((item) => {
    const id0 = item[idField];
    const id1 = value[idField];
    return id0 === id1;
  });
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  side: {
    display: "flex",
    flex: 1,
    height: "100%",
    overflow: "hidden",
  },
  controlsContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0 16px",
  },
}));

export default function TransferList(props) {
  const {
    records,
    nameField,
    idField,
    disabled,
    handleUpdateRecords,
    toggleEditing,
    render,
  } = props;

  const classes = useStyles();

  const activeItems = [];
  const inactiveItems = [];

  records.forEach((item) => {
    if (item.isActive) {
      activeItems.push(item);
    } else {
      inactiveItems.push(item);
    }
  });

  const [inactiveChecked, setInactiveChecked] = React.useState([]);
  const [activeChecked, setActiveChecked] = React.useState([]);

  const handleToggle = (list, value, setList) => {
    const currentIndex = indexOf(list, value, idField);
    const newChecked = [...list];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setList(newChecked);
  };

  const handleToggleInactive = (value) => {
    handleToggle(inactiveChecked, value, setInactiveChecked);
  };

  const handleToggleActive = (value) => {
    handleToggle(activeChecked, value, setActiveChecked);
  };

  const handleToggleAll = (list, checkedList, setCheckedList) => {
    if (list.length === checkedList.length) {
      setCheckedList([]);
    } else {
      setCheckedList(list);
    }
  };

  const handleToggleAllInactive = () => {
    handleToggleAll(inactiveItems, inactiveChecked, setInactiveChecked);
  };

  const handleToggleAllActive = () => {
    handleToggleAll(activeItems, activeChecked, setActiveChecked);
  };

  const handleMoveChecked = (checkedList, active, setCheckedList) => {
    if (checkedList.length > 0) {
      const newList = checkedList.map((item) => {
        return {
          ...item,
          isActive: active,
        };
      });

      handleUpdateRecords(newList);
      setCheckedList([]);
    }
  };

  const handleMoveCheckedInActive = () => {
    handleMoveChecked(inactiveChecked, true, setInactiveChecked);
  };

  const handleMoveCheckedActive = () => {
    handleMoveChecked(activeChecked, false, setActiveChecked);
  };

  return (
    <div className={classes.container}>
      <div className={classes.side}>
        <TransferListSide
          idField={idField}
          nameField={nameField}
          title="Inactive"
          checkedItems={inactiveChecked}
          items={inactiveItems}
          disabled={disabled}
          handleToggle={handleToggleInactive}
          handleToggleAll={handleToggleAllInactive}
          toggleEditing={toggleEditing}
          render={render}
        />
      </div>
      <div className={classes.controlsContainer}>
        <IconButton
          onClick={handleMoveCheckedInActive}
          disabled={inactiveChecked.length === 0}
          aria-label="make selected items active"
          size="large">
          <ChevronRightRounded />
        </IconButton>
        <IconButton
          onClick={handleMoveCheckedActive}
          disabled={activeChecked.length === 0}
          aria-label="make selected items inactive"
          size="large">
          <ChevronLeftRounded />
        </IconButton>
      </div>
      <div className={classes.side}>
        <TransferListSide
          idField={idField}
          nameField={nameField}
          title="Active"
          checkedItems={activeChecked}
          items={activeItems}
          disabled={disabled}
          handleToggle={handleToggleActive}
          handleToggleAll={handleToggleAllActive}
          toggleEditing={toggleEditing}
          render={render}
        />
      </div>
    </div>
  );
}

TransferList.propTypes = {
  records: PropTypes.arrayOf(PropTypes.object).isRequired,
  idField: PropTypes.string.isRequired,
  nameField: PropTypes.string.isRequired,
  handleUpdateRecords: PropTypes.func.isRequired,
  toggleEditing: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  render: PropTypes.func,
};
