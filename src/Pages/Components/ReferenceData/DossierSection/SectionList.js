import React, { useState, useEffect } from "react";
import { TreeView } from "@mui/lab";
import makeStyles from '@mui/styles/makeStyles';
import { Button } from "@mui/material";
import {
  ChevronRightOutlined,
  ExpandMore,
  AddRounded,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { isNewReferenceData } from "../../../ReusableComponents/ReferenceDataComponent/utils";
import LoadingComponent from "../../../ReusableComponents/LoadingComponent";
import LoadErrorComponent from "../../../ReusableComponents/LoadErrorComponent";
import { buildDossierTree, getNewNodeIndex } from "./utils";
import SectionItem from "./SectionItem";
import ReferenceDataFormDialog from "../../../ReusableComponents/ReferenceDataComponent/ReferenceDataForm";
import {
  kOptionIdField,
  kOptionNameField,
} from "../../../ReusableComponents/QuestionTable/utils";
import ReferenceDataAPI from "../../../../api/referenceData";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    },
    actionsContainer: {
      padding: "16px",
    },
    listContainer: {
      display: "flex",
      flex: 1,
      overflowY: "auto",
      padding: "16px",
      paddingTop: "0px",
    },
    treeView: { width: "100%" },
  };
});

function SectionsList(props) {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const [data, setData] = useState({
    rootNodes: [],
    nodes: [],
  });

  const { rootNodes, nodes } = data;

  const [loadingItems, setLoadingItems] = useState(true);
  const [loadItemsError, setLoaditemsError] = useState(null);
  const [editedNode, setEditedNode] = React.useState(null);

  const getData = React.useCallback(async (softLoad = false) => {
    if (!softLoad) {
      setLoadingItems(true);
    }

    try {
      const result = await ReferenceDataAPI.getDossierNodes();
      const processedResult = buildDossierTree(result);
      setData(processedResult);
    } catch (err) {
      setLoaditemsError(err?.message || "Error loading data");
    }

    if (!softLoad) {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleSaveNode = React.useCallback(
    async (node, updates = {}, showNotification = true) => {
      const isNewNode = isNewReferenceData(node, kOptionIdField);
      node = { ...node, ...updates };

      try {
        if (isNewNode) {
          await ReferenceDataAPI.addDossierListNode(
            node.parentId || 0,
            node.optionText,
            node.isActive
          );

          if (showNotification) {
            enqueueSnackbar(`${node.optionText} - added successfully`, {
              variant: "success",
            });
          }
        } else {
          if (updates.isActive === false && node.children.length > 0) {
            try {
              const promises = node.children
                .filter((childNodeIndex) => {
                  const childNode = nodes[childNodeIndex];
                  return childNode.isActive;
                })
                .map((childNodeIndex) => {
                  const childNode = nodes[childNodeIndex];
                  return handleSaveNode(childNode, { isActive: false }, false);
                });

              const childrenUpdateResult = await Promise.all(promises);
              const successfulCount = childrenUpdateResult.filter(
                (item) => item
              ).length;

              const failedCount = childrenUpdateResult.length - successfulCount;

              if (successfulCount > 0) {
                enqueueSnackbar(
                  `Successfully updated ${successfulCount} children nodes`,
                  {
                    variant: "success",
                  }
                );
              }

              if (failedCount > 0) {
                enqueueSnackbar(
                  `Error updating ${failedCount} children nodes`,
                  {
                    variant: "error",
                  }
                );
              }
            } catch (error) {
              enqueueSnackbar(
                `${node.optionText} - Error updating some of the children nodes`,
                {
                  variant: "error",
                }
              );

              return false;
            }
          }

          await ReferenceDataAPI.updateDossierNode(
            node.optionId,
            node.parentId || 0,
            node.isActive,
            node.optionText
          );

          if (showNotification) {
            enqueueSnackbar(`${node.optionText} - updated successfully`, {
              variant: "success",
            });
          }
        }

        return true;
      } catch (error) {
        if (showNotification) {
          const message =
            error?.message || `Error updating node - ${node.optionText}`;

          enqueueSnackbar(message, {
            variant: "error",
          });
        }

        return false;
      }
    },
    [nodes, enqueueSnackbar]
  );

  const getExistingNodeNames = React.useCallback(
    (excludeItem) => {
      return nodes
        .filter((item) => {
          return excludeItem[kOptionIdField]
            ? excludeItem[kOptionIdField] !== item[kOptionIdField]
            : true;
        })
        .map((item) => {
          return item[kOptionNameField].toLowerCase();
        });
    },
    [nodes]
  );

  const existingNodeNames = React.useMemo(() => {
    return editedNode ? getExistingNodeNames(editedNode) : [];
  }, [editedNode, getExistingNodeNames]);

  const onCloseForm = () => {
    setEditedNode(null);
  };

  const onAddNewNode = (parent) => {
    const newNode = { [kOptionIdField]: "" };

    if (parent) {
      newNode.parentId = parent.optionId;
      newNode.parentPath = `${parent.parentPath}.${parent.optionId}`;
      newNode.isActive = parent.isActive;

      const newNodePrefix = getNewNodeIndex(
        parent,
        parent.children.map((index) => nodes[index])
      );

      newNode.optionText = `${newNodePrefix} `;
    } else {
      newNode.parentId = 0;
      newNode.parentPath = "root";
      newNode.isActive = true;

      const newNodeIndex = getNewNodeIndex(
        null,
        rootNodes.map((index) => nodes[index])
      );

      const newNodePrefix = newNodeIndex
        ? `Module ${newNodeIndex} `
        : "Module 1 ";

      newNode.optionText = newNodePrefix;
    }

    setEditedNode(newNode);
  };

  const onEditExistingNode = (node) => {
    setEditedNode(node);
  };

  const onSaveForm = async (name) => {
    if (editedNode) {
      const successful = await handleSaveNode(
        editedNode,
        { [kOptionNameField]: name },
        true
      );

      if (successful) {
        await getData(true);
        onCloseForm();
      }
    }
  };

  const onUpdateNode = async (...args) => {
    await handleSaveNode(...args);
    await getData(true);
  };

  if (loadingItems) {
    return <LoadingComponent />;
  } else if (loadItemsError) {
    return <LoadErrorComponent message={loadItemsError} reloadData={getData} />;
  }

  return (
    <div className={classes.root}>
      {editedNode && (
        <ReferenceDataFormDialog
          open
          formLabel="Dossier Section"
          name={editedNode[kOptionNameField]}
          existingNames={existingNodeNames}
          handleClose={onCloseForm}
          handleSave={onSaveForm}
          isNewItem={isNewReferenceData(editedNode, kOptionIdField)}
        />
      )}
      <div className={classes.actionsContainer}>
        <Button startIcon={<AddRounded />} onClick={() => onAddNewNode()}>
          Add Dossier Section
        </Button>
      </div>
      <div className={classes.listContainer}>
        <TreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpandIcon={<ChevronRightOutlined />}
          className={classes.treeView}
        >
          {rootNodes.map((rootNodeIndex) => {
            const node = nodes[rootNodeIndex];
            return (
              <SectionItem
                key={node.optionId}
                node={node}
                nodes={nodes}
                handleUpdateNode={onUpdateNode}
                onAddChild={onAddNewNode}
                onEditNode={onEditExistingNode}
              />
            );
          })}
        </TreeView>
      </div>
    </div>
  );
}

SectionsList.propTypes = {};

export default SectionsList;
