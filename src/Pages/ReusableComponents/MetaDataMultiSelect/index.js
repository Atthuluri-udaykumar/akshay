/**
 *   @fileoverview
 * Project: RCubed
 * Authors: Ara Lena, P Volodymyr
 * File: MetaDataMultiSelect > index.js
 * Description: Resusable component for meta data multiselect
 */

import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ListItemIcon,
  ListItemText,
  Checkbox
} from "@mui/material";

const useStyles = makeStyles((theme) => ({ 
  questionPage : {
    border: 'none',
  },
  multiSelect: {
    marginBottom: '1rem',
  },
  formControl: {
    width: '12rem'
  }
}));


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultiSelectField({ required, list, name, label, id, updateSelectValue, clearFields, setClearFields, width }) {

  const classes = useStyles();
  const theme = useTheme();
  const [selectedValue, setSelectedValue] = useState({
    sub_typ_nm:[],
    req_cat_lst_nm:[],
    gen_req_cat_lst_nm:[],
    dossier_lst_nm:[],
    product_type_nm:[]
  });
  const [selectedName, setSelectedName] = useState([]);
  const [resetCategories, setResetCategories] = useState(false);
  const [onChangeSubmission, setOnChangeSubmission] = useState(false);
  const [onChangeGenReq, setOnChangeGenReq] = useState(false);
  
  useEffect(() => {
    if(clearFields===true){
      setSelectedValue({
        sub_typ_nm:[],
        req_cat_lst_nm:[],
        gen_req_cat_lst_nm:[],
        dossier_lst_nm:[],
        product_type_nm:[]
      })
      setClearFields(false)
      updateSelectValue({})
    }
  },[clearFields])

  const createObject = (list, value, name, id) => {
    var nameArray = [];
    Object.entries(list).forEach(([i,j])=>{
      Object.entries(value).forEach(([k,l])=>{
        if(l==j.name){
          var metaObj = {
            ['SUB_TYP_ID'] : j.id,
            ['SUB_TYP_NM'] : j.name
          }
          nameArray.push(metaObj);
        }
      })
    })
    return nameArray
  }

  const handleChange = (event) => {
    //Code for implementing select all - todo
    /*if(value[value.length - 1] === "all") {
      alert(selectedValue.length);
      setSelectedValue(selectedValue.length === list.length ? [] : list);
      return;
    }*/

    const { value } = event.target;

    //This is the unoptimized solution for getting names, as 
    //reading the Menuitems attributes throws error for name, id,key
    var nameArray = [];

    if(name==='sub_typ_nm') {
      setResetCategories(true);
      setSelectedValue({
        ...selectedValue,
        [name]: value
      });

      Object.entries(list).forEach(([i,j])=>{
        Object.entries(value).forEach(([k,l])=>{
          if(l==j.sub_typ_nm){
            //nameArray.push(j.sub_typ_id)
            var metaObj = {
              ['SUB_TYP_ID'] : j.sub_typ_id,
              ['SUB_TYP_NM'] : j.sub_typ_nm
            }
            nameArray.push(metaObj);
          }
        })
      })
    }
    if(name==='product_type_nm') {
      setSelectedValue({ ...selectedValue, [name]: value})
      Object.entries(list).forEach(([i,j])=>{
        Object.entries(value).forEach(([k,l])=>{
          if(l==j.product_type_nm){
            var metaObj = {
              ['PRODUCT_TYPE_ID'] : j.product_type_id,
              ['PRODUCT_TYPE_NM'] : j.product_type_nm
            }
            nameArray.push(metaObj);
          }
        })
      })
    }
    if(name==='req_cat_lst_nm') {
      setOnChangeSubmission(true);
      setSelectedValue({ ...selectedValue, [name]: value})
      Object.entries(list).forEach(([i,j])=>{
        Object.entries(value).forEach(([k,l])=>{
          if(l==j.req_cat_lst_nm){
            var metaObj = {
              ['REQ_CAT_LST_ID'] : j.req_cat_lst_id,
              ['REQ_CAT_LST_NM'] : j.req_cat_lst_nm
            }
            nameArray.push(metaObj);
          }
        })
      })
    }
    if(name==='dossier_lst_nm') {
      setSelectedValue({ ...selectedValue, [name]: value})
      Object.entries(list).forEach(([i,j])=>{
        Object.entries(value).forEach(([k,l])=>{
          if(l==j.dossier_lst_nm){
            var metaObj = {
              ['DOSSIER_LST_ID'] : j.dossier_lst_id,
              ['DOSSIER_LST_NM'] : j.dossier_lst_nm
            }
            nameArray.push(metaObj);
          }
        })
      })
    }
    if(name==='gen_req_cat_lst_nm') {
        setOnChangeSubmission(true);
        setOnChangeGenReq(true);
        setSelectedValue({ ...selectedValue, [name]: value})
      Object.entries(list).forEach(([i,j])=>{
        Object.entries(value).forEach(([k,l])=>{
          if(l==j.gen_req_cat_lst_nm){
            var metaObj = {
              ['GEN_REQ_CAT_LST_ID'] : j.gen_req_cat_lst_id,
              ['GEN_REQ_CAT_LST_NM'] : j.gen_req_cat_lst_nm
            }
            nameArray.push(metaObj);
          }
        })
      })
    }
    //const obj = createObject(list, value, name, id);
    updateSelectValue({[name]:[nameArray]})
  };

  return (
    <FormControl style={{ width: width}}>
        <InputLabel id="mutiple-meta-data">
          {label}
        </InputLabel>
        <Select
          //variant="outlined"
          required={required}
          //disabled={disabled}
          labelId="mutiple-meta-data"
          id="mutiple-name"
          multiple
          className={classes.multiSelect}
          value={selectedValue[`${name}`]}
          name={selectedName}
          onChange={handleChange}
          //input={<Input />}
          MenuProps={MenuProps}
          renderValue={(selectedValue) =>
            onChangeSubmission === true && name==='gen_req_cat_lst_nm' ?
             onChangeGenReq === true ?
             selectedValue.join(", ")
             :
             'Select Gen Req'
             :
             onChangeSubmission === true && name==='req_cat_lst_nm' ?
             selectedValue.length > 0 ?
              selectedValue.join(", ")
              :
                'Select Req Cat'
             :
             selectedValue.join(", ")
          }
        >
          {/*list!==undefined &&
          <MenuItem value="all">
          <ListItemIcon>
            <Checkbox
              checked={list.length > 0 && selectedValue.length === list.length}
              indeterminate={selectedValue.length > 0 && selectedValue.length < list.length}
            />
          </ListItemIcon>
          <ListItemText primary="Select All" />
          </MenuItem>*/}
          {list!==undefined &&
           list.map((item,index) => (
            <MenuItem key={item[`${id}`]} value={item[`${name}`]} name={item[`${id}`]} data-meta-name={item[`${id}`]} style={getStyles(name, selectedValue[`${name}`], theme)} >
              <ListItemIcon>
                <Checkbox checked={selectedValue[`${name}`].indexOf(item[`${name}`]) > -1}/>
              </ListItemIcon>
              <ListItemText>{item[`${name}`]}</ListItemText>
            </MenuItem>
          ))
        }
        </Select>
      </FormControl>
  )
}