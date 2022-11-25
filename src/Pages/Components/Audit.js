import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import moment from "moment";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";

import {
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { listAuditData, auditDataRange } from "../../API";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "8px",
    height: "80vh",
  },
  paper: {
    width: "100%",
    height: "85%",
  },
}));

const RenderDetailsButton = (params) => {
  const [detailsWindow, setDetailsWindow] = useState(false);
  const showDetailsWindow = () => {
    setDetailsWindow(true);
  };

  const closeDetails = () => {
    setDetailsWindow(false);
  };

  return (
    <div>
      <Dialog
        open={detailsWindow}
        onClose={closeDetails}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Row Data for user id {params.row.row_details}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {params.row.row_data.map((row1) => (
                  <TableRow key={row1}>
                    <TableCell component="th" scope="row">
                      {row1.replace(/"/g, "").replace("=>", " : ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Changed Fields</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {params.row.changed_fields}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
      <strong>
        <Button
          variant="contained"
          color="primary"
          size="small"
          style={{ marginLeft: 16 }}
          onClick={() => {
            showDetailsWindow();
          }}
        >
          <DescriptionIcon />
          Info
        </Button>
      </strong>
    </div>
  );
};

const columns = [
  { field: "schema_name", headerName: "Schema", width: 150 },
  { field: "table_name", headerName: "Table Name", width: 150 },
  { field: "login_id", headerName: "Login ID", width: 100 },
  { field: "action_tstamp_stm", headerName: "Action Time Stamp", width: 200 },
  { field: "action", headerName: "Action", width: 100 },
  { field: "changed_fields", headerName: "Changed Fields", width: 200 },
  {
    field: "row_details",
    headerName: "Row Details",
    width: 150,
    renderCell: RenderDetailsButton,
    disableClickEventBubbling: true,
  },
];

const Audit = () => {
  const classes = useStyles();
  const [auditData, setAuditData] = useState([]);
  const [selection, setSelection] = useState([]);
  const [startRangeDate, setStartRangeDate] = useState(null);
  const [endRangeDate, setEndRangeDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rangeError, setRangeError] = useState(false);
  const disabled = false;
  const format = "MM/dd/yyyy";
  const handleStartRange = (value) => {
    setStartRangeDate(value);
  };
  const handleEndRange = (date) => {
    setEndRangeDate(date);
  };

  const searchWithDateRange = () => {
    if (startRangeDate === null || endRangeDate === null) {
      setRangeError(true);
    } else {
      setAuditData([]);
      setRangeError(false);
      setLoading(true);
      var filteredResults = auditDataRange(
        moment(startRangeDate).format("YYYY-MM-DD"),
        moment(endRangeDate).format("YYYY-MM-DD")
      );
      filteredResults.then((value) => {
        setAuditData(value);
        setLoading(false);
      });
    }
  };

  const data = async () => {
    const [listOfData] = await Promise.all([listAuditData()]);
    setAuditData(listOfData);
  };

  const clearDateRange = () => {
    data();
    setStartRangeDate(null);
    setEndRangeDate(null);
  };

  const addDay = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  useEffect(() => {
    data();
  }, []);

  const prepareUserData = (values) => {
    values = values.map((item) => {
      let rowDetailsObject = item.row_data.split(",");
      var rowDetailsArray = [];
      Object.keys(rowDetailsObject).forEach((x) => {
        rowDetailsArray.push(rowDetailsObject[x]);
      });
      return {
        id: item.event_id,
        schema_name: item.schema_name,
        table_name: item.table_name,
        login_id: item.login_id,
        action_tstamp_stm: item.action_tstamp_stm,
        action: item.action,
        changed_fields:
          item.changed_fields === null
            ? ""
            : item.changed_fields.replace(/"/g, "").replace("=>", " : "),
        //changed_fields: typeof(item.changed_fields) !== string ? '' : (item.changed_fields).replace(/=>/g,':'),
        row_data: rowDetailsArray,
        row_details: item["event_id"],
      };
    });
    return values;
  };

  var userRecords = [];
  if (auditData.records !== undefined) {
    userRecords = prepareUserData(auditData.records);
    console.log("audit data", userRecords);
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container justify="flex-end">
          <Grid item sm={2}>
            <h2 style={{ marginLeft: "10px" }}>Audit Data</h2>
          </Grid>
          <Grid item sm={2}>
            {auditData.records === undefined ? (
              <CircularProgress size={20} />
            ) : (
              ""
            )}
          </Grid>
          <Grid item sm={5}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container justifyContent="space-around">
                <DesktopDatePicker
                  inputFormat={format || "MM/dd/yyyy"}
                  id="start-date-picker"
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label="Start Date"
                      variant="standard"
                    />
                  )}
                  value={startRangeDate}
                  onChange={handleStartRange}
                />
                &nbsp;&nbsp;
                <DesktopDatePicker
                  disabled={disabled}
                  inputFormat={format || "MM/dd/yyyy"}
                  minDate={addDay(startRangeDate, 1)}
                  id="end-date-picker"
                  renderInput={(props) => (
                    <TextField {...props} label="End Date" variant="standard" />
                  )}
                  value={endRangeDate}
                  onChange={handleEndRange}
                />
              </Grid>
            </LocalizationProvider>
          </Grid>
          <Grid item sm={3}>
            <Button
              sx={{ marginLeft: "2rem", marginTop: "1rem" }}
              variant="outlined"
              size="small"
              color="primary"
              onClick={searchWithDateRange}
            >
              Search <SearchIcon />
              {loading === true ? <CircularProgress size={20} /> : ""}
            </Button>
            <Button
              sx={{ marginLeft: "2rem", marginTop: "1rem" }}
              variant="outlined"
              size="small"
              color="primary"
              onClick={clearDateRange}
            >
              Clear <ClearIcon />
            </Button>
          </Grid>
        </Grid>
        {rangeError === true ? (
          <Grid container justify="flex-end" style={{ color: "#FF0000" }}>
            *Select date range
          </Grid>
        ) : (
          ""
        )}
        <DataGrid
          sx={{ height: "100%" }}
          rows={userRecords}
          columns={columns}
          pageSize={5}
          checkboxSelection
          selectionModel={selection}
          onSelectionModelChange={(newSelection) => {
            setSelection(newSelection.selectionModel);
          }}
        />
      </Paper>
    </div>
  );
};

export default Audit;
