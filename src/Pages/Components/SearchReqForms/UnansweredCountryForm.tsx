import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography, Paper, Theme } from "@mui/material";
import RequirementFormsSearchOptions from "../RequirementsForm/SearchOptions";
import { useRequest } from "ahooks";
import SearchAPI, {
  ISearchFormResultItem,
  ISearchFormsValue,
  IFormCountry,
} from "../../../api/search";
import LoadStateAndError from "../../../Pages/ReusableComponents/LoadStateAndError";
import UnansweredFormTable, { IUnansweredForm } from "./UnansweredFormTable";
import ReferenceDataAPI from "../../../api/referenceData";
import { ICountry } from "../ReferenceData/types";
import UserAttributesAPI from "../../../api/userAttributes";

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: "100%",
      height: "100%",
      padding: "16px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    },
    listHeader: {
      margin: "16px 0px",
      marginBottom: "8px",
      padding: "0px 16px",
    },
    optionsContainer: {},
    paperContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      marginTop: theme.spacing(2),
    },
    textContainer: {
      padding: "16px",
    },
    loadingContainer: {
      padding: "16px",
    },
    navigation: {
      marginTop: theme.spacing(2),
    },
  };
});

interface ISearchOptionValue {
  submissionTypeId: number;
  productTypeIds?: number[];
  regionsIds?: number[];
  dossierTypeIds?: number[];
  countryIds?: number[];
}

export interface IUnansweredCountryFormProps {
  isUserAdmin: boolean;
}

const countryFormStatusMap = (
  forms: ISearchFormResultItem[],
  countriesMap: Record<number, ICountry>,
  countryIds: number[]
) => {
  const unansweredFormList: IUnansweredForm[] = [];
  let countries: ICountry[] = [];

  if (countryIds.length) {
    countries = countryIds.map((id) => countriesMap[id]);
  } else {
    countries = Object.values(countriesMap);
  }

  // map draft countries and finalized countries
  forms.forEach((form) => {
    const draftCountriesMap: Record<number, IFormCountry> = {};
    const finalizedCountriedMap: Record<number, IFormCountry> = {};
    //find all the draft forms
    if (form.drafts) {
      form.drafts.forEach((formCountry) => {
        draftCountriesMap[formCountry.countries_id] = formCountry;
      });
    }
    //find all the finalized forms
    if (form.finalized) {
      form.finalized.forEach((formCountry) => {
        finalizedCountriedMap[formCountry.countries_id] = formCountry;
      });
    }
    //find all the forms that are draft and finalized
    if (form.drafts && form.finalized) {
      form.drafts.forEach((formCountry) => {
        if (finalizedCountriedMap[formCountry.countries_id]) {
          delete finalizedCountriedMap[formCountry.countries_id];
        }
      });
    }
    //if finalized do nothing
    countries.forEach((country) => {
      if (finalizedCountriedMap[country.optionId]) {
        return;
      }
      //if draft add to the unansweredFormList and label it's status as draft
      //if not draft and not finalized label it's status as unanswered
      const unansweredForm: IUnansweredForm = {
        country,
        countryName: country.optionText,
        status: draftCountriesMap[country.optionId] ? "drafts" : "unanswered",
        ...form,
        id: `${form.formId}-${country.optionId}`,
      };

      unansweredFormList.push(unansweredForm);
    });
  });

  return unansweredFormList;
};

const UnansweredCountryForm: React.FC<IUnansweredCountryFormProps> = (
  props
) => {
  const { isUserAdmin } = props;
  const classes = useStyles();
  const [countryIds, setCountryIds] = React.useState<number[]>([]);

  const onSearch = (value: ISearchOptionValue) => {
    const options: ISearchFormsValue = { ...value, countryIds: [] };

    if (value.countryIds?.length) {
      setCountryIds(value.countryIds);
    } else {
      setCountryIds([]);
    }

    return SearchAPI.searchFormUnfinished(options);
  };

  const getActiveCountriesList = async (): Promise<ICountry[]> => {
    return ReferenceDataAPI.getActiveCountries();
  };

  const searchResult = useRequest(onSearch, { manual: true });
  const countriesResult = useRequest(getActiveCountriesList);
  const userCountriesResult = useRequest(
    UserAttributesAPI.getUserCountriesList
  );

  const sortedCountries = React.useMemo(() => {
    let specificCountries = countriesResult.data;
    if (!specificCountries || !userCountriesResult.data) {
      return [];
    }

    if (userCountriesResult.data.length === 0) {
      if (isUserAdmin) {
        return specificCountries;
      } else {
        return [];
      }
    }

    const lowerCaseUserCountryList = userCountriesResult.data.map((country) => {
      return country.countries_id;
    });

    if (!isUserAdmin) {
      specificCountries = specificCountries.filter((option) =>
        lowerCaseUserCountryList.includes(option.optionId)
      );
    } else {
      specificCountries.sort((optionOne, optionTwo) => {
        if (lowerCaseUserCountryList.includes(optionOne.optionId)) {
          return -1;
        } else if (lowerCaseUserCountryList.includes(optionTwo.optionId)) {
          return 1;
        } else {
          return 0;
        }
      });
    }

    return specificCountries;
  }, [countriesResult.data, userCountriesResult.data]);

  const sortedCountriesMap = React.useMemo(() => {
    const map = {};
    sortedCountries.forEach((option) => {
      map[option.optionId] = option;
    });
    return map;
  }, [sortedCountries]);

  const unansweredForms = React.useMemo(() => {
    if (!searchResult.data) {
      return [];
    }

    return countryFormStatusMap(
      searchResult.data,
      sortedCountriesMap,
      countryIds
    );
  }, [searchResult.data, sortedCountriesMap, countryIds]);

  let contentNode: React.ReactNode = null;
  const componentLoading =
    searchResult.loading ||
    countriesResult.loading ||
    userCountriesResult.loading;
  const componentError =
    searchResult.error || countriesResult.error || userCountriesResult.error;

  if (componentLoading || componentError) {
    contentNode = (
      <div className={classes.loadingContainer}>
        <LoadStateAndError
          loading={componentLoading}
          loadingMessage="Loading..."
          error={componentError?.message}
        />
      </div>
    );
  } else if (searchResult.data?.length === 0) {
    contentNode = (
      <Typography variant="body1" className={classes.textContainer}>
        No unanswered forms found.
      </Typography>
    );
  } else if (searchResult.data) {
    contentNode = <UnansweredFormTable formsList={unansweredForms} />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.optionsContainer}>
        <RequirementFormsSearchOptions
          isVertical={false}
          disabled={searchResult.loading}
          onSearch={searchResult.run}
          showRegion={isUserAdmin}
          showCountries={true}
          countries={sortedCountries}
        />
      </div>
      <div className={classes.paperContainer}>
        <Paper>
          <Typography
            variant="h6"
            component="div"
            className={classes.listHeader}
          >
            Unanswered Forms
          </Typography>
          {contentNode}
        </Paper>
      </div>
    </div>
  );
};
export default UnansweredCountryForm;
