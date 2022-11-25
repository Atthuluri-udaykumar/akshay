import React from "react";
import {
  IconButton,
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { EditRounded } from "@mui/icons-material";
import PropTypes from "prop-types";
import QuestionDetails from "../../Components/RequirementsForm/QuestionDetails";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      paddingLeft: 0,
    },
    btn: {
      border: `1px solid ${theme.palette.grey[300]}`,
      borderRadius: "50%",
    },
    icon: {
      fontSize: "18px",
    },
    questionText: {
      wordBreak: "break-all",
    },
  };
});

const QuestionsListItem = (props) => {
  const { row, showDivider, disabled, checked, onCheck, onEdit } = props;
  const classes = useStyles();

  return (
    <ListItem
      button
      divider={showDivider}
      onClick={onCheck}
      className={classes.root}
    >
      <ListItemIcon>
        <Checkbox
          color="primary"
          checked={checked}
          tabIndex={-1}
          disabled={disabled}
          inputProps={{
            "aria-label": checked ? "Uncheck question" : "Check question",
          }}
          onChange={onCheck}
        />
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={
          <Typography className={classes.questionText}>
            row[questionTableColumnFields.questionText]
          </Typography>
        }
        secondary={<QuestionDetails question={row} />}
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          aria-label="Edit question"
          onClick={onEdit}
          className={classes.btn}
          size="large">
          <EditRounded className={classes.icon} />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

QuestionsListItem.propTypes = {
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  showDivider: PropTypes.bool,
  onCheck: PropTypes.func.isRequired,
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default QuestionsListItem;
