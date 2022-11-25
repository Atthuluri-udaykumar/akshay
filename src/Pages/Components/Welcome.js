
import React from "react";
import Logo from '../../assets/RCubed-earth.png'
import { 
  Box} from "@mui/material";

const Welcome = () => {
  return (
    < div style={{ textAlign: 'center', margin: '1em' }}>
      {/* <img className='navBarLogo' variant='h6' style={{ maxWidth: '5em' }} alt="Logo" src={Logo} /> */}
      <h1 style={{color:'#1e96f2'}}>RCubed</h1>
      <p style={{color:'rgb(165 158 158)', fontSize:25,marginTop:25,marginBottom:40}}>Lilly's Website for Tracking Intercontinental Regulatory Requirements</p>
      <Box
        component="img"
        sx={{
        maxHeight: 250,
        marginTop:0.5,
        marginLeft:0
        }}
        alt="Logo"
        src={Logo}
      />
    </div>
  )
}

export default Welcome