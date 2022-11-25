/**
 * @fileoverview
 * Project: RCubed
 * Authors: Ara Lena
 * File: ReusableTable > QuestionViewContainer.js
 * Description: Tables view for Question Templates
 */

import * as React from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import AddToFormDialog from "./AddToFormDialog";
import {
  getRequirementFormName,
  searchFormByMetadataIds,
} from "../../Components/RequirementsForm/utils";
import { wrapFnAsync } from "../../../util_funcs/awaitPromises";
import QuestionsView from "./QuestionsView";
import useQuestionTemplates from "../../hooks/useQuestionTemplates";
import { questionTableColumnFields } from "./columns";
import useRequirementForms from "../../hooks/useRequirementForms";
import useSearchQuestionTemplates from "../../hooks/useSearchQuestionTemplates";
import { noop } from "lodash";
import usePagination from "../../hooks/usePagination";
import LoadingSnackbarContent from "../utils/LoadingSnackbarContent";

const GENERAL_SUBMISSION_TYPE = "general";

export default function QuestionsViewContainer(props) {
  const navigate = useNavigate();
  const [selectedQuestionIds, setSelectedQuestionIds] = React.useState([]);
  const [isFormsDialogOpen, setFormsDialogVisibility] = React.useState(false);
  const questionsHook = useQuestionTemplates();
  const formsHook = useRequirementForms({ manual: true, isDraftForm: true });
  const searchHook = useSearchQuestionTemplates();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [questionsRefreshKey, setQuestionsRefereshKey] = React.useState();

  React.useEffect(() => {
    if (questionsHook.isLoading && questionsHook.isSoftLoad) {
      if (!questionsRefreshKey) {
        const key = enqueueSnackbar(
          <LoadingSnackbarContent message="Refreshing questions..." />,
          {
            variant: "default",
            persist: true,
          }
        );

        setQuestionsRefereshKey(key);
        return () => {
          // close notification if we leave the page
          closeSnackbar(key);
        };
      }
    } else {
      if (questionsRefreshKey) {
        closeSnackbar(questionsRefreshKey);
      }
    }
  }, [questionsHook.isLoading, questionsHook.isSoftLoad, questionsRefreshKey]);

  const defaultPagination = usePagination({
    data: questionsHook.questions,
    defaultPageSize: 5,
  });

  const getPageData = () => {
    if (searchHook.hasOptions(searchHook.fetchExtra)) {
      // is search mode

      return {
        page: searchHook.page,
        totalPages: searchHook.totalPages,
        total: searchHook.total,
        pageRows: searchHook.getPageItems(searchHook.page),
        loading: searchHook.loadingPagesMap[searchHook.page],
        error: searchHook.pageErrorsMap[searchHook.page],
        disableHeader: true,
        onNavigate: searchHook.onNavigate,
        reloadFunc: () => searchHook.getDataForPage(searchHook.page),
      };
    } else {
      return {
        page: defaultPagination.page,
        totalPages: defaultPagination.totalPages,
        total: defaultPagination.total,
        pageRows: defaultPagination.getPageItems(defaultPagination.page),
        loading: false,
        error: "",
        disableHeader: false,
        onNavigate: defaultPagination.onNavigate,
        reloadFunc: noop,
      };
    }
  };

  const checkedRowsMap = React.useMemo(() => {
    return selectedQuestionIds.reduce((map, id) => {
      map[id] = true;
      return map;
    }, {});
  }, [selectedQuestionIds]);

  const selectedQuestions = React.useMemo(() => {
    // Using reduce here and getting the values later instead of just filtering
    // cause I've observed that the same question can occur more than once causing
    // a bug in the add to forms section

    // TODO: using fetched questions not search when in search mode to serve
    // selected questions. May be a possible source of bugs.
    const selectedItemsMap = questionsHook.questions.reduce(
      (selectedMap, item) => {
        const checked =
          checkedRowsMap[item[questionTableColumnFields.questionId]];

        if (checked) {
          selectedMap[item[questionTableColumnFields.questionId]] = item;
        }

        return selectedMap;
      },
      {}
    );

    return Object.values(selectedItemsMap);
  }, [questionsHook.questions, checkedRowsMap]);

  const onCheck = React.useCallback(
    (id) => {
      const newSelected = [...selectedQuestionIds];
      const i = newSelected.indexOf(id);

      if (i !== -1) {
        newSelected.splice(i, 1);
      } else {
        newSelected.push(id);
      }

      setSelectedQuestionIds(newSelected);
    },
    [selectedQuestionIds]
  );

  const onCheckAll = React.useCallback(() => {
    // NOTICE: Currently only works when the user is not searching.
    // Search works with pagination, that means we don't have all the questions
    // in memory. We track selected questions by saving their ID, and since we
    // don't have the questions in memory yet, we can't save their ID, meaning,
    // we can't select them.
    if (questionsHook.questions.length === 0) {
      return;
    }

    if (selectedQuestionIds.length === questionsHook.questions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(
        questionsHook.questions.map(
          (item) => item[questionTableColumnFields.questionId]
        )
      );
    }
  }, [selectedQuestionIds]);

  const onEdit = React.useCallback((id) => {
    const path = `/questionbuilder/${id}`;
    navigate(path);
  }, []);

  const onOpenFormsDialog = React.useCallback(() => {
    setFormsDialogVisibility(true);
  }, []);

  const onCloseFormsDialog = React.useCallback(() => {
    setFormsDialogVisibility(false);
  }, []);

  /**
   * from questions search, selected questions get filtered by whether they exist on either a published form, a draft form or do not exist on any form.
   * @param incomingFormsArr is used to store brand new forms created from questions
   * @param inputExistingDraftFormsList is a check to make sure we are not saving a duplicate of a form
   */
  const onSaveQuestionsToForms = React.useCallback(
    async (
      incomingFormsArr,
      inputExistingDraftFormsList,
      inputExistingPublishedFormsList
    ) => {
      // Filter inactive forms
      const activeIncomingForms = incomingFormsArr.filter((form) => {
        return form.isActive;
      });

      if (activeIncomingForms.length === 0) {
        return;
      }

      const saveFormsPromises = [];
      activeIncomingForms.forEach((inputForm) => {
        const formName = inputForm.formName;
        const savedDraftForm = searchFormByMetadataIds(
          inputExistingDraftFormsList,
          {
            submissionTypeId: inputForm.submissionType?.optionId,
            productTypeId: inputForm.productType?.optionId,
            dossierTypeId: inputForm.dossierType?.optionId,
          }
        );

        const savedPublishedForm = searchFormByMetadataIds(
          inputExistingPublishedFormsList,
          {
            submissionTypeId: inputForm.submissionType?.optionId,
            productTypeId: inputForm.productType?.optionId,
            dossierTypeId: inputForm.dossierType?.optionId,
          }
        );

        // Add form, it does not exist yet
        if (!inputForm.formExists) {
          const activeQuestions = inputForm.questions
            .filter((item) => item.isActive && !item.questionExists)
            .map((item) => item.question);

          let questions = activeQuestions.map((question, questionIndex) => {
            return {
              formItemId: 0,
              questionTemplateId:
                question[questionTableColumnFields.questionId],
              index: questionIndex,
              formId: 0,
              parentId: null,
              logic: {},
              isActive: true,
              isCurrent: true,
            };
          });

          if (savedPublishedForm) {
            questions = savedPublishedForm.questions.concat(questions);
          }

          const newForm = {
            ...inputForm,
            formName,
            questions,
            formId: 0,
            submissionType: inputForm.submissionType.optionId,
            submissionTypeName: inputForm.submissionType.optionText,
            isActive: true,
            productType: inputForm.productType ? inputForm.productType : null,
            dossierType: inputForm.dossierType ? inputForm.dossierType : null,
          };

          const promise = wrapFnAsync(() => formsHook.addForm(newForm), {
            formName,
          });

          saveFormsPromises.push(promise);
          return;
        }

        // Begin process form update (adding new questions to an existing form)
        const newQuestions = inputForm.questions
          .filter((item) => item.isActive && !item.questionExists)
          .map((item) => item.question);

        if (newQuestions.length === 0) {
          return;
        }

        const existingQuestionsCount = savedDraftForm.questions.length;
        newQuestions.forEach((question, questionIndex) => {
          savedDraftForm.questions.push({
            formItemId: 0,
            questionTemplateId: question[questionTableColumnFields.questionId],
            index: existingQuestionsCount + questionIndex,
            formId: savedDraftForm.formId,
            parentId: 0,
            logic: {},
            isActive: true,
            isCurrent: true,
          });
        });

        // Next, update form if lacking some of it's information.
        // This is not a necessary step for adding questions for forms
        // but we found some forms, even though having the product, submission,
        // or dossier type in their names, were lacking the information in their
        // returned full data, so we take this opportunity to sync the data.
        if (inputForm.productType && !savedDraftForm.productType) {
          savedDraftForm.productType = {
            optionId: inputForm.productType.optionId,
            optionText: inputForm.productType.optionText,
          };
        }

        if (inputForm.dossierType && !savedDraftForm.dossierType) {
          savedDraftForm.dossierType = {
            optionId: inputForm.dossierType.optionId,
            optionText: inputForm.dossierType.optionText,
          };
        }

        if (
          savedDraftForm.submissionTypeName.toLowerCase() !==
          GENERAL_SUBMISSION_TYPE
        ) {
          savedDraftForm.formName = getRequirementFormName(
            savedDraftForm.submissionTypeName,
            savedDraftForm.productType?.optionText,
            savedDraftForm.dossierType?.optionText
          );
        }

        const updateFormPromise = wrapFnAsync(
          () => {
            formsHook.updateForm(savedDraftForm);
          },
          { formName }
        );
        saveFormsPromises.push(updateFormPromise);
      });

      const result = await Promise.all(saveFormsPromises);
      return result;
    },
    []
  );

  const internalOnSearch = React.useCallback(
    (options) => {
      setSelectedQuestionIds([]);
      searchHook.setFetchExtra(options, true);
    },
    [searchHook]
  );

  const selectedCount = selectedQuestionIds.length;
  const isAddToFormsDisabled = selectedCount === 0;
  const headerIndeterminate =
    selectedCount > 0 && selectedCount < questionsHook.questions.length;
  const headerChecked =
    selectedCount === questionsHook.questions.length &&
    questionsHook.questions.length > 0;

  return (
    <React.Fragment>
      {isFormsDialogOpen && (
        <AddToFormDialog
          open={isFormsDialogOpen}
          questions={selectedQuestions}
          handleClose={onCloseFormsDialog}
          handleSave={onSaveQuestionsToForms}
        />
      )}
      <QuestionsView
        searchProps={{
          isVertical: false,
          disabled: searchHook.initializing,
          searching: searchHook.initializing,
          onSearch: internalOnSearch,
          onClearResults: searchHook.clearResults,
        }}
        questionsState={{
          showLoading:
            questionsHook.showLoading ||
            (!questionsHook.areItemsLoaded && !questionsHook.loadError),
          loadError: questionsHook.loadError,
        }}
        getQuestionsData={questionsHook.loadQuestions}
        controlsProps={{
          selectedCount,
          isAddToFormsDisabled,
          disabled: searchHook.initializing,
          onAddToForms: onOpenFormsDialog,
        }}
        tableProps={{
          checkedRowsMap,
          headerIndeterminate,
          headerChecked,
          onEdit,
          onCheck,
          onCheckAll,
          disabled: searchHook.initializing,
          ...getPageData(),
        }}
      />
    </React.Fragment>
  );
}
