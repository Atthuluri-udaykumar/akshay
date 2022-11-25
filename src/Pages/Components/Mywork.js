import React from "react";
import Logo from '../../assets/logo.png'
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";

const MyWork = () => {
  return (
    < div style={{ textAlign: 'center', margin: '1em' }}>
      <img className='navBarLogo' variant='h6' style={{ maxWidth: '5em' }} alt="Logo" src={Logo} />
      <h2>This page contains your work</h2>
      <Button><Link to='/ref'>Ref</Link></Button>
    </div>
  )
}

export default MyWork