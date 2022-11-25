import React from "react";
import PropTypes from "prop-types";
import makeStyles from '@mui/styles/makeStyles';
import { EditRounded, ExpandMore, ExpandLess } from "@mui/icons-material";
import {
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  List,
  ListItem,
  Checkbox,
} from "@mui/material";
import CountryListItem from "./CountryListItem";
import TransferListItem from "../../ReusableComponents/ReferenceDataComponent/TransferListItem";
import { findItem } from "../../ReusableComponents/ReferenceDataComponent/utils";
import { kOptionIdField } from "../../ReusableComponents/QuestionTable/utils";
import { IOption } from "../../../global/types";

const useStyles = makeStyles((theme) => {
  return {
    circularProgress: {
      color: "grey",
    },
    icon: {
      fontSize: "20px",
    },
    formControl: {
      width: "100%",
    },
    countryMenuItemName: {
      display: "inline-flex",
      flex: 1,
    },
    select: {
      borderBottom: "none",
    },
    contentLeftAdjust: { marginLeft: "12px" },
    summaryContainer: {
      display: "flex",
      width: "100%",
    },
    nameContainer: {
      display: "flex",
      flex: 1,
      padding: "0 16px",
      overflow: "hidden",
      alignItems: "center",
    },
    name: { fontSize: "14px" },
    listItemInnerContainer: {
      width: "100%",
    },
    listItem: { paddingLeft: 0 },
  };
});

export interface IRegionListItemProp {
  region: IOption | any;
  countries: string[] | number[];
  inactiveCountries: IOption[];
  regions: IOption[];
  onEdit: (regions: number) => void;
  handleUpdateCountry: (country: IOption, region: any) => void;
  handleToggle: () => void;
  disabled?: boolean;
  checked?: boolean;
  showDivider?: boolean;
};

const RegionListItem = (props: IRegionListItemProp) => {
  const {
    region,
    countries,
    inactiveCountries,
    regions,
    disabled,
    checked,
    showDivider,
    handleToggle,
    onEdit,
    handleUpdateCountry,
  } = props;

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [addingCountry, setAddingCountry] = React.useState(false);

  const name = region.optionText;
  const id = region.optionId;

  const internalOnAssignCountry = async (event) => {
    try {
      setAddingCountry(true);
      const countryId: number = event.target.value;
      const country = findItem(countries, countryId, kOptionIdField);

      handleUpdateCountry(country, { region: id });
    } catch (error) {}

    setAddingCountry(false);
  };

  const internalOnEdit = () => {
    onEdit(id);
  };

  const renderAddCountryControls = () => {
    if (addingCountry) {
      return (
        <CircularProgress className={classes.circularProgress} size={20} />
      );
    }

    return (
      <FormControl className={classes.formControl}>
        <InputLabel id={`${id}-add-country-label`}>Add Country</InputLabel>
        <Select
          disabled={disabled}
          labelId={`${id}-add-country-label`}
          id={`${id}-add-country-id`}
          value=""
          label="Add Country"
          onChange={internalOnAssignCountry}
          className={classes.select}
        >
          {inactiveCountries.map((country) => {
            const countryId = country.optionId;
            const countryName = country.optionText;
            return (
              <MenuItem key={country.optionId} value={countryId}>
                <Typography className={classes.countryMenuItemName}>
                  {countryName}
                </Typography>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

  const renderAccordionContent = () => {
    return (
      <React.Fragment>
        <div className={classes.contentLeftAdjust}>
          {renderAddCountryControls()}
        </div>
        <List className={classes.contentLeftAdjust}>
          {region.countries.map((country, i) => (
            <CountryListItem
              key={country.optionId}
              country={country}
              handleUpdateCountry={handleUpdateCountry}
              regions={regions}
              selectedRegion={region}
              disabled={disabled}
              showDivider={i !== region.countries.length - 1}
            />
          ))}
        </List>
      </React.Fragment>
    );
  };

  if (region.isActive) {
    const summary = (
      <div className={classes.summaryContainer}>
        <Checkbox
          disableRipple
          disableFocusRipple
          disableTouchRipple
          color="primary"
          tabIndex={-1}
          disabled={disabled}
          checked={checked}
          onChange={handleToggle}
        />
        <div className={classes.nameContainer}>
          <Typography variant="body1" className={classes.name}>
            {name}
          </Typography>
        </div>
        <div>
          <IconButton edge="end" aria-label="edit" onClick={internalOnEdit} size="large">
            <EditRounded className={classes.icon} />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="expand"
            onClick={() => setOpen(!open)}
            size="large">
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
      </div>
    );

    return (
      <ListItem
        divider={showDivider}
        role="listitem"
        className={classes.listItem}
      >
        <div className={classes.listItemInnerContainer}>
          {summary}
          {open && renderAccordionContent()}
        </div>
      </ListItem>
    );
  } else {
    return (
      <TransferListItem
        checked={checked}
        disabled={disabled}
        handleToggle={handleToggle}
        id={id}
        name={name}
        showDivider={showDivider}
        toggleEditing={internalOnEdit}
      />
    );
  }
};

export default RegionListItem;