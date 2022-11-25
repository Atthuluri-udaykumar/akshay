import React from "react";
import { Grid, Typography, Chip } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from "prop-types";
import { isEmptyString } from "../../../util_funcs/reusables";

function shouldRender(list = []) {
  return list.length > 0;
}

const removeEmptyOptions = (items = []) => {
  return items.filter((item) => !isEmptyString(item.optionText));
};

const useStyles = makeStyles((theme) => {
  return {
    typeHeader: {},
    chipsContainer: {
      display: "flex",
      flexWrap: "wrap",
      "& > *": {
        margin: theme.spacing(0.5),
        maxWidth: `calc(100% - calc(${theme.spacing(0.5)} * 2))`,
        // maxWidth: "100%",
      },
    },
  };
});

const QuestionDetails = (props) => {
  const { question } = props;
  const classes = useStyles();

  const answerType = question.questionTypeName;
  const submissionTypes = removeEmptyOptions(question.submissionTypes);
  const productTypes = removeEmptyOptions(question.productTypes);
  const requirementCategories = removeEmptyOptions(
    question.requirementCategories
  );
  const dossier = removeEmptyOptions(question.dossierTypes);
  const generalRequirementCategories = removeEmptyOptions(
    question.generalRequirementCategories
  );

  // const joinNames = (items) =>
  //   items
  //     .map((item) => item.optionText)
  //     .filter((name) => !isEmptyString(name))
  //     .join(",");

  const renderChips = (items) => (
    <div className={classes.chipsContainer}>
      {items.map((item) => {
        const text = item.optionText;
        return (
          <Chip key={item.optionId} label={text} title={text} size="small" />
        );
      })}
    </div>
  );

  // const submissionTypesData = joinNames(submissionTypes);
  // const productTypesData = joinNames(productTypes);
  // const requirementCategoriesData = joinNames(requirementCategories);
  // const dossierData = joinNames(dossier);
  // const generalRequirementCategoriesData = joinNames(
  //   generalRequirementCategories
  // );

  const answerTypeNode = answerType && (
    <Grid item key="answerType" xs={4}>
      <Typography variant="subtitle2" className={classes.typeHeader}>
        Answer type
      </Typography>
      <div className={classes.chipsContainer}>
        <Chip
          key={answerType}
          label={answerType}
          title={answerType}
          size="small"
        />
      </div>
    </Grid>
  );

  const productTypeNode = shouldRender(productTypes) && (
    <Grid item key="productType" xs={4}>
      <Typography variant="subtitle2" className={classes.typeHeader}>
        Product types
      </Typography>
      {renderChips(productTypes)}
    </Grid>
  );

  const submissionTypeNode = shouldRender(submissionTypes) && (
    <Grid item key="submissionType" xs={4}>
      <Typography variant="subtitle2" className={classes.typeHeader}>
        Submission types
      </Typography>
      {renderChips(submissionTypes)}
    </Grid>
  );

  const requirementCatNode = shouldRender(requirementCategories) && (
    <Grid item key="requirementCategory" xs={4}>
      <Typography variant="subtitle2" className={classes.typeHeader}>
        Requirement categories
      </Typography>
      {renderChips(requirementCategories)}
    </Grid>
  );

  const dossierNode = shouldRender(dossier) && (
    <Grid item key="dossier" xs={4}>
      <Typography variant="subtitle2" className={classes.typeHeader}>
        Dossier
      </Typography>
      {renderChips(dossier)}
    </Grid>
  );

  const generalRequirementCatNode = shouldRender(
    generalRequirementCategories
  ) && (
    <Grid item key="generalRequirementCategory" xs={4}>
      <Typography variant="subtitle2" className={classes.typeHeader}>
        General Requirement Category
      </Typography>
      {renderChips(generalRequirementCategories)}
    </Grid>
  );

  return (
    <Grid container spacing={2}>
      {answerTypeNode}
      {productTypeNode}
      {submissionTypeNode}
      {requirementCatNode}
      {dossierNode}
      {generalRequirementCatNode}
    </Grid>
  );
};

QuestionDetails.propTypes = {
  question: PropTypes.object.isRequired,
};

export default QuestionDetails;
