import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from "prop-types";
import { isString, isArray } from "lodash";

const useStyles = makeStyles((theme) => ({
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
  },
  list: {
    padding: "0px",
  },
  listBtn: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const QuestionTableCell = (props) => {
  const { value } = props;
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const maxDefaultRendered = 3;

  if (isString(value)) {
    return (
      <Typography noWrap title={value}>
        {value}
      </Typography>
    );
  } else if (isArray(value)) {
    try {
      const nodes = [];
      const max = open ? value.length : maxDefaultRendered;
      const remaining = value.length - maxDefaultRendered;

      for (let index = 0; index < max && index < value.length; index++) {
        const item = value[index];
        nodes.push(
          <ListItem
            key={index}
            divider={index < value.length - 1}
            className={classes.listItem}
          >
            <ListItemText
              primary={item.optionText}
              primaryTypographyProps={{ noWrap: true }}
              title={item.optionText}
            />
          </ListItem>
        );
      }

      return (
        <List dense className={classes.list}>
          {nodes}
          {value.length > maxDefaultRendered && (
            <React.Fragment key="action-fragment">
              <Divider key="actions-divider" variant="inset" component="li" />
              <ListItem
                button
                className={classes.listBtn}
                key="action-btn"
                onClick={() => setOpen(!open)}
              >
                <ListItemText
                  secondary={
                    open
                      ? `Hide ${remaining} item${remaining > 1 ? "s" : ""}`
                      : `Show ${remaining} more`
                  }
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            </React.Fragment>
          )}
        </List>
      );
    } catch (error) {
      console.error(error);
      return <span>Had error</span>;
    }
  }

  return null;
};

QuestionTableCell.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

export default QuestionTableCell;
