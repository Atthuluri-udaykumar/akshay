/**
 * 'tt.task_tracker_id,tn.task_nm,tt.TASK_CMPLT,'
      + 'tt.task_dtls,tt.task_due_date,tt.task_create_date,tt.task_accept_date,'
      + 'tt.task_complete_date, tt.task_assngn_to'

    'tf.SUB_REQ_FORMS_ID, sf.sub_req_forms_nm, tf.is_reviewed'
 */

export interface ITask {
  taskId: number;
  details: string;
  isComplete: boolean;
  dueDate: number;
  createDate: number;
  acceptDate?: number;
  completeDate?: number;
  assignedTo: number;
  formId: number;
  formName: string;
  isReviewed?: boolean;
}

/**
 * getUnacceptedDraftReviewTasks
 * 'TASK_TRACKER_ID', 'task_dtls'
 */

export interface IUnacceptedTasksShort {
  taskId: number;
  details: string;
}

/**
 * getTasksForUser
 * task_tracker_id
 */

export interface ITaskShort {
  taskId: number;
}
