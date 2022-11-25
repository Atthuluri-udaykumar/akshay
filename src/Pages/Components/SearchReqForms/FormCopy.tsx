import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Button,
  CircularProgress,
  Paper,
  Theme,
  TextField,
  Autocomplete,
} from "@mui/material";
import ReferenceDataAPI from "../../../api/referenceData";
import { ICountry } from "../ReferenceData/types";
import LoadStateAndError from "../../../Pages/ReusableComponents/LoadStateAndError";
import RequirementFormsAPI from "../../../api/forms";
import SearchAPI, {
  IAPIAnswerFormAnswerDataItem,
  IOriginalAnswerFormData,
} from "../../../api/search";
import useConfirmationPrompt from "../../hooks/useConfirmationPrompt";
import useRequest from "ahooks/lib/useRequest";
import { IOption } from "../../../global/types";
import { useNavigate } from "react-router-dom";
import SingleSelectDropdown from "../../ReusableComponents/form/SingleSelectDropdown";
import MultiSelectDropdown from "../../ReusableComponents/form/MultiSelectDropdown";
import ButtonInput from "../../ReusableComponents/form/ButtonInput";

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
    searchBtnContainer: { marginTop: theme.spacing(2) },
    selectItem: { width: "240px !important" },
    btn: { marginRight: theme.spacing(2) },
  };
});

interface formType {
  country_id: number;
  country_nm: string;
  optionId: string;
  optionText: string;
}

