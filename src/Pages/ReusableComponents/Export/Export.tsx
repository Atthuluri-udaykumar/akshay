import React from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Fade from "@mui/material/Fade";
import * as XLSX from "xlsx";
import useConfirmationPrompt from "../../hooks/useConfirmationPrompt";

interface exportOptions {
  exportData: Array<any>;
}
const Export = (props: exportOptions) => {
  const { exportData } = props;
  const { confirm } = useConfirmationPrompt();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openDropdown = Boolean(anchorEl);
  const showDropdown = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  /* @replacer function */
  const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here

  /* @Json to csv conversion function */
  const jsonToCSV = async (jsonData) => {
    const header = Object.keys(jsonData[0]);
    let csv = await jsonData.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    );
    const header2 = header.map(
      (str) => str.replace('_', ' ')
    );
    csv.unshift(header2.join(","));
    csv = csv.join("\r\n");
    csv = csv.replaceAll('#', "");
    return csv;
  };

  /* @download csv function */
  const downloadCSV = async (csvStr) => {
    let hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csvStr);
    hiddenElement.target = "_blank";
    hiddenElement.download = "requirementsearch.csv";
    hiddenElement.click();
  };

  /* @download excel function */
  const downloadExcel = async (excelData) => {
    const heading = Object.keys(excelData[0]);
    const header: any = heading.map(
      (str) => str.replace('_', ' ')
    );
    //Had to create a new workbook and then add the header
    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [header]);

    //Starting in the second row to avoid overriding and skipping headers
    XLSX.utils.sheet_add_json(ws, excelData, {
      origin: "A2",
      skipHeader: true,
    });

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    XLSX.writeFile(wb, "requirement.xlsx");
  };

  /* @export to csv function */
  const exportToCsv = async () => {
    if(!exportData || (exportData && !exportData.length) ){
      await confirm("Please select records to export", "info", "");
      return;
    }
    const csv = await jsonToCSV(exportData);
    downloadCSV(csv);
    handleClose();
  };

  /* @export to excel function */
  const exportToExcel = async () => {
    if(!exportData || (exportData && !exportData.length) ){
      await confirm("Please select records to export", "info", "");
      return;
    }
    downloadExcel(exportData);
    handleClose();
  };

  return (
    <>
      <Box component="div" sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          id="fade-button"
          aria-controls={openDropdown ? "fade-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openDropdown ? "true" : undefined}
          onClick={showDropdown}
        >
          <FileDownloadIcon sx={{ marginTop: 1 }} />
          Export
        </Button>
        <Menu
          id="fade-menu"
          MenuListProps={{
            "aria-labelledby": "fade-button",
          }}
          anchorEl={anchorEl}
          open={openDropdown}
          onClose={handleClose}
          TransitionComponent={Fade}
        >
          <MenuItem onClick={exportToCsv}>Download as CSV</MenuItem>
          <MenuItem onClick={exportToExcel}>Excel</MenuItem>
        </Menu>
      </Box>
    </>
  );
};

export default Export;
