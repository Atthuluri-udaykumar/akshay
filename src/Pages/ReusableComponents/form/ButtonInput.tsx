import React from "react"
import { Button, CircularProgress } from "@mui/material"

export interface IButtonProps{
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" | undefined;
    disabled?: boolean;
    loading?: boolean;
    text: string;
    variant?: "text" | "contained" | "outlined" | undefined;
    onClick: (value: any) => void
}

const ButtonInput = (props: IButtonProps)=>{
    const {color, disabled, loading, text, onClick, variant} = props;
    return (
        <>
            <Button
              variant={variant}
              size="small"
              color={color}
              disabled={disabled}
              style={{ margin: 20 }}
              onClick={onClick}
            >
            {loading ? <CircularProgress size={15} color="inherit" /> : ""}
            {text}
          </Button>
        </>
    )
}

export default ButtonInput;