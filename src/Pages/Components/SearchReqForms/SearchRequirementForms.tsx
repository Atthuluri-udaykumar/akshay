import React, { useEffect, useState } from "react";
import { Box, IconButton, LinearProgress, Paper, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import LoadStateAndError from "../../ReusableComponents/LoadStateAndError";
import MultiSelectDropdown from "../../ReusableComponents/form/MultiSelectDropdown";
import ButtonInput from "../../ReusableComponents/form/ButtonInput";
import TextInput from "../../ReusableComponents/form/TextInput";
import { getActiveReferenceData } from "../../ReusableComponents/ReferenceDataComponent/utils";
import { IOption } from "../../../global/types";
import {
  IAnswerTableSearchControlsOptions,
  defaultSelectedOptions,
} from "../../Components/RequirementsForm/types";
import ReferenceDataAPI from "../../../api/referenceData";
import { ReferenceDataConverter } from "../ReferenceData/utils";
import DataGridTable from "../../ReusableComponents/table/DataGridTable";
import SearchAPI, { toSearchFinalizedAnswersParams } from "../../../api/search";
import Export from "../../ReusableComponents/Export/Export";
import {
  GridSelectionModel,
  GridRenderCellParams,
  GridColDef,
} from "@mui/x-data-grid";
import { CheckBoxInput } from "../../ReusableComponents/form/CheckBoxInput";
import { LinearLoader } from "../../ReusableComponents/form/LoadingComponent";
import { useNavigate } from "react-router-dom";
import UserAttributesAPI from "../../../api/userAttributes";
import { useRequest } from "ahooks";
import { ICountry } from "../ReferenceData/types";
import EditRounded from "@mui/icons-material/EditRounded";

const useStyles = makeStyles((theme: Theme) => {
  return {
    horizontalRoot: {
      margin: "15px",
    },
    verticalRoot: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      flex: 1,
      padding: theme.spacing(2),
    },
    horizontalItems: {
      display: "flex",
      justifyContent: "left",
      paddingLeft: "0px",
    },
    horizontalItem: {
      display: "inline-block",
      marginRight: "16px",
      marginBottom: "16px",
    },
    verticalItem: {
      marginBottom: "16px",
    },
    button: {
      border: `1px solid ${theme.palette.grey[300]}`,
      borderRadius: "50%",
      width: "30px",
      height: "30px",
    },
    icon: {
      fontSize: "16px",
    },
    searchBtnContainer: { marginTop: theme.spacing(2) },
    selectItem: { width: "240px !important" },
    btn: { marginRight: theme.spacing(2) },
  };
});

export interface IAdminProp {
  isAdmin: boolean;
}