const FormCopy = ({ isAdmin }) => {
  const navigate = useNavigate();
  const { confirm } = useConfirmationPrompt();
  const classes = useStyles();

  const [loading, setLoading] = useState(true);
  //forms
  const [formLoader, setFormLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [forms, setForm] = useState<formType[] | []>([]);
  const [formValue, setFormVal] = useState<formType | null>(null);
  //countries
  const [sourceCountryValue, setSourceCountry] = useState<ICountry | null>(
    null
  );
  const [targetCountriesValue, setTargetCountriesVal] = useState<
    ICountry[] | []
  >([]);
  const [sourceCountries, setSourceCountries] = useState<ICountry[] | []>([]);
  const [targetCountries, setTargetCountries] = useState<ICountry[] | []>([]); //country list dropdown (not used)
  const [manageTargetCountries, setManageTargetCountries] = useState<
    ICountry[] | []
  >([]); //for managing target countries list (add/remove)
  const [error, setError] = useState<any>(null);
  const [targetCountryLoader, setTargetCountryLoader] = useState(false);
  const [finalizedAnswers, setFinalizedAnswers] = useState<
    IAPIAnswerFormAnswerDataItem[]
  >([]);
  // region
  const regions = useRequest<IOption[], any[]>(ReferenceDataAPI.getRegions);
  const [targetRegionsValue, setTargetRegionsValue] = useState<IOption[]>([]);

  useEffect(() => {
    const getSourceAndTargetCountries = async () => {
      //get source countries
      const scountries: ICountry[] =
        await ReferenceDataAPI.getAllActiveCountries();
      setSourceCountries(scountries);

      /*
            get target countries
            set target countries based on role
          */
      const tcountries: ICountry[] = isAdmin
        ? scountries
        : await ReferenceDataAPI.getCountriesByLillyId();
      setTargetCountries(tcountries);
      setManageTargetCountries(tcountries);
      //set loading to false
      setLoading(false);
    };
    getSourceAndTargetCountries();
  }, []);

  const getAllFinalizedFormsForCountry = async (
    country_id
  ): Promise<formType[]> => {
    return RequirementFormsAPI.getFinalizedFormsForCountry(country_id);
  };

  const selectSourceCountry = async (value) => {
    setTargetCountryLoader(true);
    setTargetCountriesVal([]);
    if(!value) setSourceCountry(null);
    if (value) {
      try {
        setSourceCountry(value);
        setFormLoader(true);
        const forms = await getAllFinalizedFormsForCountry(value.optionId);
        setFormLoader(false);
        setForm(forms);
        targetCountriesFilterBySourceCountry(value.optionText);
        setTargetCountryLoader(false);
        return;
      } catch (err: any) {
        setError(err);
      }
    }
    setForm([]);
    setFormVal(null);
    setTargetCountries(manageTargetCountries);
    setTargetCountryLoader(false);
  };

  //filter targetCountries from selected SourceCountry
  const targetCountriesFilterBySourceCountry = (sourceCountry) => {
    const tCountries = manageTargetCountries?.filter(
      (option) => option.optionText != sourceCountry
    );
    setTargetCountries(tCountries);
  };

  const getAllFinalizedAnswers = async (form_id, country_id): Promise<any> => {
    return SearchAPI.getFinalizedAnswers(form_id, country_id);
  };

  const selectedForm = async (value) => {
    try {
      setFormVal(value);
      setTargetCountriesVal([]);
      if (value) {
        const result: IAPIAnswerFormAnswerDataItem[] =
          await getAllFinalizedAnswers(
            value?.optionId,
            sourceCountryValue?.optionId
          );
        setFinalizedAnswers(result);
      }
    } catch (err: any) {
      setError(err);
    }
  };

  /* checking if finalize form is already exist for selected target country */
  const checkIfFormExist = async (formId, countryId): Promise<any> => {
    return await SearchAPI.checkIfFormExistForCountry(formId, countryId);
  };

  /* Calling this function when selecting target countries */
  const selectedTargetCountries = async (value) => {
    setTargetCountryLoader(true);
    if (value.length) {
      try {
        const result = formValue
          ? await checkIfFormExist(
              formValue?.optionId,
              value[value.length - 1].optionId
            )
          : false;
        if (result) {
          showDialogBox(
            `Form is already exist for selected country : ${
              value[value.length - 1].optionText
            }`,
            "info"
          ); //message and dialogType needs to pass, title can be optional
          value.splice(-1); //remove the last index country if its true(finalize form exist)
        }
      } catch (err: any) {
        setError(err);
      }
    }
    setTargetCountriesVal(value);
    setTargetCountryLoader(false);
  };

  /* 
        Saving the finalize form as a draft to target countries
      */
  const copyForm = async () => {
    const isConfirmed = await showDialogBox(
      `Are you sure you want to save your changes?`,
      "confirmation",
      "Copy form"
    );
    if (!isConfirmed) return;
    setButtonLoader(true);
    let country_array: any[] = [];
    targetCountriesValue.forEach((element) => {
      country_array.push({
        countries_id: element?.optionId,
        sub_req_forms_id: formValue?.optionId,
      });
    });

    Object.keys(finalizedAnswers).map((k) => {
      if (!finalizedAnswers[k]["form_qstn_ansr_drft_data_id"]) {
        finalizedAnswers[k]["form_qstn_ansr_drft_data_id"] = 0; //for new record, will create new when saved as draft
      }
      if (!finalizedAnswers[k]["fnl_form_qstn_ansr_data_id"]) {
        finalizedAnswers[k]["fnl_form_qstn_ansr_data_id"] = 0; //for new record, need to leave blank when not saved from finalized form
      }
      if (finalizedAnswers[k]["form_qstn_ansr_data_id"]) {
        delete finalizedAnswers[k]["form_qstn_ansr_data_id"];
      }
    });
    const apiData: IOriginalAnswerFormData = {
      records: {
        answr_data: finalizedAnswers,
        countries: country_array,
      },
    };
    updateFormAnswers(apiData);
  };

  const updateFormAnswers = async (apiData) => {
    try {
      await SearchAPI.updateFormAnswers(apiData);
      setButtonLoader(false);
      const isConfirmed = await showDialogBox(
        `Form has been copied successfully. Would you like to copy another form?`,
        "alert"
      );
      if (isConfirmed) {
        resetForm();
        return;
      }
      navigate(`/Search?tabs=unansweredForm`);
    } catch (err: any) {
      setError(err);
      setButtonLoader(false);
    }
  };
  const showDialogBox = async (
    dialogMessage: string,
    dialogType: string,
    title?: string
  ) => {
    return await confirm(dialogMessage, dialogType, title ? title : ""); //message and dialogType needs to pass, title can be optional
  };

  const resetForm = async () => {
    setSourceCountry(null);
    setForm([]);
    setFormVal(null);
    setTargetCountries(manageTargetCountries);
    setTargetCountriesVal([]);
  };

  const filteredCountries = React.useMemo(() => {
    if (targetRegionsValue.length === 0) {
      return targetCountries;
    }

    return targetCountries.filter((country) => {
      return !!targetRegionsValue.find(
        (region) => region.optionId === country.region
      );
    });
  }, [targetCountries, targetRegionsValue]);

  if (loading || error) {
    return (
      <div>
        <LoadStateAndError
          loading={loading}
          loadingMessage="Loading copy forms..."
          error={error?.message}
        />
      </div>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        variant="outlined"
        className={classes.horizontalRoot}
      >
        <div className={classes.horizontalItems}>
          {/* country autocomplete dropdown */}
          <SingleSelectDropdown
            options={sourceCountries}
            label="Select source country"
            value={sourceCountryValue}
            getOptionLabel={(option) => option.optionText}
            isOptionEqualToValue={(option, value) => option.optionId === value.optionId}
            onChange={selectSourceCountry}
          />

          {/* forms autocomplete dropdown */}
          <SingleSelectDropdown
            label="Select form"
            loading={formLoader}
            options={forms}
            value={formValue}
            getOptionLabel={(option: formType) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId == value.optionId
            } //this function we use to suppress the warning generated by material
            onChange={selectedForm}
          />
        </div>

        <div className={classes.horizontalItems}>
          {/* target region autocomplete dropdown */}
          {isAdmin && (
            <MultiSelectDropdown
              label="Select target regions"
              options={regions.data || []}
              value={targetRegionsValue}
              getOptionLabel={(option: IOption) => option.optionText}
              isOptionEqualToValue={(option, value) =>
                option.optionId === value.optionId
              } //this function we use to suppress the warning generated by material
              onChange={(value)=> setTargetRegionsValue(value)}
              loading={regions.loading}
            />
          )}

          {/* target country autocomplete dropdown */}
          <MultiSelectDropdown
            label="Select target countries"
            options={filteredCountries || []}
            value={targetCountriesValue}
            getOptionLabel={(option: ICountry) => option.optionText}
            isOptionEqualToValue={(option, value) =>
              option.optionId === value.optionId
            } //this function we use to suppress the warning generated by material
            loading={targetCountryLoader}
            onChange={selectedTargetCountries}
          />
        </div>

        <div className={classes.horizontalItems}>
          <ButtonInput
            variant="contained"
            color="primary"
            disabled={
              !buttonLoader &&
              targetCountriesValue &&
              targetCountriesValue.length &&
              forms?.length &&
              sourceCountryValue
                ? false
                : true
            }
            loading={buttonLoader}
            text='Copy Form'
            onClick={copyForm}
          />
        </div>
      </Paper>
    </>
  );
};

export default FormCopy;
