import React, { useEffect, useState } from 'react'
import ReferenceDataAPI from '../../../../api/referenceData'
import makeStyles from '@mui/styles/makeStyles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextInput from '../../../ReusableComponents/form/TextInput';
import TransferList from '../../../ReusableComponents/ReferenceDataComponent/TransferList';
import LoadErrorComponent from '../../../ReusableComponents/LoadErrorComponent';
import LoadingComponent from '../../../ReusableComponents/LoadingComponent';
import { useSnackbar } from "notistack";
import { devLogError, promisifiedWait } from "../../../../util_funcs/reusables";
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

export const defaultErrorMessages = {
  countryName: { toggle: false, message: '' },
  countryDisplayName: { toggle: false, message: '' },
  comment: { toggle: false, message: '' },

};

const CountryReferenceDataComponent = (props) => {
  const {
    nameField,
    idField,
    baseUrl,
    getUrl,
  } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [records, setRecords] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadItemsError, setLoadItemsError] = useState(null);
  const [updatingRecords, setUpdatingRecords] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState(defaultErrorMessages);
  const [formData, setFormData] = useState({
    countryName: "",
    countryDisplayName: "",
    comment: "",
    isActive : false,
    id : null
  });

  const { countryName, countryDisplayName, comment } = formData;



  const getData = React.useCallback(
    async (softLoad) => {
      const path = baseUrl + getUrl;
      if (!softLoad) {
        setLoadItemsError(true);
      }
      try {
        const result = await ReferenceDataAPI.getCountryReferenceData(
          path,
          idField,
          nameField
        );
        setRecords(result);
        setLoadItemsError(false);
      } catch (err) {
        setLoadItemsError(err?.message || "Error loading reference data");
      }
      if (!softLoad) {
        setLoadingItems(false);
      }
    },
    [baseUrl, getUrl]
  );

  const handleOpen = () => {
    setIsDialogOpen(true);
  }

  const handleClose = () => {
    setIsDialogOpen(false);
  }

  const handleSave = async () => {
    await ReferenceDataAPI.updateCountryDisplay(formData.id, formData.countryName, formData.countryDisplayName, formData.comment, formData.isActive);
    setIsDialogOpen(false)
    getData()
    enqueueSnackbar(
      `Successfully updated ${succeeded.length} item${
        succeeded.length > 1 ? "s" : ""
      }`,
      { variant: "success" }
    );

  }

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


  useEffect(() => {
    getData();
  }, [getData]);

  const handleEditItem = (item) =>{
    setEditingItem(item);
    setFormData({
      ...formData,
      countryName :item.optionText,
      countryDisplayName:item.countryDisplayName,
      comment:item.comment,
      isActive : item.isActive,
      id : item.optionId
    })
    setIsDialogOpen(true);
  }


  if (loadingItems) {
    return <LoadingComponent />;
  } else if (loadItemsError) {
    return <LoadErrorComponent message={loadItemsError} reloadData={getData} />;
  }
  return (
    <div>  
        <Dialog open={isDialogOpen} onClose={handleClose} >
          <DialogTitle>Country</DialogTitle>
          <DialogContent>
            <DialogContentText>
            </DialogContentText>
            <TextInput
              label="Country Name"
              placeholder="Country Name"
              required={true}
              value={countryName}
              onChange={(value) => setFormData({
                ...formData,
                "countryName": value
              })}
              error={errorMessages.countryName.toggle}
              helperText={errorMessages.countryName.message}
              disabled={true}
            />

            <TextInput
              label="Country Display Name"
              placeholder="Country Display Name"
              required={true}
              value={countryDisplayName}
              onChange={(value) => setFormData({
                ...formData,
                "countryDisplayName": value
              })}
              error={errorMessages.countryDisplayName.toggle}
              helperText={errorMessages.countryDisplayName.message}
            />

            <TextInput
              label="Comment"
              placeholder="Comment"
              required={true}
              value={comment}
              onChange={(value) => setFormData({
                ...formData,
                "comment": value
              })}
              error={errorMessages.comment.toggle}
              helperText={errorMessages.comment.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogActions>
        </Dialog>

      <div className={classes.transferListContainer}>
        <TransferList
          idField={internalIdField}
          nameField={internalNameField}
          records={records}
          disabled={updatingRecords}
          handleUpdateRecords={updateRecords}
          toggleEditing={(item) => handleEditItem(item)}
        />
      </div>
    </div>
  )
}


export default CountryReferenceDataComponent