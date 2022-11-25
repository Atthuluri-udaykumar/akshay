import React from "react";
import { List, ListItem, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import LabelIcon from "@mui/icons-material/LabelTwoTone";
import RequirementFormQuestionItem from "./RequirementFormQuestionItem";
import { IFormItem, IFormItemExtended } from "./types";
import cx from "classnames";
import { isNumber } from "lodash";

const chipInColoredBg = {
  "& .MuiChip-root": {
    backgroundColor: "white",
  },
};

const useStyles = makeStyles((theme: Theme) => {
  return {
    formItemNew: {
      backgroundColor: "#c8e6c9",
      ...chipInColoredBg,
    },
    formItemUpdated: { backgroundColor: "#fff9c4", ...chipInColoredBg },
    formItemDeleted: { backgroundColor: "#ffcdd2", ...chipInColoredBg },
    listItem: { paddingLeft: 0, paddingRight: 0 },
    node: {
      display: "flex",
      alignItems: "stretch",
      width: "100%",
    },
    nodeMain: {
      flex: 1,
      padding: "0px 16px",
    },
    nodeSecondary: { flex: 1, padding: "0px 16px" },
    nodeMainBorder: {
      borderRight: `1px solid ${theme.palette.grey[200]}`,
    },
    nodeSecondaryBorder: { borderLeft: `1px solid ${theme.palette.grey[200]}` },
    diffFormTitle: {
      flex: 1,
      fontSize: "0.85rem",
    },
    movedTagContainer: {
      display: "flex",
      alignItems: "center",
    },
    movedTagText: {
      marginLeft: "12px",
    },
  };
});

export interface IRequirementFormQuestionListProps {
  formItemsMain: IFormItemExtended[];
  formItemsSecondary?: IFormItemExtended[]; // passed only for diffing
  formDisabled?: boolean;
  isSaving?: boolean;
  isPublishing?: boolean;
  handleOnUpdateGoto: (
    formItem: IFormItem,
    optionId: number,
    destQuestionId: number
  ) => void;
  onChangeOrder: (formItem: IFormItem, up: boolean) => void;
}

const RequirementFormQuestionList: React.FC<
  IRequirementFormQuestionListProps
> = (props) => {
  const {
    formItemsMain,
    formItemsSecondary,
    formDisabled,
    isSaving,
    isPublishing,
    handleOnUpdateGoto,
    onChangeOrder,
  } = props;

  const classes = useStyles();
  const renderListItem = (
    formItem: IFormItemExtended,
    index: number,
    formItems: IFormItemExtended[]
  ) => {
    return (
      <RequirementFormQuestionItem
        formItem={formItem}
        handleOnUpdateGoto={(answerIndex, destQuestionId) =>
          handleOnUpdateGoto(formItem, answerIndex, destQuestionId)
        }
        onChangeOrder={(side) => onChangeOrder(formItem, side)}
        questionsCount={formItems.length}
        disabled={formDisabled || isSaving || isPublishing}
        formItems={formItems}
        questionListIndex={index}
      />
    );
  };

  const nodes: React.ReactNode[] = [];
  if (formItemsSecondary) {
    const maxLength = Math.max(formItemsMain.length, formItemsSecondary.length);
    nodes.push(
      <ListItem divider className={classes.listItem} key={"form-titles"}>
        <div className={classes.node}>
          <Typography
            gutterBottom
            variant="h6"
            className={classes.diffFormTitle}
          >
            Published Form
          </Typography>
          <Typography
            gutterBottom
            variant="h6"
            className={classes.diffFormTitle}
          >
            Draft Form
          </Typography>
        </div>
      </ListItem>
    );

    for (let i = 0; i < maxLength; i++) {
      const itemMain = formItemsMain[i]; // formItemsMain[i] is undefined if i >= formItemsMain.length (i.e. if formItemsMain is shorter than formItemsSecondary) - this is ok
      const itemSecondary = formItemsSecondary[i]; // formItemsSecondary[i] is undefined if i >= formItemsSecondary.length (i.e. if formItemsSecondary is shorter than formItemsMain) - this is ok
      const nodeMain = itemMain && renderListItem(itemMain, i, formItemsMain); // formItemsMain[i] is undefined if i >= formItemsMain.length (i.e. if formItemsMain is shorter than formItemsSecondary) - this is ok
      const nodeSecondary =
        itemSecondary && renderListItem(itemSecondary, i, formItemsSecondary); // formItemsSecondary[i] is undefined if i >= formItemsSecondary.length (i.e. if formItemsSecondary is shorter than formItemsMain) - this is ok
      const key = itemMain?.formItemId || itemSecondary?.formItemId; // if itemMain is undefined, then itemSecondary will be undefined too - this is ok

      nodes.push(
        <ListItem
          className={classes.listItem}
          key={key}
          divider={i < maxLength - 1}
        >
          <div className={classes.node}>
            <div
              className={cx(classes.nodeMain, {
                [classes.nodeMainBorder]: !!itemSecondary,
                [classes.formItemNew]: itemSecondary?.isNew,
                [classes.formItemUpdated]: itemSecondary?.isUpdated,
                [classes.formItemDeleted]: itemSecondary?.isDeleted,
              })}
            >
              {nodeSecondary}
              {isNumber(itemSecondary?.movedTo) && (
                <div className={classes.movedTagContainer}>
                  <LabelIcon />{" "}
                  <Typography
                    variant="subtitle2"
                    className={classes.movedTagText}
                  >
                    Moved to index {itemSecondary.movedTo + 1}
                  </Typography>
                </div>
              )}
            </div>
            <div
              className={cx(classes.nodeSecondary, {
                [classes.nodeSecondaryBorder]: !!itemMain,
                [classes.formItemNew]: itemMain?.isNew,
                [classes.formItemUpdated]: itemMain?.isUpdated,
                [classes.formItemDeleted]: itemMain?.isDeleted,
              })}
            >
              {nodeMain}
              {isNumber(itemMain?.movedFrom) && (
                <div className={classes.movedTagContainer}>
                  <LabelIcon />{" "}
                  <Typography
                    variant="subtitle2"
                    className={classes.movedTagText}
                  >
                    Moved from index {itemMain.movedFrom + 1}
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </ListItem>
      );
    }
  } else {
    formItemsMain.forEach((item, i) => {
      nodes.push(
        <ListItem
          key={item.formItemId}
          divider={i < formItemsMain.length - 1}
          className={cx(classes.listItem)}
        >
          {renderListItem(item, i, formItemsMain)}
        </ListItem>
      );
    });
  }

  return <List>{nodes}</List>;
};

export default RequirementFormQuestionList;
