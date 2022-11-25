import { API } from "aws-amplify";
import awsconfig from "./aws-config";

const apiName = awsconfig.api.endpoints[0].name;

export async function listAuditData() {
  try {
    var result = await API.get(apiName, `audit/loggedactions`);
  } catch (error) {
    var result = error;
  }
  return result;
}

export async function auditDataRange(startDate, endDate) {
  try {
    var result = await API.get(
      apiName,
      `audit/getauditrange?startdate=${startDate}&enddate=${endDate}`
    );
  } catch (error) {
    console.log("Error", error);
    var result = error;
  }
  return result;
}

export async function listAllUsers() {
  const result = await API.get(apiName, `users/getallactiveusers`);
  return result;
}

//if user has admin id they can delete user from db
//need to get user id from lilly id
//then call delete user api
//delete the key 

export async function deactivateUser(selectedUser) {
  const params = new URLSearchParams();
  params.set("lilly_id", selectedUser);
  await API.get(apiName, `users/deleteuser?${params.toString()}`);
}

export async function userData(userAttributes) {
  const path = `users/userdata`;
  var objGroup = userAttributes.nickname.split(",");
  //console.log("Lilly ID", userAttributes.preferred_username);
  var rolesArray = [];
  Object.keys(objGroup).forEach((obj) => {
    var roleDictionary = {
      ["roleName"]:
        objGroup[obj].includes("[") === true
          ? objGroup[obj].replace("[", "").replace(/"/g, "")
          : objGroup[obj].includes("]") === true
          ? objGroup[obj].replace("]", "").replace(/"/g, "")
          : objGroup[obj].replace(/"/g, ""),
    };
    rolesArray.push(roleDictionary);
  });
  //console.log("rolesArray", rolesArray);
  const sendUserData = {
    body: {
      user: JSON.stringify({
        user: {
          ["lilly_id"]: userAttributes.preferred_username,
          ["user_nm"]: userAttributes.name,
          ["email"]: userAttributes.email,
          ["is_active"]: "true",
          ["roles"]: rolesArray,
          //["roles"]: [{"roleName":"rcubed_admin"},{"roleName":"rcubed_user"}]
        },
      }),
    },
  };
  return await API.post(apiName, path, sendUserData);
}
