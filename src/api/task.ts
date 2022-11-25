/**
/completetask – task_id
/gettasksforuser – lilly_id
/accepttask – lilly_id, task_id
/assigntask – lilly_id, task_id, due_date
/getactivetasks
/getunassigneddraftreviewtasks
/gettask – task_id
/rejecttask – task_id
/newreviewdrafttask – drft_form_id, drft_form_nm

 * publish draft form -> create / assigntask to group (admin group)
 * to review draft before it is actually published
 * admin receives notification to review form and can accept the task
 * which will assign the task to their lilly id
 */

import { API } from "aws-amplify";
import { apiBase, getLillyIDForAPI } from "./utils";
import { ITaskShort, ITask } from "../Pages/Components/Tasks/types";
import {
  shortTaskAPIDataToAppData,
  taskAPIDataToAppData,
} from "../Pages/Components/Tasks/utils";

const baseURL = "task";
const completeTaskURL = `${baseURL}/completetask`;
const getTasksForUserURL = `${baseURL}/gettasksforuser`;
const acceptTaskURL = `${baseURL}/accepttask`;
const assignTaskURL = `${baseURL}/assigntask`;
const getActiveTasksURL = `${baseURL}/getactivetasks`;
const getUnassignedDraftReviewTasksURL = `${baseURL}/getunassigneddraftreviewtasks`;
const getTaskURL = `${baseURL}/gettask`;
const rejectTaskURL = `${baseURL}/rejecttask`;
const newReviewDraftTaskURL = `${baseURL}/newreviewdrafttask`;
const getTaskByDraftIdURL = `${baseURL}/taskbydraftid`;

async function completeTask(taskId: number) {
  const params = new URLSearchParams();
  params.set("task_id", taskId.toString());
  params.set("lilly_id", getLillyIDForAPI());
  await API.get(apiBase.apiName, `${completeTaskURL}?${params.toString()}`, {});
}

async function getTasksForUser(): Promise<ITaskShort[]> {
  const params = new URLSearchParams();
  params.set("lilly_id", getLillyIDForAPI());
  const apiData = await API.get(
    apiBase.apiName,
    `${getTasksForUserURL}?${params.toString()}`,
    {}
  );

  const appData = apiData.map((item) => shortTaskAPIDataToAppData(item));
  return appData;
}

async function acceptTask(taskId: number) {
  const params = new URLSearchParams();
  params.set("task_id", taskId.toString());
  params.set("lilly_id", getLillyIDForAPI());
  await API.post(apiBase.apiName, `${acceptTaskURL}?${params.toString()}`, {});
}

async function assignTask(taskId: number, dueDate: string) {
  const params = new URLSearchParams();
  params.set("task_id", taskId.toString());
  params.set("lilly_id", getLillyIDForAPI());
  params.set("due_date", dueDate);
  await API.post(apiBase.apiName, `${assignTaskURL}?${params.toString()}`, {});
}

async function getActiveTasks() {
  const params = new URLSearchParams();
  const apiData = await API.post(
    apiBase.apiName,
    `${getActiveTasksURL}?${params.toString()}`,
    {}
  );

  const appData = apiData.map((item) => shortTaskAPIDataToAppData(item));
  return appData;
}

async function getUnassignedDraftReviewTasks(): Promise<ITaskShort[]> {
  const params = new URLSearchParams();
  const apiData = await API.get(
    apiBase.apiName,
    `${getUnassignedDraftReviewTasksURL}?${params.toString()}`,
    {}
  );

  const appData = apiData?.records
    ? apiData.records.map((item) => shortTaskAPIDataToAppData(item))
    : [];

  return appData;
}

async function getTask(taskId: number): Promise<ITask> {
  const params = new URLSearchParams();
  params.set("task_id", taskId.toString());
  const apiData = await API.get(
    apiBase.apiName,
    `${getTaskURL}?${params.toString()}`,
    {}
  );

  const appData = taskAPIDataToAppData(apiData);
  return appData;
}

async function rejectTask(taskId: number) {
  const params = new URLSearchParams();
  params.set("task_id", taskId.toString());
  params.set("lilly_id", getLillyIDForAPI());
  await API.post(apiBase.apiName, `${rejectTaskURL}?${params.toString()}`, {});
}

async function newReviewDraftTask(draftFormId: number, draftFormName: string) {
  const params = new URLSearchParams();
  params.set("drft_form_id", draftFormId.toString());
  params.set("drft_form_nm", draftFormName);
  params.set("lilly_id", getLillyIDForAPI());
  await API.get(
    apiBase.apiName,
    `${newReviewDraftTaskURL}?${params.toString()}`,
    {}
  );
}

async function getTaskByDraftId(draftFormId: number): Promise<number> {
  const params = new URLSearchParams();
  params.set("draft_id", draftFormId.toString());
  const apiData = await API.get(
    apiBase.apiName,
    `${getTaskByDraftIdURL}?${params.toString()}`,
    {}
  );

  return apiData;
}

export default class TasksAPI {
  static completeTask = completeTask;
  static getTasksForUser = getTasksForUser;
  static acceptTask = acceptTask;
  static getUnassignedDraftReviewTasks = getUnassignedDraftReviewTasks;
  static getTask = getTask;
  static rejectTask = rejectTask;
  static newReviewDraftTask = newReviewDraftTask;
  static assignTask = assignTask;
  static getTaskByDraftId = getTaskByDraftId;
}
