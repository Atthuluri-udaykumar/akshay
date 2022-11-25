import React from "react"
import { Checkbox, CircularProgress, FormControlLabel, FormGroup } from "@mui/material"

export interface ICheckBoxProps{
    label:string;
    disabled?:boolean;
    checked:boolean;
    onChange: (value:any) => void;
}

export const CheckBoxInput = (props: ICheckBoxProps)=>{
    const {onChange, checked, label, disabled} = props;
    return (
        <>
            <FormGroup>
                <FormControlLabel style={{ margin: 20 }} control={<Checkbox checked={checked} onChange={(evt, value)=>{onChange(value)}} />} label={label} disabled={disabled} />
            </FormGroup>
        </>
    )
}