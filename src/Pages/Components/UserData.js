import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Grid,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import PersonAddDisabledIcon from "@mui/icons-material/PersonAddDisabled";
import CloseIcon from "@mui/icons-material/Close";
import { listAllUsers, deactivateUser } from "../../API";
import { get, keys } from "lodash";

const columns = [
  { field: "user_id", headerName: "User ID", width: 150 },
  { field: "lilly_id", headerName: "Lilly ID", width: 150 },
  { field: "user_nm", headerName: "User Name", width: 200 },
  { field: "email", headerName: "Email", width: 250 },
];

const UserData = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [selection, setSelection] = useState([]);
  const [openMessage, setOpenMessage] = useState(false);

  useEffect(() => {
    const data = async () => {
      const [listOfActiveUsers] = await Promise.all([listAllUsers()]);
      setActiveUsers(listOfActiveUsers);
    };
    data();
  }, []);

  const prepareUserData = (values) => {
    values = values.map((item) => {
      return {
        id: item.lilly_id,
        user_id: item.user_id,
        lilly_id: item.lilly_id,
        user_nm: item.user_nm,
        email: item.email,
      };
    });
    return values;
  };

  //remove user and update list of users after user is deactivated
  const handleDelete = async () => {
    await Promise.all(selection.map((id) => deactivateUser(id)));
    const result = await listAllUsers();
    setActiveUsers(result);
    setSelection([]);
    setOpenMessage(true);
  };

  let userRecords = [];
  if (activeUsers.records !== undefined) {
    userRecords = prepareUserData(activeUsers.records);
  }

  const handleCloseMessage = () => {
    setOpenMessage(false);
  };

  return (
    <div style={{ height: "25rem", width: "80%", marginLeft: "15px" }}>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        open={openMessage}
        autoHideDuration={4000}
        onClose={handleCloseMessage}
        message="Selected Users have been inactivated"
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseMessage}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="h2">User Management for Admin</Typography>
        </Grid>
        <Grid item xs={4}>
          {activeUsers.records === undefined ? (
            <CircularProgress size={20} />
          ) : (
            ""
          )}
        </Grid>
        <Grid item xs={2} style={{ marginTop: "1.5rem" }}>
          <Button
            variant="outlined"
            color="primary"
            disabled={selection.length === 0}
            onClick={() => handleDelete(selection)}
          >
            Deactivate User &nbsp; <PersonAddDisabledIcon />
          </Button>
        </Grid>
      </Grid>
      <DataGrid
        rows={userRecords}
        columns={columns}
        pageSize={5}
        checkboxSelection
        selectionModel={selection}
        onSelectionModelChange={(newSelection) => {
          setSelection(newSelection || []);
        }}
      />
    </div>
  );
};

export default UserData;

