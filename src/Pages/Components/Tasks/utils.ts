import assert from "assert";
import { isArray } from "lodash";
import { ITask, ITaskShort } from "./types";

/**
- records
task_accept_date: null
task_assngn_to: null
task_cmplt: false
task_complete_date: null
task_create_date: "2022-02-08T00:00:00.000Z"
task_dtls: "Review draft form Label Change - Biological/Biotech Requirements for publish"
task_due_date: null
task_tracker_id: 182

- form
drft_forms_id: 103
is_reviewed: false
sub_req_forms_nm: "Label Change - Biological/Biotech Requirements"
 */

export function taskAPIDataToAppData(apiData): ITask {
  assert(apiData, new Error("Error fetching task."));
  assert(isArray(apiData.forms), new Error("Task form data is malformed."));
  assert(apiData?.records, new Error("Task record is malformed."));
  const form = apiData.forms[0] || {}; // form is possibly undefined
  const records = apiData.records;
  return {
    taskId: records.task_tracker_id,
    details: records.task_dtls,
    isComplete: records.task_cmplt,
    dueDate: records.task_due_date,
    createDate: records.task_create_date,
    acceptDate: records.task_accept_date,
    completeDate: records.task_complete_date,
    assignedTo: records.task_assngn_to,
    formId: form.drft_forms_id,
    formName: form.sub_req_forms_nm,
    isReviewed: form.is_reviewed,
  };
}

export function shortTaskAPIDataToAppData(apiData): ITaskShort {
  return {
    taskId: apiData.task_tracker_id,
  };
}
