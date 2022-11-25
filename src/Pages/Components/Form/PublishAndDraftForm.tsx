import React, { useCallback, useEffect, useState } from "react";
import { Box, Paper, Tab, Tabs, Theme, Typography } from "@mui/material";
import ReferenceDataAPI from "../../../api/referenceData";
import LoadStateAndError from "../../ReusableComponents/LoadStateAndError";
import { getActiveReferenceData } from "../../ReusableComponents/ReferenceDataComponent/utils";
import { ReferenceDataConverter } from "../ReferenceData/utils";
import makeStyles from "@mui/styles/makeStyles";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import MultiSelectDropdown from "../../ReusableComponents/form/MultiSelectDropdown";
import { IOption } from "../../../global/types";
import ButtonInput from "../../ReusableComponents/form/ButtonInput";
import RequirementFormsAPI from "../../../api/forms";
import SingleSelectDropdown from "../../ReusableComponents/form/SingleSelectDropdown";
import { LinearLoader } from "../../ReusableComponents/form/LoadingComponent";
import DataGridTable from "../../ReusableComponents/table/DataGridTable";
import { GridColDef } from "@mui/x-data-grid";
import DraftFormsAPI from "../../../api/draft";

const useStyles = makeStyles((theme: Theme) => {
    return {
      horizontalRoot: {
        margin: "15px",
      },
      horizontalItems: {
        display: "flex",
        justifyContent: "left",
        paddingLeft: "0px",
      }
    };
});

const defaultOptions = {
  submissionTypes: [],
  productTypes: [],
  dossierTypes: []
};
const defaultSelectedOptions = {
  submissionTypes: null as any,
  productTypes: [],
  dossierTypes: []
};

export const PublishAndDraftForm = (props)=>{
    const classes = useStyles();
    const navigate = useNavigate();
    const [options, setOptions] = useState<any>(defaultOptions);
    const [selectedOptions, setSelectedOptions] =
      useState<any>(defaultSelectedOptions);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [page, setPage] = useState<number>(1);
    const [tableData, setTableData] = useState([]);
    const [tableLoader, setTableLoader] = useState(true);
    const [innerTableLoader, setInnerTableLoader] = useState(false);
    const [linearLoader, setLinearLoader] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [disable, setDisable] =  useState(true);
    const [pageSize, setPageSize] = useState<number>(5);
    const [currentTab, setCurrentTab] = useState(0);
    const [searchParams] = useSearchParams()
    const toggle = searchParams.get('isDraft')
    const getData = useCallback(async () => {
        try {
        setLoading(true);
        const [
            dossierList,
            productTypeList,
            submissionTypeList
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
            )
        ]);
        setOptions({
            ...options,
            dossierTypes: getActiveReferenceData(dossierList),
            productTypes: getActiveReferenceData(productTypeList),
            submissionTypes: getActiveReferenceData(submissionTypeList)
        });
        } catch (err: any) {
        console.log(err);
        setError(err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
       toggle === 'true' ? setCurrentTab(1) : setCurrentTab(0);
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

        
        if(inputType == 'submissionTypes'){
          value ? setDisable(false) : setDisable(true);
        }
    };

    const search = async (newPage, navigateFromPage:boolean = false)=>{
        if(!selectedOptions.submissionTypes?.optionId){
          return;
        }
        const productTypeIds = selectedOptions.productTypes.map(obj=> obj.optionId);
        const dossierTypeIds = selectedOptions.dossierTypes.map(obj=> obj.optionId);
        const submissionTypeId = selectedOptions.submissionTypes?.optionId;
        setPage(newPage);
        try {
            if(navigateFromPage){
                setInnerTableLoader(true);
            }else{
                setTableLoader(true);
                setLinearLoader(true);
            }
            let form = { countryIds:[],dossierTypeIds:[], productTypeIds:[], regionsIds:[], submissionTypeId:0};
            form.productTypeIds = productTypeIds;
            form.dossierTypeIds = dossierTypeIds;
            form.submissionTypeId = submissionTypeId;
            
            /* check currentTab 
            0=> production forms
            1=> draft forms
            */
            let result: any;
            result = currentTab == 0 ? await RequirementFormsAPI.searchForms(form, newPage) : await DraftFormsAPI.searchForms(form, newPage);
            const tbldata = result.data;
            setRowCount(result.size);
            setTableData(tbldata);
        } catch (err: any) {
            setError(err);
        }
        setTableLoader(false);
        setLinearLoader(false);
        setInnerTableLoader(false);
    }

    const clearSearch = async () => {
        setSelectedOptions(defaultSelectedOptions);
        setDisable(true);
    };

    const handleTabs = (event: React.SyntheticEvent, newValue: number) => {
      setCurrentTab(newValue);
      setTableLoader(true);
    };

    const getSelectedRows = async (ids) => {
      let selectedIDs = new Set(ids);
      let selectedRows:any = await tableData.filter((row: any) =>
        selectedIDs.has(row.formId)
      );
      const formId = selectedRows[0]?.formId;
      currentTab == 0 ? navigate(`/publishedforms/${formId}`) : navigate(`/draftforms/${formId}`);
    };

    const columns: GridColDef[] = [
      { field: "formName", headerName: "Requirement forms", flex: 1 }
    ];

    if (loading || error) {
        return (
          <div style={{marginTop:'20px'}}>
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
                Form search
            </Typography>

            {/* Tabs */}
            <Tabs value={currentTab} onChange={handleTabs} aria-label="forms tabs">
              <Tab label="Production Forms" id={String(currentTab)} />
              <Tab label="Draft Forms" id={String(currentTab+1)} />
            </Tabs>

            <Paper
                elevation={0}
                variant="outlined"
                className={classes.horizontalRoot}
            >
                <div className={classes.horizontalItems}>
                    {/* Submission type */}
                    <SingleSelectDropdown
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
                </div>

                {/* Buttons */}
                <div className={classes.horizontalItems}>
                    {/* Search button */}
                    <ButtonInput
                        text="Search"
                        disabled={disable}
                        variant="contained"
                        color="primary"
                        onClick={()=>{search(1,false)}}
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
                pageSize={pageSize}
                onPageSizeChange={(newPage) => setPageSize(newPage)}
                getRowId={(row) => row.formId}
                getRowHeight={()=> 50}
                rowsPerPageOptions={[5, 10, 20]}
                paginationMode="server"
                rowCount={rowCount}
                onPageChange={(newPage) => {
                  search(newPage + 1, true);
                }}
                checkboxSelection={false}
                onSelectionModelChange={getSelectedRows}
              />
            </Paper>
          )}
        </>
      )


}