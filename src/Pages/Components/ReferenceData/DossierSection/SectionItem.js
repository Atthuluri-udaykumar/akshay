import React from "react";
import { TreeItem } from "@mui/lab";
import makeStyles from '@mui/styles/makeStyles';
import { Typography, IconButton, CircularProgress } from "@mui/material";
import { EditRounded, AddRounded } from "@mui/icons-material";
import PropTypes from "prop-types";
import classnames from "classnames";
import { AntSwitch } from "../../../ReusableComponents/CustomSwitches";

const useStyles = makeStyles((theme) => {
  return {
    labelRoot: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0.5, 0),
    },
    labelSecondaryIcons: {
      marginRight: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      alignSelf: "flex-start",
    },
    labelText: {
      fontWeight: "inherit",
      flexGrow: 1,
    },
    iconBtn: {
      margin: "0 12px",
      border: `1px solid ${theme.palette.grey[300]}`,
      borderRadius: "50%",
      width: "30px",
      height: "30px",
    },
    icon: { fontSize: "18px" },
    circularProgress: {
      color: "grey",
    },
    inactiveLabelText: {
      textDecoration: "line-through",
      color: "grey",
    },
    disabledLabelText: {
      color: "grey",
    },
    toggleSwitch: {
      marginRight: "4px",
      display: "inline-flex",
    },
    treeItem: {},
  };
});

const SectionItem = (props) => {
  const { node, nodes, onEditNode, onAddChild, handleUpdateNode, disabled } =
    props;

  const classes = useStyles();
  const [isToggling, setIsToggling] = React.useState(false);

  const id = node.optionId;
  const name = node.optionText;
  const nodeHasChildren = Array.isArray(node.children);

  const onToggle = React.useCallback(
    async (evt) => {
      if (evt.stopPropagation) {
        evt.stopPropagation();
      }

      const checked = evt.target.checked;
      setIsToggling(true);
      await handleUpdateNode(node, { isActive: checked });
      setIsToggling(false);
    },
    [node, handleUpdateNode]
  );

  const defaultNodeActions = (
    <div className={classes.labelSecondaryIcons}>
      <AntSwitch
        checked={node.isActive}
        disabled={disabled}
        onChange={onToggle}
        className={classnames(classes.toggleSwitch)}
      />
      <IconButton
        disableRipple
        edge="end"
        aria-label="add child node"
        onClick={(evt) => {
          if (evt.stopPropagation) {
            evt.stopPropagation();
          }

          onAddChild(node);
        }}
        disabled={disabled || !node.isActive}
        className={classnames(classes.iconBtn)}
        size="small"
      >
        <AddRounded className={classes.icon} />
      </IconButton>
      <IconButton
        disableRipple
        edge="end"
        aria-label="edit"
        onClick={(evt) => {
          if (evt.stopPropagation) {
            evt.stopPropagation();
          }

          onEditNode(node);
        }}
        disabled={disabled || !node.isActive}
        className={classnames(classes.iconBtn)}
        size="small"
      >
        <EditRounded className={classes.icon} />
      </IconButton>
    </div>
  );

  const updatingNodeActions = (
    <div className={classes.labelSecondaryIcons}>
      <CircularProgress className={classes.circularProgress} size={20} />
    </div>
  );

  const labelNode = (
    <div className={classes.labelRoot}>
      <Typography
        variant="body1"
        className={classnames({
          [classes.labelText]: true,
          [classes.inactiveLabelText]: !node.isActive,
          [classes.disabledLabelText]: disabled,
        })}
      >
        {name}
      </Typography>
      {isToggling ? updatingNodeActions : defaultNodeActions}
    </div>
  );

  return (
    <TreeItem
      nodeId={String(id)}
      label={labelNode}
      className={classes.treeItem}
      onLabelClick={(evt) => {
        // hack for preventing toggleing when toggling the toggle switch
        if (
          evt.target &&
          evt.target.classList &&
          evt.target.classList.contains("MuiSwitch-input")
        ) {
          if (evt.preventDefault) {
            evt.preventDefault();
          }
        }
      }}
    >
      {nodeHasChildren &&
        node.children.map((childIndex) => {
          const child = nodes[childIndex];
          return (
            <SectionItem
              key={child.optionId}
              node={child}
              nodes={nodes}
              onEditNode={onEditNode}
              onAddChild={onAddChild}
              handleUpdateNode={handleUpdateNode}
              disabled={disabled || isToggling || !node.isActive}
            />
          );
        })}
    </TreeItem>
  );
};

SectionItem.propTypes = {
  node: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,
  onEditNode: PropTypes.func.isRequired,
  onAddChild: PropTypes.func.isRequired,
  handleUpdateNode: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default SectionItem;
