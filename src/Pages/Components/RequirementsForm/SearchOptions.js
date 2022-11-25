import React from "react";
import { Button, Paper } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { devLogError } from "../../../util_funcs/reusables";
import MultiSelectDropdownFormItem from "./MultiSelectDropdownFormItem";
import LoadStateAndError from "../../ReusableComponents/LoadStateAndError";
import classnames from "classnames";
import PropTypes from "prop-types";
import SingleSelectFormItem from "./SingleSelectDropdownFormItem";
import ReferenceDataAPI from "../../../api/referenceData";
import { ReferenceDataConverter } from "../ReferenceData/utils";
import {
  getActiveReferenceData,
  getUniqueRecordsUsingName,
} from "../../ReusableComponents/ReferenceDataComponent/utils";
import {
  kOptionIdField,
  kOptionNameField,
} from "../../../Pages/ReusableComponents/QuestionTable/utils";

const useStyles = makeStyles((theme) => {
  return {
    horizontalRoot: { padding: theme.spacing(2) },
    verticalRoot: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      flex: 1,
      padding: theme.spacing(2),
    },
    horizontalItem: {
      display: "inline-block",
      marginRight: "16px",
      marginBottom: "16px",
    },
    verticalItem: {
      marginBottom: "16px",
    },
    searchBtnContainer: { marginTop: theme.spacing(2) },
    selectItem: { width: "240px !important" },
    btn: { marginRight: theme.spacing(2) },
  };
});

const defaultOptions = {
  submissionTypeId: "",
  productTypeIds: [],
  dossierTypeIds: [],
  regionsIds: [],
  countryIds: [],
};

