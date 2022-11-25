import { AddRounded } from "@mui/icons-material";
import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import PropTypes from "prop-types";
import React from "react";
import {
  removeDuplicateWhitespace
} from "../../../util_funcs/reusables";
import DialogBox from "../../ReusableComponents/Dialog";
import TextInput from "../../ReusableComponents/form/TextInput";
import {
  kOptionIdField,
  kOptionNameField
} from "../../ReusableComponents/QuestionTable/utils";
import TransferList from "../../ReusableComponents/ReferenceDataComponent/TransferList";
import {
  findItem
} from "../../ReusableComponents/ReferenceDataComponent/utils";
import RegionListItem from "./RegionListItem";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      padding: "16px",
    },
    actionsContainer: {
      padding: "8px 0px",
    },
    listContainer: { display: "flex", flex: 1, overflow: "hidden" },
  };
});

export const defaultErrorMessages = {
  regionName: { toggle: false, message: '' }
};

const RegionsList = (props) => {
  const {
    regions,
    countries,
    disabled,
    inactiveCountries,
    onSaveRegion,
    handleUpdateCountry,
    handleUpdateRegions,
    getData,
  } = props;

  const classes = useStyles();
  const [editedRegion, setEditedRegion] = React.useState(null);
  const [regionName, setRegionName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogTriggerButtonText, setDialogTriggerButtonText] = React.useState("Save");
  const [errorMessages, setErrorMessages] = React.useState(defaultErrorMessages);

  const onCloseForm = () => {
    setEditedRegion(null);
  };

  const onAddNewRegion = () => {
    setEditedRegion({ optionText: "", isActive: true });
  };

  const onEditExistingRegion = (id) => {
    const region = findItem(regions, id, kOptionIdField);
    setEditedRegion(region);
    setRegionName(region.optionText)
    setIsDialogOpen(true)
  };

  const onSaveForm = async () => {
    const compactName = removeDuplicateWhitespace(regionName);

    if (!compactName) {
      setErrorMessages({ ...defaultErrorMessages, regionName: { toggle: true, message: "Region Name is required." } });
      setIsDialogOpen(true);
      return;
    }

    const existingItemIndex = existingRegionNames.indexOf(
      compactName.toLowerCase()
    );

    if (existingItemIndex !== -1) {
      setErrorMessages({ ...defaultErrorMessages, regionName: { toggle: true, message: "Name exists." } });
      setIsDialogOpen(true);
      return;
    }

    if (editedRegion) {
      setDialogTriggerButtonText("Submitting");
      await onSaveRegion(editedRegion, { optionText: regionName }, true);
      await getData(true);
      onCloseForm();
      setIsDialogOpen(false);
      setRegionName("");
      setErrorMessages({ ...defaultErrorMessages, regionName: { toggle: false, message: "" } });
      setDialogTriggerButtonText("Save");
      return;
    }
  };

  const getExistingRegionNames = React.useCallback(
    (excludeItem) => {
      return regions
        .filter((item) => {
          return excludeItem.optionId
            ? excludeItem.optionId !== item.optionId
            : true;
        })
        .map((item) => item.optionText.toLowerCase());
    },
    [regions]
  );

  const existingRegionNames = React.useMemo(() => {
    return editedRegion ? getExistingRegionNames(editedRegion) : [];
  }, [editedRegion, getExistingRegionNames]);

  return (
    <div className={classes.root}>
      <Typography variant="h2" ml={1}>
        Regions
      </Typography>
      <DialogBox
        dialogTriggerButtonTitle="Add Region"
        dialogTriggerButtonIcon={<AddRounded />}
        dialogTitle="Region Name"
        isDialogOpen={isDialogOpen}
        dialogTriggerButtonText={dialogTriggerButtonText}
        handleClose={onCloseForm}
        handleSave={onSaveForm}
        handleDialogTriggerButtonAction={onAddNewRegion}
        dialogTriggerButtonToggleHandler={setIsDialogOpen}
      >
        {/* Region Name */}
        <TextInput
          label="Region Name"
          placeholder="Region Name"
          required={true}
          value={regionName}
          onChange={(value) => { setRegionName(value) }
          }
          error={errorMessages.regionName.toggle}
          helperText={errorMessages.regionName.message}
        />
      </DialogBox>
      <div className={classes.listContainer}>
        <TransferList
          disabled={disabled}
          handleUpdateRecords={handleUpdateRegions}
          idField={kOptionIdField}
          nameField={kOptionNameField}
          records={regions}
          toggleEditing={setEditedRegion}
          render={(region, transferProps) => (
            <RegionListItem
              key={region.optionId}
              countries={countries}
              handleUpdateCountry={handleUpdateCountry}
              inactiveCountries={inactiveCountries}
              onEdit={onEditExistingRegion}
              region={region}
              regions={regions}
              showDivider={transferProps.showDivider}
              checked={transferProps.checked}
              disabled={transferProps.disabled}
              handleToggle={transferProps.handleToggle}
            />
          )}
        />
      </div>
    </div>
  );
};

export default RegionsList;

RegionsList.propTypes = {
  regions: PropTypes.array.isRequired,
  countries: PropTypes.array.isRequired,
  inactiveCountries: PropTypes.array.isRequired,
  onSaveRegion: PropTypes.func.isRequired,
  handleUpdateCountry: PropTypes.func.isRequired,
  handleUpdateRegions: PropTypes.func.isRequired,
  getData: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

