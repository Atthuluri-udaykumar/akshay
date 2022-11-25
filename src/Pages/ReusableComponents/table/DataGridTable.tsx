import React from "react";
import { DataGrid, GridRowsProp, GridColDef, GridToolbarExport, GridSelectionModel, GridRowIdGetter, GridRowHeightParams, GridRowHeightReturnValue, GridInputSelectionModel} from '@mui/x-data-grid';
import { Box, Button, Stack } from "@mui/material";


export interface DataGridProps {
    pageSize?:number
    rows:GridRowsProp
    columns:GridColDef[]
    loading:boolean
    page?:number;
    checkboxSelection?:boolean;
    rowsPerPageOptions?:number[];
    paginationMode?: 'client' | 'server';
    rowCount?: number;
    getRowId: GridRowIdGetter<any>;
    getRowHeight: (value: GridRowHeightParams) =>  number | null | undefined | 'auto';
    onPageSizeChange?: (value: number) => void;
    onPageChange?: (value: number) => void;
    onSelectionModelChange?: (value: GridSelectionModel) => void;
    sortModel?:any;
    onSortModelChange?:(value: any) => void;
    selectionModel?: GridInputSelectionModel;
    keepNonExistentRowsSelected?: boolean
}
const DataGridTable = (props:DataGridProps)=>{
const {columns, rows, pageSize ,page, loading, onPageChange,onPageSizeChange,paginationMode,rowCount,getRowId,getRowHeight,rowsPerPageOptions, checkboxSelection, onSelectionModelChange,sortModel,selectionModel,keepNonExistentRowsSelected,onSortModelChange} = props;
  
    return (
        <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flexGrow: 1 }}>
            <DataGrid
                getRowId={getRowId}
                page={page}
                loading={loading}
                //autoPageSize={true}
                pageSize={pageSize}
                onPageSizeChange={onPageSizeChange}
                rowsPerPageOptions={rowsPerPageOptions}
                pagination={true}
                columns={columns}
                rows={rows}
                autoHeight={true}
                getRowHeight={getRowHeight}
                paginationMode={paginationMode}
                rowCount={rowCount}
                onPageChange={onPageChange}
                checkboxSelection={checkboxSelection}
                onSelectionModelChange={onSelectionModelChange}
                selectionModel={selectionModel}
                sortModel={sortModel}
                onSortModelChange={onSortModelChange}
                keepNonExistentRowsSelected={keepNonExistentRowsSelected}
                components={{
                    NoRowsOverlay: () => (
                      <Stack height="100%" alignItems="center" justifyContent="center">
                        No data found
                      </Stack>
                    )
                  }}
            />
        </div>
        </div>
    )
}

export default DataGridTable;