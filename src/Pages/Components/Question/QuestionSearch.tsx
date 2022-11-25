import React, { useEffect, useState } from "react";
import { Box, IconButton, Paper, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import LoadStateAndError from "../../ReusableComponents/LoadStateAndError";
import MultiSelectDropdown from "../../ReusableComponents/form/MultiSelectDropdown";
import ButtonInput from "../../ReusableComponents/form/ButtonInput";
import TextInput from "../../ReusableComponents/form/TextInput";
import { getActiveReferenceData } from "../../ReusableComponents/ReferenceDataComponent/utils";
import { IOption } from "../../../global/types";
import DataGridTable from "../../ReusableComponents/table/DataGridTable";
import { useNavigate } from "react-router-dom";
import ReferenceDataAPI from "../../../api/referenceData";
import { ReferenceDataConverter } from "../ReferenceData/utils";
import { LinearLoader } from "../../ReusableComponents/form/LoadingComponent";
import QuestionTemplateAPI from "../../../api/questions";
import {
  GridColDef,
  GridRenderCellParams,
  GridSelectionModel
} from "@mui/x-data-grid";
import { EditRounded } from "@mui/icons-material";
import { FlatternArray } from "./questionUtils";
import AddToFormDialog from "../../ReusableComponents/QuestionTable/AddToFormDialog";
import {
  getRequirementFormName,
  searchFormByMetadataIds,
} from "../RequirementsForm/utils";
import { wrapFnAsync } from "../../../util_funcs/awaitPromises";
import useRequirementForms from "../../hooks/useRequirementForms";

const useStyles = makeStyles((theme: Theme) => {
  return {
    horizontalRoot: {
      margin: "15px",
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
    horizontalItems: {
      display: "flex",
      justifyContent: "left",
      paddingLeft: "0px",
    }
  };
});

const defaultSelectedOptions = {
  questionText: "",
  submissionTypes: [],
  productTypes: [],
  dossierTypes: [],
  generalRequirementCategories: [],
  requirementCategories: [],
};

export const QuestionSearch = (props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [options, setOptions] = useState<any>(defaultSelectedOptions);
  const [selectedOptions, setSelectedOptions] = useState<any>(
    defaultSelectedOptions
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const [tableData, setTableData] = useState<any>([]);
  const [tableDataForFilter, setTableDataForFilter] = useState<any>([]); 
  const [tableLoader, setTableLoader] = useState(true);
  const [innerTableLoader, setInnerTableLoader] = useState(false);
  const [linearLoader, setLinearLoader] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [selectedRowData, setSelectedRowData] =
    React.useState<GridSelectionModel>([]);
  const [selectionModel, setSelectionModel] =
  React.useState<GridSelectionModel>([]);  
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState([
    {
      field: "questionText",
      sort: "asc",
    },
  ]);
  const [isFormsDialogOpen, setFormsDialogVisibility] = useState(false);
  const formsHook = useRequirementForms({ manual: true, isDraftForm: true });
  const [disable, setDisable] = useState(true);
  let lastQuesId = 0;
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
        ...options,
        dossierTypes: getActiveReferenceData(dossierList),
        productTypes: getActiveReferenceData(productTypeList),
        submissionTypes: getActiveReferenceData(submissionTypeList),
        requirementCategories: getActiveReferenceData(reqCategoryList),
        generalRequirementCategories:
          getActiveReferenceData(genReqCategoryList),
      });
    } catch (err: any) {
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

  const clearSearch = async () => {
    setSelectedOptions(defaultSelectedOptions);
  };

  const search = async (newPage: number, navigateFromPage: boolean, pageSize:number) => {
    try {
      if (navigateFromPage) {
        setInnerTableLoader(true);
        lastQuesId = newPage === page ? 0 : tableData[tableData.length-1].questionTemplateId;//this condition will work when rowPerPage select
        if(newPage < page){
          let tbld = tableDataForFilter.filter((d,i)=> d.questionTemplateId < tableData[0].questionTemplateId);
          const res = tbld.filter((val, index, arr) => index > arr.length - (pageSize) - 1);
          setPage(newPage);
          setTableData(res);
          setInnerTableLoader(false);
          return;
        }
      } else {
        setTableLoader(true);
        setLinearLoader(true);
      }
      let result: any;
      result = await QuestionTemplateAPI.searchTemplates(
        selectedOptions.questionText,
        selectedOptions,
        lastQuesId ? lastQuesId : 0,
        pageSize
      );
      const tbldata = result.data;
      setRowCount(navigateFromPage ? rowCount : result.size); //set rowCount first time if its navigate from search button not from pagination
      setTableData(tbldata);
      let d = tableDataForFilter.concat(tbldata);
      let dd = d.filter((obj:any, pos:any, arr) => {
        return arr
          .map((mapObj:any) => mapObj.questionTemplateId)
          .indexOf(obj.questionTemplateId) == pos;
      });
      setTableDataForFilter(dd);
    } catch (err: any) {
      setError(err);
    }
    setPage(newPage);
    setTableLoader(false);
    setLinearLoader(false);
    setInnerTableLoader(false);
  };

  const getSelectedRows = async (ids) => {
    setSelectionModel(ids);
    if (!ids.length) {
      setDisable(true);
      setSelectedRowData([]);
      return;
    }
    let selectedIDs = new Set(ids);
    let selectedRows = await tableDataForFilter.filter((row: any) =>
      selectedIDs.has(row.questionTemplateId)
    );
    setSelectedRowData(selectedRows);
    setDisable(false);
  };

  const removeSelectedItems = async()=>{
    setSelectionModel([]);
    setDisable(true);
    setSelectedRowData([]);
  }

  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Actions",
      renderCell: (params: GridRenderCellParams<any>) => {
        return (
          <IconButton
            color="primary"
            aria-label="Edit"
            className={classes.button}
            onClick={() => {
              const questionId = params.row.questionTemplateId;
              navigate(`/questionbuilder/${encodeURIComponent(questionId)}`);
            }}
            size="small"
          >
            <EditRounded className={classes.icon} />
          </IconButton>
        );
      },
    },
    { field: "questionText", headerName: "Question Text", flex: 1 },
    { field: "questionTypeName", headerName: "Answer Type", flex: 1 },
    {
      field: "submissionTypes",
      headerName: "Submission Type",
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => (
        <FlatternArray dataArr={params.row.submissionTypes} />
      ),
    },
    {
      field: "productTypes",
      headerName: "Product Type",
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => (
        <FlatternArray dataArr={params.row.productTypes} />
      ),
    },
    {
      field: "dossierTypes",
      headerName: "Dossier",
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => (
        <FlatternArray dataArr={params.row.dossierTypes} />
      ),
    },
    {
      field: "requirementCategories",
      headerName: "Requirement Category",
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => (
        <FlatternArray dataArr={params.row.requirementCategories} />
      ),
    },
    {
      field: "generalRequirementCategories",
      headerName: "General Requirement Category",
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => (
        <FlatternArray dataArr={params.row.generalRequirementCategories} />
      ),
    },
  ];

  const onCloseFormsDialog = () => {
    setFormsDialogVisibility(false);
  };

  const onOpenFormsDialog = () => {
    setFormsDialogVisibility(true);
  };

  /**
   * from questions search, selected questions get filtered by whether they exist on either a published form, a draft form or do not exist on any form.
   * @param incomingFormsArr is used to store brand new forms created from questions
   * @param inputExistingDraftFormsList is a check to make sure we are not saving a duplicate of a form
   */
  const onSaveQuestionsToForms = React.useCallback(
    async (
      incomingFormsArr,
      inputExistingDraftFormsList,
      inputExistingPublishedFormsList
    ) => {
      // Filter inactive forms
      const activeIncomingForms = incomingFormsArr.filter((form) => {
        return form.isActive;
      });

      if (activeIncomingForms.length === 0) {
        return;
      }

      const saveFormsPromises: any = [];
      activeIncomingForms.forEach((inputForm) => {
        const formName = inputForm.formName;
        const savedDraftForm = searchFormByMetadataIds(
          inputExistingDraftFormsList,
          {
            submissionTypeId: inputForm.submissionType?.optionId,
            productTypeId: inputForm.productType?.optionId,
            dossierTypeId: inputForm.dossierType?.optionId,
          }
        );

        const savedPublishedForm = searchFormByMetadataIds(
          inputExistingPublishedFormsList,
          {
            submissionTypeId: inputForm.submissionType?.optionId,
            productTypeId: inputForm.productType?.optionId,
            dossierTypeId: inputForm.dossierType?.optionId,
          }
        );

        // Add form, it does not exist yet
        if (!inputForm.formExists) {
          const activeQuestions = inputForm.questions
            .filter((item) => item.isActive && !item.questionExists)
            .map((item) => item.question);

          let questions = activeQuestions.map((question, questionIndex) => {
            return {
              formItemId: 0,
              questionTemplateId: question["questionTemplateId"],
              index: questionIndex,
              formId: 0,
              parentId: null,
              logic: {},
              isActive: true,
              isCurrent: true,
            };
          });

          if (savedPublishedForm) {
            questions = savedPublishedForm.questions.concat(questions);
          }

          const newForm = {
            ...inputForm,
            formName,
            questions,
            formId: 0,
            submissionType: inputForm.submissionType.optionId,
            submissionTypeName: inputForm.submissionType.optionText,
            isActive: true,
            productType: inputForm.productType ? inputForm.productType : null,
            dossierType: inputForm.dossierType ? inputForm.dossierType : null,
          };

          const promise = wrapFnAsync(() => formsHook.addForm(newForm), {
            formName,
          });

          saveFormsPromises.push(promise);
          return;
        }

        // Begin process form update (adding new questions to an existing form)
        const newQuestions = inputForm.questions
          .filter((item) => item.isActive && !item.questionExists)
          .map((item) => item.question);

        if (newQuestions.length === 0) {
          return;
        }

        const existingQuestionsCount = savedDraftForm.questions.length;
        newQuestions.forEach((question, questionIndex) => {
          savedDraftForm.questions.push({
            formItemId: 0,
            questionTemplateId: question["questionTemplateId"],
            index: existingQuestionsCount + questionIndex,
            formId: savedDraftForm.formId,
            parentId: 0,
            logic: {},
            isActive: true,
            isCurrent: true,
          });
        });

        // Next, update form if lacking some of it's information.
        // This is not a necessary step for adding questions for forms
        // but we found some forms, even though having the product, submission,
        // or dossier type in their names, were lacking the information in their
        // returned full data, so we take this opportunity to sync the data.
        if (inputForm.productType && !savedDraftForm.productType) {
          savedDraftForm.productType = {
            optionId: inputForm.productType.optionId,
            optionText: inputForm.productType.optionText,
          };
        }

        if (inputForm.dossierType && !savedDraftForm.dossierType) {
          savedDraftForm.dossierType = {
            optionId: inputForm.dossierType.optionId,
            optionText: inputForm.dossierType.optionText,
          };
        }

        if (savedDraftForm.submissionTypeName.toLowerCase() !== "general") {
          savedDraftForm.formName = getRequirementFormName(
            savedDraftForm.submissionTypeName,
            savedDraftForm.productType?.optionText,
            savedDraftForm.dossierType?.optionText
          );
        }

        const updateFormPromise: any = wrapFnAsync(
          (): any => {
            formsHook.updateForm(savedDraftForm);
          },
          { formName }
        );
        saveFormsPromises.push(updateFormPromise as any);
      });

      const result = await Promise.all(saveFormsPromises);
      return result;
    },
    []
  );

  if (loading || error) {
    return (
      <div style={{ marginTop: "20px" }}>
        <LoadStateAndError
          loading={loading}
          loadingMessage="Loading options..."
          error={error?.message}
          reloadFunc={getData}
        />
      </div>
    );
  }

  return (
    <>
      {isFormsDialogOpen && (
        <AddToFormDialog
          open={isFormsDialogOpen}
          questions={selectedRowData}
          handleClose={onCloseFormsDialog}
          handleSave={onSaveQuestionsToForms}
        />
      )}
      {/* Search filter */}
      <Typography
        component="h2"
        variant="inherit"
        sx={{
          color: "#1e96f2",
          margin: 2,
          textAlign: "left",
        }}
      >
        Question Search
      </Typography>

      <Paper
        elevation={0}
        variant="outlined"
        className={classes.horizontalRoot}
      >
        <div className={classes.horizontalItems}>
          {/* Question text input */}
          <div style={{ marginTop: 16 }}>
            <TextInput
              label="Question text"
              placeholder="Search by question text"
              value={selectedOptions.questionText}
              onChange={(value) => setFormOptions(value, "questionText")}
            />
          </div>

          {/* Submission type */}
          <MultiSelectDropdown
            label="Submission type"
            options={options.submissionTypes}
            value={selectedOptions.submissionTypes}
            getOptionLabel={(option: IOption) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            onChange={(value) => setFormOptions(value, "submissionTypes")}
          />

          {/* Product type */}
          <MultiSelectDropdown
            label="Product type"
            options={options.productTypes}
            value={selectedOptions.productTypes}
            getOptionLabel={(option: IOption) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            //limitTags={1}
            onChange={(value) => setFormOptions(value, "productTypes")}
          />
        </div>

        <div className={classes.horizontalItems}>
          {/* Dossier section */}
          <MultiSelectDropdown
            label="Dossier section"
            options={options.dossierTypes}
            value={selectedOptions.dossierTypes}
            getOptionLabel={(option: IOption) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            //limitTags={1}
            onChange={(value) => setFormOptions(value, "dossierTypes")}
          />

          {/* Requirement category */}
          <MultiSelectDropdown
            label="Requirement category"
            options={options.requirementCategories}
            value={selectedOptions.requirementCategories}
            getOptionLabel={(option: IOption) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            //limitTags={1}
            onChange={(value) => setFormOptions(value, "requirementCategories")}
          />

          {/* General Requirement Category*/}
          <MultiSelectDropdown
            label="General Requirement Category"
            options={options.generalRequirementCategories}
            value={selectedOptions.generalRequirementCategories}
            getOptionLabel={(option: IOption) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            //limitTags={1}
            onChange={(value) =>
              setFormOptions(value, "generalRequirementCategories")
            }
          />
        </div>

        {/* Buttons */}
        <div className={classes.horizontalItems}>
          {/* Search button */}
          <ButtonInput
            text="Search"
            disabled={false}
            variant="contained"
            color="primary"
            onClick={() => {
              removeSelectedItems();
              search(1, false, pageSize);
            }}
          />

          {/* Clear button */}
          <ButtonInput
            text="Remove filters"
            disabled={false}
            variant="contained"
            color="inherit"
            onClick={clearSearch}
          />
        </div>
      </Paper>

      {/* Dynamic table */}

      {linearLoader ? (
        <Box sx={{ width: "100%" }}>
          <LinearLoader variant="indeterminate" />
        </Box>
      ) : (
        " "
      )}

      {!tableLoader && (
        <div>
          <ButtonInput
            text="Add selected to Form"
            disabled={disable}
            variant="contained"
            color="primary"
            onClick={onOpenFormsDialog}
          />
          <p style={{ marginLeft: 12 }}>
            {selectedRowData.length == 1
              ? "1 question selected"
              : selectedRowData.length > 1
              ? selectedRowData.length + " questions selected"
              : ""}
              { selectedRowData.length ? <button style={{ marginLeft:12, cursor:'pointer' }} onClick={removeSelectedItems}>Uncheck all</button> : '' }
          </p>
        </div>
      )}

      {!tableLoader && (
        <Paper
          elevation={0}
          variant="outlined"
          className={classes.horizontalRoot}
        >
          <DataGridTable
            loading={innerTableLoader}
            columns={columns}
            rows={tableData}
            page={page - 1}
            onPageSizeChange={(pSize) => {
              setPageSize(pSize);
              removeSelectedItems();
              search(1, true, pSize);//reset page to 1
            }}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            pageSize={pageSize}
            getRowHeight={()=> 'auto'}
            getRowId={(row) => row.questionTemplateId}
            paginationMode="server"
            rowCount={rowCount}
            onPageChange={(newPage) => {
              search(newPage+1, true, pageSize);
            }}
            checkboxSelection={true}
            onSelectionModelChange={getSelectedRows}
            selectionModel={selectionModel}
            keepNonExistentRowsSelected={true}
            sortModel={sortModel}
            onSortModelChange={(model) => setSortModel(model)}
          />
        </Paper>
      )}
    </>
  );
};