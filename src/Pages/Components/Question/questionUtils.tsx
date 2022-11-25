import React from "react";
import { IOption } from "../../../global/types";

export interface dataArr{
    dataArr:IOption[]
}

export const FlatternArray = (props:dataArr)=> {
      return (
            <div style={{listStyle:'none', marginTop:2, marginBottom:2}}>
                 {
                    props.dataArr.map(key=>{
                        return (
                            <li key={key.optionId}>
                                {key.optionText}
                            </li>
                        );
                    })
                 }
            </div>
        )
}