const SearchRequirementForms = (props: IAdminProp) => {
  const { isAdmin } = props;
  const classes = useStyles();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IAnswerTableSearchControlsOptions>(
    defaultSelectedOptions
  );
  const [pageSize, setPageSize] = useState(5);
  const [selectedOptions, setSelectedOptions] =
    useState<IAnswerTableSearchControlsOptions>(defaultSelectedOptions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [selectedRowData, setSelectedRowData] =
    React.useState<GridSelectionModel>([]);
  const [checkedGeneralReq, setCheckedGeneralReq] = useState(false);
  const [editor, setEditor] = useState(false);
  const [countriesList, setCountriesList] = useState<ICountry[] | []>([]);
  const [exportData, setExportData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [linearLoader, setLinearLoader] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [editQuestion, setEditQuestion] =
    useState<IAnswerTableSearchControlsOptions>(defaultSelectedOptions);
  const [sortModel, setSortModel] = useState([
    {
      field: "Country_Name",
      sort: "asc",
    },
  ]);

  const userCountriesList = useRequest<ICountry[], []>(
    ReferenceDataAPI.getCountriesByLillyId
  );
  const userCountriesListMap = React.useMemo(() => {
    if (userCountriesList.data) {
      return userCountriesList.data.reduce((map, next) => {
        map[next.optionId] = next;
        return map;
      }, {} as Record<number, ICountry>);
    }
    return {} as Record<number, ICountry>;
  }, [userCountriesList.data]);

  console.log({ userCountriesList, userCountriesListMap, page, tableData });

  const incrementProgress = React.useCallback((p?: number) => {
    setProgress(
      p
        ? p
        : (oldProgress) => {
            if (oldProgress === 100) {
              return 0;
            }
            const diff = Math.random() * 10;
            return Math.min(oldProgress + diff, 100);
          }
    );
  }, []);

  // Load meta
  const getData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [
        dossierList,
        productTypeList,
        submissionTypeList,
        reqCategoryList,
        genReqCategoryList,
        countries,
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
        ReferenceDataAPI.getActiveCountries() as Promise<IOption[]>,
      ]);
      setOptions({
        ...options,
        dossierList: getActiveReferenceData(dossierList),
        productTypeList: getActiveReferenceData(productTypeList),
        submissionTypeList: getActiveReferenceData(submissionTypeList).filter(
          (key) => key.optionText != "General"
        ),
        reqCategoryList: getActiveReferenceData(reqCategoryList),
        genReqCategoryList: getActiveReferenceData(genReqCategoryList),
        countries,
      });
    } catch (err: any) {
      console.log(err);
      setError(err);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  /**
   *  Value is the value selected from the dropdown
   */
  const setFormOptions = async (value, inputType) => {
    setSelectedOptions({
      ...selectedOptions,
      [inputType]: value,
    });
  };

  const search = async () => {
    try {
      incrementProgress();
      setTableLoader(true);
      setLinearLoader(true);
      let result: any = null;
      if (checkedGeneralReq) {
        result = await SearchAPI.searchGeneralAnswers({
          data: toSearchFinalizedAnswersParams(selectedOptions),
        });
      } else {
        result = await SearchAPI.searchFinalizedAnswers({
          data: toSearchFinalizedAnswersParams(selectedOptions),
          currentpage: page,
        });
      }
      incrementProgress();
      setEditQuestion(result.data);
      createColumns(result);
      setTableData(result);
    } catch (err: any) {
      setError(err);
    }

    incrementProgress(100);
    setTableLoader(false);
    setLinearLoader(false);
  };
  const startLinearLoader = () => {
    if (linearLoader) {
      return <LinearLoader variant={"determinate"} value={progress} />;
    }
  };

  const createColumns = async (data) => {
    if (!data.length) {
      return;
    }
    let headerData = data[0];
    let columns: GridColDef[] = [];
    Object.keys(headerData).map((key) => {
      if (key != "unique_id" && key != "id" && key != "countries_id") {
        columns.push({
          field: key,
          headerName: key.replace("_", " "),
          flex: 1,
        });
      }
    });

    columns.push({
      field: "actions",
      headerName: "Actions",
      renderCell: (params: GridRenderCellParams<any>) => {
        const countryId = params.row.countries_id;
        const canEdit = isAdmin || !!userCountriesListMap[countryId];
        //const canEdit = !!userCountriesListMap[countryId];
        return (
          canEdit && (
            <IconButton
              color="primary"
              aria-label="Edit"
              className={classes.button}
              onClick={() => {
                const formId = params.row.id;
                navigate(
                  `/answerforms/${encodeURIComponent(
                    formId
                  )}?countryId=${encodeURIComponent(countryId)}&isFinalized`
                );
              }}
            >
              <EditRounded className={classes.icon} />
            </IconButton>
          )
        );
      },
    });
    setColumns(columns as any);
  };

  const clearSearch = async () => {
    setSelectedOptions(defaultSelectedOptions);
  };

  /**
   *to export data
   */
  const getSelectedRows = async (ids) => {
    if (!ids.length) {
      setExportData([]);
      return;
    }
    let selectedIDs = new Set(ids);
    let selectedRows = await tableData.filter((row: any) =>
      selectedIDs.has(row.unique_id.toString())
    );
    setSelectedRowData(selectedRows);

    /* set export data */
    let data: any = JSON.parse(JSON.stringify(selectedRows));
    const selectedExportData = await data.filter(
      (row: any) =>
        delete row.unique_id && delete row.id && delete row.countries_id
    );
    setExportData(selectedExportData);
  };

  const selectGeneral = async (value) => {
    setCheckedGeneralReq(value);
    if (value) clearSearch();
  };
  const checkboxText: string = "General";

  if (
    loading ||
    error ||
    userCountriesList.loading ||
    userCountriesList.error
  ) {
    return (
      <div>
        <LoadStateAndError
          loading={loading || userCountriesList.loading}
          loadingMessage="Loading options..."
          error={error?.message || userCountriesList.error?.message}
          reloadFunc={getData}
        />
      </div>
    );
  }

  return (
    <>
      {/* Search filter */}
      <Paper
        elevation={0}
        variant="outlined"
        className={classes.horizontalRoot}
      >
        <div className={classes.horizontalItems}>
          {/* Question text input */}
          <div style={{ marginTop: 16 }}>
            <TextInput
              label="Search question"
              placeholder="Search by question text"
              value={selectedOptions.questionText}
              onChange={(value) => setFormOptions(value, "questionText")}
            />
          </div>

          {/* Submission type */}
          {!checkedGeneralReq && (
            <MultiSelectDropdown
              label="Submission type"
              options={options.submissionTypeList}
              value={selectedOptions.submissionTypeList}
              getOptionLabel={(option: IOption) => option.optionText}
              isOptionEqualToValue={(option, value) =>
                option.optionId === value.optionId
              } //this function we use to suppress the warning generated by material
              onChange={(value) => setFormOptions(value, "submissionTypeList")}
            />
          )}

          {/* Product type */}
          {!checkedGeneralReq && (
            <MultiSelectDropdown
              label="Product type"
              options={options.productTypeList}
              value={selectedOptions.productTypeList}
              getOptionLabel={(option: IOption) => option.optionText}
              isOptionEqualToValue={(option, value) =>
                option.optionId === value.optionId
              } //this function we use to suppress the warning generated by material
              //limitTags={1}
              onChange={(value) => setFormOptions(value, "productTypeList")}
            />
          )}
        </div>

        <div className={classes.horizontalItems}>
          {/* Requirement category */}
          {!checkedGeneralReq && (
            <MultiSelectDropdown
              label="Requirement category"
              options={options.reqCategoryList}
              value={selectedOptions.reqCategoryList}
              getOptionLabel={(option: IOption) => option.optionText}
              isOptionEqualToValue={(option, value) =>
                option.optionId === value.optionId
              } //this function we use to suppress the warning generated by material
              //limitTags={1}
              onChange={(value) => setFormOptions(value, "reqCategoryList")}
            />
          )}

          {/* Dossier section */}
          <MultiSelectDropdown
            label="Dossier section"
            options={options.dossierList}
            value={selectedOptions.dossierList}
            getOptionLabel={(option: IOption) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            //limitTags={1}
            onChange={(value) => setFormOptions(value, "dossierList")}
          />

          {/* Country Search */}
          <MultiSelectDropdown
            label="Country Search"
            options={options.countries}
            value={selectedOptions.countries}
            getOptionLabel={(option: IOption) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            onChange={(value) => setFormOptions(value, "countries")}
          />

          {/* General Requirement Category*/}
          {checkedGeneralReq && (
            <MultiSelectDropdown
              label="General Requirement Category"
              options={options.genReqCategoryList}
              value={selectedOptions.genReqCategoryList}
              getOptionLabel={(option: IOption) => option.optionText}
              isOptionEqualToValue={(option, value) =>
                option.optionId === value.optionId
              } //this function we use to suppress the warning generated by material
              //limitTags={1}
              onChange={(value) => setFormOptions(value, "genReqCategoryList")}
            />
          )}
        </div>
        <div className={classes.horizontalItems}>
          {/* Search button */}
          <ButtonInput
            text="Search"
            disabled={false}
            variant="contained"
            color="primary"
            onClick={search}
          />

          {/* Clear button */}
          <ButtonInput
            text="Remove filters"
            disabled={false}
            variant="contained"
            color="inherit"
            onClick={clearSearch}
          />

          {/* Checkbox to select General */}
          <CheckBoxInput
            label={checkboxText}
            checked={checkedGeneralReq}
            disabled={false}
            onChange={selectGeneral}
          />
        </div>
      </Paper>

      {/* Dynamic table */}

      {startLinearLoader() ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : (
        " "
      )}
      {!tableLoader && (
        <Paper
          elevation={0}
          variant="outlined"
          className={classes.horizontalRoot}
        >
          <div
            style={{
              justifyContent: "right",
              display: "flex",
              width: "100%",
              paddingRight: 10,
            }}
            className={classes.horizontalItems}
          >
            <Export exportData={exportData} />
          </div>

          <DataGridTable
            loading={tableLoader}
            rows={tableData}
            columns={columns}
            page={page-1}
            onPageSizeChange={(newPage) => setPageSize(newPage)}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            pageSize={pageSize}
            onPageChange={(newPage) => setPage(newPage+1)}
            getRowId={(row) => row.unique_id}
            getRowHeight={() => "auto"}
            checkboxSelection={true}
            onSelectionModelChange={getSelectedRows}
            sortModel={sortModel}
            onSortModelChange={(model) => setSortModel(model)}
            paginationMode={'client'}
          />
        </Paper>
      )}
    </>
  );
};

export default SearchRequirementForms;
