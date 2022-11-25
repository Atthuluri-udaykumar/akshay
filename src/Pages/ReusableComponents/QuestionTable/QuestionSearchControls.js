import React from "react";
import { Button, Paper } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { useFormik } from "formik";
import { getPlural } from "../../../util_funcs/reusables";
import LoadStateAndError from "../../ReusableComponents/LoadStateAndError";
import classnames from "classnames";
import PropTypes from "prop-types";
import TextFormItem from "../../Components/RequirementsForm/TextFormItem";
import MultiSelectDropdownFormItem from "../../Components/RequirementsForm/MultiSelectDropdownFormItem";
import LoadErrorComponent from "../LoadErrorComponent";
import ReferenceDataAPI from "../../../api/referenceData";
import { ReferenceDataConverter } from "../../Components/ReferenceData/utils";
import { getActiveReferenceData } from "../ReferenceDataComponent/utils";

const useStyles = makeStyles((theme) => {
  return {
    horizontalRoot: {
      padding: theme.spacing(2),
    },
    verticalRoot: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      flex: 1,
      padding: theme.spacing(2),
    },
    horizontalItem: {
      display: "inline-block",
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    verticalItem: {
      marginBottom: theme.spacing(2),
    },
    btnContainerVertical: { marginTop: theme.spacing(3) },
    btnContainerHorizontal: {
      marginTop: theme.spacing(2),
    },
    item: { width: "240px !important" },
    btn: { marginRight: theme.spacing(2) },
    textField: { "& .MuiInputBase-root": { height: "32px" } },
  };
});

function getItemsSelected(count) {
  if (count) {
    return `${count} ${getPlural("item", count)} selected`;
  }
}

const defaultSelectedOptions = {
  questionText: "",
  submissionTypes: [],
  productTypes: [],
  dossierTypes: [],
  generalRequirementCategories: [],
  requirementCategories: [],
};

