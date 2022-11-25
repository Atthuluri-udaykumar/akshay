import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import {
  CircularProgress,
  ListItem,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
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
    select: {},
    listItem: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    name: {
      display: "flex",
      flex: 1,
    },
    selectContainer: {
      justifyContent: "flex-end",
      marginLeft: "8px",
      maxWidth: "40%",
    },
  };
});

export interface ICountryListItemProps {
  country: IOption;
  regions: IOption[];
  handleUpdateCountry: (country: IOption, region: any ) => void;
  selectedRegion?: IOption;
  disabled?: boolean;
  showDivider?: boolean;
};

const CountryListItem = (props: ICountryListItemProps) => {
  const {
    country,
    selectedRegion,
    regions,
    handleUpdateCountry,
    disabled,
    showDivider,
  } = props;

  const classes = useStyles();
  const [updatingRegion, setUpdatingRegion] = React.useState(false);

  const id = country.optionId;
  const name = country.optionText;

  const internalOnChangeRegion = async (event) => {
    try {
      setUpdatingRegion(true);
      let regionId = event.target.value;

      if (regionId === "") {
        regionId = 0;
      }

      handleUpdateCountry(country, { region: regionId });
    } catch (error) {
      // do nothing, errors should be handled in handleUpdateCountry
      setUpdatingRegion(false);
    }
  };

  const renderSelectRegion = () => {
    if (updatingRegion) {
      return (
        <CircularProgress className={classes.circularProgress} size={20} />
      );
    }

    return (
      <FormControl className={classes.formControl}>
        <Select
          disabled={disabled}
          id={`${id}-select-region-id`}
          value={selectedRegion && selectedRegion.optionId}
          onChange={internalOnChangeRegion}
          className={classes.select}
        >
          <MenuItem key="remove" value="">
            Remove
          </MenuItem>
          {regions.map((region) => {
            const regionId = region.optionId;
            const regionName = region.optionText;
            return (
              <MenuItem key={regionId} value={regionId}>
                {regionName}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

  return (
    <ListItem
      divider={showDivider}
      key={id}
      role="listitem"
      className={classes.listItem}
    >
      <div className={classes.name}>
        <Typography>{name}</Typography>
      </div>
      <div className={classes.selectContainer}>{renderSelectRegion()}</div>
    </ListItem>
  );
};

export default CountryListItem;
