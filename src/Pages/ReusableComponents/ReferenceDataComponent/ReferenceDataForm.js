import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  devLogError,
  removeDuplicateWhitespace,
} from "../../../util_funcs/reusables";

const validationSchema = yup.object().shape({
  name: yup.string().required(),
});

export default function ReferenceDataFormDialog(props) {
  const {
    open,
    name,
    isNewItem,
    existingNames,
    formLabel,
    handleClose,
    handleSave,
  } = props;
  const formik = useFormik({
    validationSchema,
    initialValues: { name: name || "" },
    onSubmit: async (values) => {
      try {
        const compactName = removeDuplicateWhitespace(values.name);

        if (!compactName) {
          formik.setSubmitting(false);
          formik.setFieldError("name", "Please enter a name");
          formik.setFieldValue("name", values.name, false);
          return;
        }

        const existingItemIndex = existingNames.indexOf(
          compactName.toLowerCase()
        );

        if (existingItemIndex !== -1) {
          formik.setSubmitting(false);
          formik.setFieldError("name", "Name exists");
          formik.setFieldValue("name", compactName, false);
          return;
        }

        await handleSave(compactName);
      } catch (error) {
        devLogError(error);
        formik.setErrors({
          name:
            (error && error.message) ||
            (isNewItem || !name ? "Error adding item" : "Error updating item"),
        });

        formik.setSubmitting(false);
      }
    },
  });

  const internalOnClose = () => {
    if (!formik.isSubmitting) {
      handleClose();
    }
  };

  const onNameChange = (evt) => {
    const value = evt.target.value || "";

    if (value.length < 100) {
      formik.setValues({ name: value }, true);
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={internalOnClose}>
      <DialogTitle>
        {formLabel
          ? formLabel
          : isNewItem || !name
          ? "New Item"
          : "Update Item"}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent style={{ paddingTop: "0px" }}>
          <TextField
            autoFocus
            fullWidth
            disabled={formik.isSubmitting}
            error={!!(formik.touched.name && formik.errors.name)}
            margin="dense"
            label="Name"
            value={formik.values.name}
            helperText={
              (formik.touched.name && formik.errors.name) ||
              "Max 100 characters"
            }
            onChange={onNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={internalOnClose}
            color="primary"
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            disabled={formik.isSubmitting || formik.values.name.length === 0}
          >
            {formik.isSubmitting ? "Submitting" : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

ReferenceDataFormDialog.propTypes = {
  open: PropTypes.bool,
  name: PropTypes.string,
  formLabel: PropTypes.string,
  existingNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
};
