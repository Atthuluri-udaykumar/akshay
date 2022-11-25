import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { List, Typography, Paper } from "@mui/material";
import { Pagination } from '@mui/material';
import RequirementListFormItem from "./RequirementListFormItem";
import RequirementFormsSearchOptions from "./SearchOptions";
import useRequirementForms from "../../hooks/useRequirementForms";
import useSearchRequirementForms from "../../hooks/useSearchRequirementForms";
import LoadStateAndError from "../../ReusableComponents/LoadStateAndError";

const useStyles = makeStyles((theme) => {
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

function RequirementFormsList(props) {
  const { formsHook, searchHook, onSelectForm } = props;
  const classes = useStyles();
  const handleSearch = (options) => {
    searchHook.setFetchExtra(options, true);
  };

  //hasOptions from searchHook defined in useSearchRequirementForms
  const getPageData = () => {
    if (searchHook.hasOptions(searchHook.fetchExtra)) {
      // is search mode
      return {
        page: searchHook.page,
        totalPages: searchHook.totalPages,
        pageRows: searchHook.getPageItems(searchHook.page),
        loading: searchHook.loadingPagesMap[searchHook.page],
        error: searchHook.pageErrorsMap[searchHook.page],
        onNavigate: searchHook.onNavigate,
        reloadFunc: () => searchHook.getDataForPage(searchHook.page),
        initializing: searchHook.initializing,
        pageSize: searchHook.pageSize,
      };
    } else {
      return {
        page: formsHook.page,
        totalPages: formsHook.totalPages,
        pageRows: formsHook.getPageItems(formsHook.page),
        loading: !!formsHook.loadingPagesMap[formsHook.page],
        error: formsHook.pageErrorsMap[formsHook.page],
        onNavigate: formsHook.onNavigate,
        reloadFunc: () => formsHook.getDataForPage(formsHook.page),
        initializing: formsHook.initializing,
        pageSize: formsHook.pageSize,
      };
    }
  };

  const pageData = getPageData();
  let shouldHavePagination = true;
  let contentNode = null;

  if (pageData.loading || pageData.error) {
    contentNode = (
      <div className={classes.loadingContainer}>
        <LoadStateAndError
          loading={pageData.loading}
          loadingMessage="Loading forms..."
          error={pageData.error}
          reloadFunc={pageData.reloadFunc}
        />
      </div>
    );
  } else if (pageData.pageRows.length === 0) {
    contentNode = (
      <Typography variant="body1" className={classes.textContainer}>
        No requirement forms found.
      </Typography>
    );
  } else {
    // shouldHavePagination =
    //   pageData.totalPages > 1 || pageData.pageRows.length === pageData.pageSize;
    contentNode = (
      <List>
        {pageData.pageRows.map((form, index) => {
          return (
            <RequirementListFormItem
              key={form.formId}
              form={form}
              onClick={onSelectForm}
              showDivider={index < pageData.pageRows.length - 1}
            />
          );
        })}
      </List>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.optionsContainer}>
        <RequirementFormsSearchOptions
          isVertical={false}
          disabled={formsHook.showLoading}
          onSearch={handleSearch}
          onClearResults={searchHook.clearResults}
        />
      </div>
      <div className={classes.paperContainer}>
        <Paper>
          <Typography
            variant="h6"
            component="div"
            className={classes.listHeader}
          >
            Requirement Forms
          </Typography>
          {contentNode}
        </Paper>
        {shouldHavePagination && (
          <Pagination
            disabled={pageData.initializing}
            count={pageData.totalPages}
            variant="outlined"
            shape="rounded"
            page={pageData.page}
            className={classes.navigation}
            onChange={(evt, nextPage) => pageData.onNavigate(nextPage)}
          />
        )}
      </div>
    </div>
  );
}

RequirementFormsList.propTypes = {};

export default RequirementFormsList;