// TODO: default to horizontal and only support horizontal
const QuestionTableSearchControls = (props) => {
  const {
    disabled,
    isVertical: isVertical,
    searching,
    onSearch,
    onClearResults,
  } = props;
  const classes = useStyles();
  const internalDisabled = disabled || searching;

  const formik = useFormik({
    initialValues: defaultSelectedOptions,
    onSubmit: onSearch,
  });

  const hasSelectedOptions = React.useCallback((selectedOptions) => {
    const checkLength = (item) => item.length > 0;
    const hasOptions =
      Object.keys(selectedOptions).findIndex((item) =>
        checkLength(selectedOptions[item])
      ) !== -1;

    return hasOptions;
  }, []);

  const [options, setOptions] = React.useState(null);
  const [loadingOptions, setLoadingOptions] = React.useState(true);
  const [loadOptionsError, setLoadOptionsError] = React.useState(null);

  // Load meta
  const getData = React.useCallback(async () => {
    try {
      setLoadingOptions(true);

      const [
        dossierList,
        productTypeList,
        submissionTypeList,
        reqCategoryList,
        genReqCategoryList,
      ] = await Promise.all([
        ReferenceDataAPI.getDossierNodes(),
        ReferenceDataAPI.getRefferenceData(
          ReferenceDataAPI.paths.productType.read,
          ReferenceDataConverter.fields.productType.id,
          ReferenceDataConverter.fields.productType.name
        ),
        ReferenceDataAPI.getRefferenceData(
          ReferenceDataAPI.paths.submissionType.read,
          ReferenceDataConverter.fields.submissionType.id,
          ReferenceDataConverter.fields.submissionType.name
        ),
        ReferenceDataAPI.getRefferenceData(
          ReferenceDataAPI.paths.reqCategory.read,
          ReferenceDataConverter.fields.reqCategory.id,
          ReferenceDataConverter.fields.reqCategory.name
        ),
        ReferenceDataAPI.getRefferenceData(
          ReferenceDataAPI.paths.genReqCategory.read,
          ReferenceDataConverter.fields.genReqCategory.id,
          ReferenceDataConverter.fields.genReqCategory.name
        ),
      ]);

      setOptions({
        dossierList: getActiveReferenceData(dossierList),
        productTypeList: getActiveReferenceData(productTypeList),
        submissionTypeList: getActiveReferenceData(submissionTypeList),
        reqCategoryList: getActiveReferenceData(reqCategoryList),
        genReqCategoryList: getActiveReferenceData(genReqCategoryList),
      });
    } catch (err) {
      setLoadOptionsError(err?.message || "Error loading options");
    }

    setLoadingOptions(false);
  }, []);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const internalOnClear = () => {
    onClearResults();
    formik.setValues(defaultSelectedOptions);
  };

  if (loadingOptions || loadOptionsError) {
    return (
      <LoadStateAndError
        loading={loadingOptions}
        loadingMessage="Loading options..."
        error={loadOptionsError}
        reloadFunc={getData}
      />
    );
  }

  const isHorizontal = !isVertical;

  return (
    <form onSubmit={formik.handleSubmit}>
      <Paper
        className={classnames({
          [classes.verticalRoot]: isVertical,
          [classes.horizontalRoot]: isHorizontal,
        })}
        elevation={0}
        variant="outlined"
      >
        <div
          className={classnames(classes.item, {
            [classes.verticalItem]: isVertical,
            [classes.horizontalItem]: isHorizontal,
          })}
        >
          <TextFormItem
            disabled={internalDisabled}
            label="Question text"
            onChange={(data) => formik.setFieldValue("questionText", data)}
            value={formik.values.questionText}
            size="small"
            variant="standard"
            className={classes.textField}
            placeholder="Enter question text"
          />
        </div>
        <MultiSelectDropdownFormItem
          renderValueType="concat"
          useIdAsValue={false}
          disabled={internalDisabled}
          label="Submission type"
          value={formik.values.submissionTypes}
          onChange={(data) => {
            formik.setFieldValue("submissionTypes", data);
          }}
          options={options.submissionTypeList}
          className={classnames(classes.item, {
            [classes.verticalItem]: isVertical,
            [classes.horizontalItem]: isHorizontal,
          })}
          variant="standard"
          helperText={getItemsSelected(formik.values.submissionTypes?.length)}
        />
        <MultiSelectDropdownFormItem
          renderValueType="concat"
          useIdAsValue={false}
          disabled={internalDisabled}
          label="Product type"
          value={formik.values.productTypes}
          onChange={(data) => formik.setFieldValue("productTypes", data)}
          options={options.productTypeList}
          className={classnames(classes.item, {
            [classes.verticalItem]: isVertical,
            [classes.horizontalItem]: isHorizontal,
          })}
          helperText={getItemsSelected(formik.values.productTypes?.length)}
        />
        <MultiSelectDropdownFormItem
          renderValueType="concat"
          useIdAsValue={false}
          disabled={internalDisabled}
          label="Requirement Category"
          value={formik.values.requirementCategories}
          onChange={(data) =>
            formik.setFieldValue("requirementCategories", data)
          }
          options={options.reqCategoryList}
          className={classnames(classes.item, {
            [classes.verticalItem]: isVertical,
            [classes.horizontalItem]: isHorizontal,
          })}
          helperText={getItemsSelected(
            formik.values.requirementCategories?.length
          )}
        />
        <MultiSelectDropdownFormItem
          renderValueType="concat"
          useIdAsValue={false}
          disabled={internalDisabled}
          label="General Requirement Category"
          value={formik.values.generalRequirementCategories}
          onChange={(data) =>
            formik.setFieldValue("generalRequirementCategories", data)
          }
          options={options.genReqCategoryList}
          className={classnames(classes.item, {
            [classes.verticalItem]: isVertical,
            [classes.horizontalItem]: isHorizontal,
          })}
          helperText={getItemsSelected(
            formik.values.generalRequirementCategories?.length
          )}
        />
        <MultiSelectDropdownFormItem
          renderValueType="concat"
          useIdAsValue={false}
          disabled={internalDisabled}
          label="Dossier Section"
          value={formik.values.dossierTypes}
          onChange={(data) => formik.setFieldValue("dossierTypes", data)}
          options={options.dossierList}
          className={classnames(classes.item, {
            [classes.verticalItem]: isVertical,
            [classes.horizontalItem]: isHorizontal,
          })}
          helperText={getItemsSelected(formik.values.dossierTypes?.length)}
        />
        <div
          className={classnames({
            [classes.btnContainerVertical]: isVertical,
            [classes.btnContainerHorizontal]: isHorizontal,
          })}
        >
          <Button
            disableElevation
            disabled={internalDisabled}
            variant="contained"
            color="primary"
            size="small"
            className={classes.btn}
            type="submit"
          >
            {searching ? "Searching" : "Search"}
          </Button>
          <Button
            disableElevation
            variant="outlined"
            disabled={disabled || !hasSelectedOptions(formik.values)}
            onClick={internalOnClear}
            size="small"
            type="button"
          >
            Clear
          </Button>
        </div>
      </Paper>
    </form>
  );
};

QuestionTableSearchControls.defaultProps = {
  isVertical: true,
};

QuestionTableSearchControls.propTypes = {
  disabled: PropTypes.bool,
  isVertical: PropTypes.bool,
  searching: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  onClearResults: PropTypes.func.isRequired,
};

QuestionTableSearchControls.defaultSelectedOptions = defaultSelectedOptions;

export default QuestionTableSearchControls;
