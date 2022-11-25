import { AppEnvironment, getEnvironment, getShortAppEnvironment } from "./env";

export enum GenericUserGroups {
  Admin = "admin",
  User = "user",
}

const baseGroupName = "rcubed";

export function getUserGroup(env: AppEnvironment, group: GenericUserGroups) {
  const shortEnv = getShortAppEnvironment(env);
  return `${baseGroupName}_${group}_${shortEnv}`;
}

export function filterItemsUsingUserGroups<
  T extends { groups: GenericUserGroups[] }
>(items: Array<T>, userGroups: string[]) {
  const appEnv = getEnvironment();
  const userGroupsMap: Record<string, string> = userGroups.reduce(
    (map, group) => {
      map[group] = group;
      return map;
    },
    {}
  );
  const appMinAccessGroup = getUserGroup(appEnv, GenericUserGroups.User);

  if (!userGroupsMap[appMinAccessGroup]) {
    return [];
  }

  return items.filter((item) => {
    const groups =
      item.groups.length === 0 ? Object.values(GenericUserGroups) : item.groups;

    return groups.find((group) => {
      const constructedGroup = getUserGroup(appEnv, group);
      return userGroupsMap[constructedGroup];
    });
  });
}

export function getUserCountries(groups: string[]) {
  const countryStringArr: string[] = [];
  groups.forEach((group) => {
    const splitString = group.split("_");

    if (splitString[0] === "R3") {
      countryStringArr.push(splitString[1]);
    }
  });
  return countryStringArr;
}