const RequirementFormsSearchOptions = (props) => {
  const {
    disabled,
    isVertical,
    onSearch,
    onClearResults,
    showRegion,
    countries,
    showCountries,
  } = props;
  const classes = useStyles();

  const hasOptions = React.useCallback((options) => {
    const forSureHasOptions =
      !!options.submissionTypeId ||
      !!options.productTypeIds.length ||
      !!options.dossierTypeIds.length ||
      !!options.countryIds.length;
    return forSureHasOptions;
  }, []);

  const [options, setOptions] = React.useState(null);
  const [loadingOptions, setLoadingOptions] = React.useState(true);
  const [loadOptionsError, setLoadOptionsError] = React.useState(null);
  const [selectedOptions, setSelectedOptions] = React.useState(defaultOptions);

  const internalOnClear = () => {
    onClearResults();
    setSelectedOptions(defaultOptions);
  };

  React.useEffect(async () => {
    if (options !== null) {
      return;
    }

    setLoadingOptions(true);

    try {
      let regionsResult = [];
      let countriesResult = [];
      if (showRegion) {
        regionsResult = await ReferenceDataAPI.getRegions();
        regionsResult = getUniqueRecordsUsingName(
          regionsResult,
          kOptionIdField,
          kOptionNameField
        );
      }

      if (showCountries) {
        if (countries) {
          countriesResult = countries;
        } else {
          countriesResult = await ReferenceDataAPI.getCountries();
          countriesResult = countriesResult.filter((option) => option.isActive);
        }
      }

      setOptions({
        submissionTypes: getActiveReferenceData(
          await ReferenceDataAPI.getRefferenceData(
            ReferenceDataAPI.paths.submissionType.read,
            ReferenceDataConverter.fields.submissionType.id,
            ReferenceDataConverter.fields.submissionType.name
          )
        ),
        productTypes: getActiveReferenceData(
          await ReferenceDataAPI.getRefferenceData(
            ReferenceDataAPI.paths.productType.read,
            ReferenceDataConverter.fields.productType.id,
            ReferenceDataConverter.fields.productType.name
          )
        ),
        dossierTypes: getActiveReferenceData(
          await ReferenceDataAPI.getDossierNodes()
        ),
        regionTypes: regionsResult,
        countryTypes: countriesResult,
      });
    } catch (error) {
      devLogError(error);
      setLoadOptionsError("Error loading options");
    }

    setLoadingOptions(false);
  }, [showRegion, showCountries, countries]);

  const filterCountries = React.useMemo(() => {
    if (selectedOptions.regionsIds.length === 0) {
      return options?.countryTypes;
    }
    const map = {};
    selectedOptions.regionsIds.forEach((option) => {
      map[option] = option;
    });

    return options?.countryTypes.filter((option) => {
      return map[option.region];
    });
  }, [options, selectedOptions.regionsIds]);

  const internalOnSearch = () => {
    if (selectedOptions) {
      onSearch(selectedOptions);
    }
  };

  if (loadingOptions || loadOptionsError) {
    return (
      <LoadStateAndError
        loading={loadingOptions}
        loadingMessage="Loading options"
        error={loadOptionsError}
      />
    );
  }

  const isHorizontal = !isVertical;

  return (
    <Paper
      className={classnames({
        [classes.verticalRoot]: isVertical,
        [classes.horizontalRoot]: isHorizontal,
      })}
      elevation={0}
      variant="outlined"
    >
      <SingleSelectFormItem
        renderValueType="concat"
        disabled={disabled}
        label="Submission Type"
        value={selectedOptions.submissionTypeId}
        onChange={(data) =>
          setSelectedOptions({
            ...selectedOptions,
            submissionTypeId: data,
          })
        }
        options={options.submissionTypes}
        className={classnames(classes.selectItem, {
          [classes.verticalItem]: isVertical,
          [classes.horizontalItem]: isHorizontal,
        })}
        variant="standard"
      />
      <MultiSelectDropdownFormItem
        renderValueType="concat"
        disabled={disabled}
        label="Product Type"
        value={selectedOptions.productTypeIds}
        onChange={(data) =>
          setSelectedOptions({
            ...selectedOptions,
            productTypeIds: data,
          })
        }
        options={options.productTypes}
        className={classnames(classes.selectItem, {
          [classes.verticalItem]: isVertical,
          [classes.horizontalItem]: isHorizontal,
        })}
        variant="standard"
      />
      <MultiSelectDropdownFormItem
        renderValueType="concat"
        disabled={disabled}
        label="Dossier Section"
        value={selectedOptions.dossierTypeIds}
        onChange={(data) =>
          setSelectedOptions({
            ...selectedOptions,
            dossierTypeIds: data,
          })
        }
        options={options.dossierTypes}
        className={classnames(classes.selectItem, {
          [classes.verticalItem]: isVertical,
          [classes.horizontalItem]: isHorizontal,
        })}
        variant="standard"
      />
      {showRegion && (
        <MultiSelectDropdownFormItem
          renderValueType="concat"
          disabled={disabled}
          label="Regions"
          value={selectedOptions.regionsIds}
          onChange={(data) =>
            setSelectedOptions({
              ...selectedOptions,
              regionsIds: data,
            })
          }
          options={options.regionTypes}
          className={classnames(classes.selectItem, {
            [classes.verticalItem]: isVertical,
            [classes.horizontalItem]: isHorizontal,
          })}
          variant="standard"
        />
      )}
      {showCountries && (
        <MultiSelectDropdownFormItem
          renderValueType="concat"
          disabled={disabled}
          label="Countries"
          value={selectedOptions.countryIds}
          onChange={(data) =>
            setSelectedOptions({
              ...selectedOptions,
              countryIds: data,
            })
          }
          options={filterCountries}
          className={classnames(classes.selectItem, {
            [classes.verticalItem]: isVertical,
            [classes.horizontalItem]: isHorizontal,
          })}
          variant="standard"
        />
      )}
      <div className={classnames(classes.searchBtnContainer)}>
        <Button
          disableElevation
          disabled={disabled || !hasOptions(selectedOptions)}
          variant="contained"
          color="primary"
          onClick={internalOnSearch}
          size="small"
          className={classes.btn}
        >
          Search
        </Button>
        {onClearResults && (
          <Button
            disableElevation
            variant="outlined"
            disabled={disabled || !hasOptions(selectedOptions)}
            onClick={internalOnClear}
            size="small"
            type="button"
          >
            Clear
          </Button>
        )}
      </div>
    </Paper>
  );
};

RequirementFormsSearchOptions.defaultProps = {
  isVertical: true,
};

RequirementFormsSearchOptions.propTypes = {
  disabled: PropTypes.bool,
  isVertical: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  onClearResults: PropTypes.func,
  showRegion: PropTypes.bool,
  showCountries: PropTypes.bool,
  countries: PropTypes.array,
};


RequirementFormsSearchOptions.defaultOptions = defaultOptions;

export default RequirementFormsSearchOptions;
