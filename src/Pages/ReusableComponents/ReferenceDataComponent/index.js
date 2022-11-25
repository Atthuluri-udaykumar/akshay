import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import makeStyles from '@mui/styles/makeStyles';
import AddRounded from "@mui/icons-material/AddRounded";
import TransferList from "./TransferList";
import ReferenceDataFormDialog from "./ReferenceDataForm";
import { useSnackbar } from "notistack";
import LoadingComponent from "../LoadingComponent";
import LoadErrorComponent from "../LoadErrorComponent";
import { devLogError, promisifiedWait } from "../../../util_funcs/reusables";
import { getLillyIDForAPI } from "../../../api/utils";
import ReferenceDataAPI from "../../../api/referenceData";

const useStyles = makeStyles((theme) => ({
  addBtnContainer: {
    paddingBottom: "8px",
  },
  transferListContainer: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    padding: "16px",
  },
}));

const internalIdField = "optionId";
const internalNameField = "optionText";

function ReferenceDataComponent(props) {
  const {
    nameField,
    idField,
    baseUrl,
    getUrl,
    postUrl,
    putUrl,
    addButtonLabel,
    formLabel,
  } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [records, setRecords] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadItemsError, setLoaditemsError] = useState(null);
  const [updatingRecords, setUpdatingRecords] = useState(false);

  const getData = React.useCallback(
    async (softLoad) => {
      const path = baseUrl + getUrl;

      if (!softLoad) {
        setLoadingItems(true);
      }

      try {
        const result = await ReferenceDataAPI.getRefferenceData(
          path,
          idField,
          nameField
        );
        setRecords(result);
      } catch (err) {
        console.error(err);
        setLoaditemsError(err?.message || "Error loading reference data");
      }

      if (!softLoad) {
        setLoadingItems(false);
      }
    },
    [baseUrl, getUrl]
  );

  useEffect(() => {
    getData();
  }, [getData]);

  const handleSave = React.useCallback(
    async (item, updates = {}, showNotification = false) => {
      // New items won't have an id
      const isNewItem = !item[internalIdField];

      if (isNewItem) {
        const params = new URLSearchParams();

        params.set(nameField, updates[internalNameField]);
        params.set("lilly_id", getLillyIDForAPI());
        await ReferenceDataAPI.addRefferenceData(
          `${baseUrl}${postUrl}?${params.toString()}`
        );

        if (showNotification) {
          enqueueSnackbar(`Item added successfully`, {
            variant: "success",
          });
        }
      } else {
        const params = new URLSearchParams();
        const updatedItem = { ...item, ...updates };

        params.set(idField, updatedItem[internalIdField]);
        params.set(nameField, updatedItem[internalNameField]);
        params.set("active", updatedItem.isActive);
        params.set("lilly_id", getLillyIDForAPI());
        await ReferenceDataAPI.updateRefferenceData(
          `${baseUrl}${putUrl}?${params.toString()}`
        );

        if (showNotification) {
          enqueueSnackbar(`Item updated successfully`, {
            variant: "success",
          });
        }
      }
    },
    [records, baseUrl, enqueueSnackbar, idField, nameField, postUrl, putUrl]
  );

  const getExistingItemNames = React.useCallback(
    (value) => {
      return records
        .filter((item) => {
          return value[internalIdField]
            ? value[internalIdField] !== item[internalIdField]
            : true;
        })
        .map((item) => item[internalNameField].toLowerCase());
    },
    [records]
  );

  const closeForm = React.useCallback(() => {
    setEditingItem(null);
  }, []);

  const saveForm = React.useCallback(
    async (updatedName) => {
      if (editingItem) {
        await handleSave(
          editingItem,
          { [internalNameField]: updatedName },
          true
        );
        await promisifiedWait(2000);
        await getData(true);
        closeForm();
      }
    },
    [editingItem, handleSave, getData, closeForm]
  );

  const updateRecords = React.useCallback(
    async (updatedItems) => {
      if (updatedItems.length < 1) {
        return;
      }

      setUpdatingRecords(true);

      const promises = updatedItems.map(async (item) => {
        try {
          return {
            id: item[internalIdField],
            result: await handleSave(item, item, false),
          };
        } catch (error) {
          devLogError(error);
          return {
            error,
            id: item[internalIdField],
          };
        }
      });

      const succeeded = [];
      const failed = [];

      for await (const promise of promises) {
        const { id, error } = promise;

        if (error) {
          failed.push(id);
        } else {
          succeeded.push(id);
        }
      }

      await getData(true);
      setUpdatingRecords(false);

      if (succeeded.length > 0) {
        enqueueSnackbar(
          `Successfully updated ${succeeded.length} item${
            succeeded.length > 1 ? "s" : ""
          }`,
          { variant: "success" }
        );
      }

      if (failed.length > 0) {
        enqueueSnackbar(
          `Error updating ${failed.length} item${failed.length > 1 ? "s" : ""}`,
          { variant: "error" }
        );
      }
    },
    [records, handleSave, enqueueSnackbar, getData]
  );

  const existingItemNames = React.useMemo(() => {
    return editingItem ? getExistingItemNames(editingItem) : [];
  }, [editingItem, getExistingItemNames]);

  if (loadingItems) {
    return <LoadingComponent />;
  } else if (loadItemsError) {
    return <LoadErrorComponent message={loadItemsError} reloadData={getData} />;
  }

  return (
    <div className={classes.container}>
      {editingItem && (
        <ReferenceDataFormDialog
          open
          formLabel={formLabel}
          name={editingItem[internalNameField]}
          existingNames={existingItemNames}
          handleClose={closeForm}
          handleSave={saveForm}
        />
      )}
      <div className={classes.addBtnContainer}>
        <Button
          startIcon={<AddRounded />}
          onClick={() =>
            setEditingItem({ [internalNameField]: "", isActive: true })
          }
        >
          {addButtonLabel || "Add Item"}
        </Button>
      </div>
      <div className={classes.transferListContainer}>
        <TransferList
          idField={internalIdField}
          nameField={internalNameField}
          records={records}
          disabled={updatingRecords}
          handleUpdateRecords={updateRecords}
          toggleEditing={setEditingItem}
        />
      </div>
    </div>
  );
}

ReferenceDataComponent.propTypes = {
  nameField: PropTypes.string.isRequired,
  idField: PropTypes.string.isRequired,
  baseUrl: PropTypes.string.isRequired,
  getUrl: PropTypes.string.isRequired,
  postUrl: PropTypes.string.isRequired,
  putUrl: PropTypes.string.isRequired,
  addButtonLabel: PropTypes.string,
  formLabel: PropTypes.string,
};

export default ReferenceDataComponent;
