/**
 * string together filtering component and results component on landing page
 * start by building the filter will need to start with the API data
 */

import { getEnvironment } from "../../../global/env";
import {
  getUserCountries,
  getUserGroup,
  GenericUserGroups,
} from "../../../global/userGroups";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SessionSelectors from "../../../redux-store/session/selectors";
import SearchRadioButtons from "./SearchRadioButton";
import { SearchRadioButtonsValue } from "./SearchRadioButton";
import UnansweredCountryForm from "./UnansweredCountryForm";
import FormCopy from "./FormCopy";
import SearchRequirementForms from "./SearchRequirementForms";

const SearchLandingPage = () => {
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const tab =
    (query.get("tabs") as SearchRadioButtonsValue) ||
    SearchRadioButtonsValue.Requirement;

  const user = useSelector(SessionSelectors.getUser);
  const groups = JSON.parse(user.attributes.nickname) as string[];
  const countries = getUserCountries(groups);
  const adminGroup = getUserGroup(getEnvironment(), GenericUserGroups.Admin);
  const isAdmin = groups.includes(adminGroup);
  const canEdit = isAdmin || countries.length > 0;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(window.location.search);
    params.set("tabs", event.target.value as SearchRadioButtonsValue);
    navigate(`/search?${params.toString()}`);
  };

  let contentNode: React.ReactNode = <h2>{tab}</h2>;
  if (tab === SearchRadioButtonsValue.UnansweredForms && canEdit) {
    contentNode = <UnansweredCountryForm isUserAdmin={isAdmin} />;
  } else if (tab === SearchRadioButtonsValue.FormCopy && canEdit) {
    contentNode = <FormCopy isAdmin={isAdmin}></FormCopy>;
  } else if (tab === SearchRadioButtonsValue.Requirement) {
    contentNode = <SearchRequirementForms isAdmin={isAdmin} />;
  }

  return (
    <div>
      <SearchRadioButtons
        value={tab}
        onChange={handleChange}
        canEditForms={canEdit}
      />
      {contentNode}
    </div>
  );
};

export default SearchLandingPage;
