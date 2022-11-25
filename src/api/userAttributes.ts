import { API } from "aws-amplify";
import { apiBase, getLillyIDForAPI } from "./utils";

//https://jenlvadd1m.execute-api.us-east-2.amazonaws.com/dev/rcubed/users/getcountriesbyuser?lilly_id=

const getCountryFromRoleURL = `countryowner/getcountryfromrole`;
const getCountryFromLillyIdURL = `users/getcountriesbyuser`;

interface ICountry {
  countryName: string;
  countryId: number;
}

export interface ICountryOwner {
  records: {
    countries_id: number;
    country_nm: string;
  }[];
}

//export interface ICountryOwners extends Array<ICountryOwner> {}

async function getUserCountry(groupName): Promise<ICountry | null> {
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());
  params.set("role_name", groupName);
  const apiData = await API.get(
    apiBase.apiName,
    `${getCountryFromRoleURL}?${params.toString()}`,
    {}
  );

  if (!apiData) {
    return null;
  }

  const appData = {
    countryId: apiData.countries_id,
    countryName: apiData.country_nm,
  };
  return appData;
}

async function getUserCountriesList() {
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());
  const results: ICountryOwner = await API.get(
    apiBase.apiName,
    `${getCountryFromLillyIdURL}?${params.toString()}`,
    {}
  );

  return results.records || [];
}

export default class UserAttributesAPI {
  static getUserCountry = getUserCountry;
  static getUserCountriesList = getUserCountriesList;
}
