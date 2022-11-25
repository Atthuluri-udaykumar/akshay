import React from "react";
import { Typography, Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import LoadErrorComponent from "../../ReusableComponents/LoadErrorComponent";
import LoadingComponent from "../../ReusableComponents/LoadingComponent";
import FormPreview from "./FormPreview";
import DeleteDraftFormDialog from "./DeleteDraftFormDialog";
import PublishDraftFormDialog, {
  PublishFormDecision,
} from "./PublishDraftFormDialog";
import { IForm, IFormItem } from "./types";
import { ITask } from "../Tasks/types";
import RequirementFormBaseControls from "./RequirementFormBaseControls";
import RequirementFormQuestionList from "./RequirementFormQuestionList";
import { diffForms } from "./newUtils";
import { noop } from "lodash";

const useStyles = makeStyles(() => {
  return {
    container: {
      padding: "16px",
      overflow: "auto",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
    },
    formName: { marginBottom: "16px" },
    secondAndOtherBtns: { marginLeft: "16px" },
    btnWithMgRight: { marginRight: "16px" },
    previewContainer: {
      margin: "24px 0px",
      flex: 1,
      display: "flex",
      width: "100%",
    },
    saveContainer: {
      margin: "16px 0px",
      display: "flex",
    },
  };
});

export interface IRequirementFormBaseProps {
  form?: IForm;
  publishedFormItems?: IFormItem[]; // passed only for diffing
  initialized?: boolean;
  isDeleting?: boolean;
  draftFormTask?: ITask;
  formDisabled?: boolean;
  loading?: boolean;
  isSaving?: boolean;
  isPublishing?: boolean;
  isCreatingTask?: boolean;
  isCompletingReview?: boolean;
  error?: Error;
  isDraftForm?: boolean;
  disableDeleteForm?: boolean;
  handleOnUpdateGoto: (
    formItem: IFormItem,
    optionId: number,
    destQuestionId: number
  ) => void;
  onChangeOrder: (formItem: IFormItem, up: boolean) => void;
  getForm: () => void;
  onEditForm: () => void;
  onSaveForm: () => void;
  onPublishForm: () => void;
  onCreateTask: () => void;
  onDeleteDraftForm: () => void;
  onCompleteReview: () => void;
}

const RequirementFormBase: React.FC<IRequirementFormBaseProps> = (props) => {
  const {
    form,
    publishedFormItems,
    initialized,
    formDisabled,
    loading,
    isSaving,
    isPublishing,
    error,
    handleOnUpdateGoto,
    onChangeOrder,
    getForm,
    onPublishForm,
    onCreateTask,
    onDeleteDraftForm,
  } = props;

  const classes = useStyles();
  const [showPreview, setShowPreview] = React.useState(false);
  const [showDeleteFormDialog, setDeleteFormDialogVisibility] =
    React.useState(false);
  const [showPublishFormDialog, setPublishFormDialogVisibility] =
    React.useState(false);

  const closeDeleteFormDialog = React.useCallback(() => {
    setDeleteFormDialogVisibility(false);
  }, []);

  const closePublishFormDialog = React.useCallback(() => {
    setPublishFormDialogVisibility(false);
  }, []);

  const handlePublishFormDecision = React.useCallback(
    (decision) => {
      closePublishFormDialog();

      if (decision === PublishFormDecision.CreateTask) {
        onCreateTask();
      } else {
        onPublishForm();
      }
    },
    [onCreateTask, onPublishForm, closePublishFormDialog]
  );

  const internalOnDeleteForm = React.useCallback(() => {
    closeDeleteFormDialog();
    onDeleteDraftForm();
  }, [onDeleteDraftForm, closeDeleteFormDialog]);

  const diffedItems = React.useMemo(() => {
    if (publishedFormItems && form) {
      return diffForms(form.questions, publishedFormItems);
    }
  }, [form, publishedFormItems]);

  const isDiff = !!diffedItems;

  if (error) {
    return (
      <LoadErrorComponent
        message={error?.message || "Error loading form"}
        reloadData={getForm}
      />
    );
  }

  if (loading || !initialized || !form) {
    return <LoadingComponent />;
  }

  let listNode: React.ReactNode = null;

  if (diffedItems) {
    listNode = !showPreview && (
      <RequirementFormQuestionList
        formDisabled
        formItemsMain={diffedItems.draftFormItems}
        formItemsSecondary={diffedItems.publishedFormItems}
        isSaving={isSaving}
        isPublishing={isPublishing}
        handleOnUpdateGoto={noop}
        onChangeOrder={noop}
      />
    );
  } else if (!showPreview) {
    listNode = (
      <RequirementFormQuestionList
        formItemsMain={form.questions}
        formDisabled={formDisabled}
        isSaving={isSaving}
        isPublishing={isPublishing}
        handleOnUpdateGoto={handleOnUpdateGoto}
        onChangeOrder={onChangeOrder}
      />
    );
  }

  const headerNode = (
    <div>
      <Typography variant="h6" component="div" className={classes.formName}>
        {form.formName}
      </Typography>
      <RequirementFormBaseControls
        {...props}
        isPreviewMode={showPreview}
        isReview={isDiff}
        setShowPreview={setShowPreview}
        setDeleteFormDialogVisibility={setDeleteFormDialogVisibility}
        setPublishFormDialogVisibility={setPublishFormDialogVisibility}
      />
    </div>
  );

  const footerNode = (
    <RequirementFormBaseControls
      {...props}
      isPreviewMode={showPreview}
      isReview={isDiff}
      setShowPreview={setShowPreview}
      setDeleteFormDialogVisibility={setDeleteFormDialogVisibility}
      setPublishFormDialogVisibility={setPublishFormDialogVisibility}
    />
  );

  const previewNode = showPreview && (
    <div className={classes.previewContainer}>
      <FormPreview
        form={form}
        type="preview_one"
        onClose={() => setShowPreview(false)}
      />
    </div>
  );

  return (
    <div className={classes.container}>
      {showDeleteFormDialog && (
        <DeleteDraftFormDialog
          open
          onClose={closeDeleteFormDialog}
          onContinue={internalOnDeleteForm}
        />
      )}
      {showPublishFormDialog && (
        <PublishDraftFormDialog
          open
          onClose={closePublishFormDialog}
          onContinue={handlePublishFormDecision}
        />
      )}
      {headerNode}
      {listNode}
      {previewNode}
      {footerNode}
    </div>
  );
};

export default RequirementFormBase;

