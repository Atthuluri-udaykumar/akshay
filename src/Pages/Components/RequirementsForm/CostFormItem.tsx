import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import NumberFormItem, { INumberFormItemProps } from "./NumberFormItem";

const useStyles = makeStyles((theme) => {
  return {
    root: { display: "flex", alignItems: "center" },
    // dollarSignText: { marginRight: "16px", display: "inline-block" },
  };
});

export default function CostFormItem(props: INumberFormItemProps) {
  const classes = useStyles();

  return (
    <div>
      <span>
        <NumberFormItem 
        {...props} 
        placeholder="Enter Cost in USD" />
      </span>
    </div>
  );
}

CostFormItem.defaultProps = {
  allowDecimal: true,
};
