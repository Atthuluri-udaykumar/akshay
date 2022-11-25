/**
 * render a table with form country, form name and status
 */
import { ISearchFormResultItem, IFormCountry } from "../../../api/search";
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles';
import { ICountry } from "../ReferenceData/types";

// import useSingleRequirementForm from "Pages/hooks/useSingleRequirementForm";
export interface IUnansweredForm extends ISearchFormResultItem {
  country: ICountry;
  status: string;
  countryName: string;
  id: string;
}

export interface IUnansweredFormTableProps {
  formsList: IUnansweredForm[];
}

const useStyles = makeStyles(() => {
  return {
    row: {
      cursor: "pointer",
    },
  };
});

const UnansweredFormTable: React.FC<IUnansweredFormTableProps> = (props) => {
  const { formsList } = props;
  const navigate = useNavigate();
  const classes = useStyles();

  const [page, setPage] = React.useState(0);

  const columns = [
    { field: "formId", headerName: "Form ID", width: 130 },
    { field: "formName", headerName: "Form Name", flex: 1 },
    { field: "countryName", headerName: "Country Name", flex: 1 },
    { field: "status", headerName: "status", width: 130 },
  ];

  return (
    <div>
      <DataGrid
        classes={{
          row: classes.row,
        }}
        onRowClick={(params) => {
          navigate(
            `/answerforms/${params.row.formId}?countryId=${params.row.country.optionId}&countryName=${params.row.country.optionText}`
          );
        }}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        autoHeight
        rows={formsList}
        columns={columns}
        pageSize={5}
      />
    </div>
  );
};

export default UnansweredFormTable;
