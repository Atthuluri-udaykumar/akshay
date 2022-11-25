import React from 'react'
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { Box } from '@mui/material';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxWidth: '600px',
    textAlign: 'center',
  },
  h2: {
    fontSize: '6vw',
    color: '#8d9491',
    lineHeight: '1em',
    marginBottom: '0'
  },
  h4: {
    position: 'relative',
    fontSize: '1.5em',
    color: '#111',
    background: '#fff',
    fontWeight: '300',
    display: 'inline-block',
    borderRadius: '3px',
    marginBottom: '0'
  },
  p: {
    fontSize: '1.2em'
  }
}));

export default function NotFound() {
  const classes = useStyles();
  let navigate = useNavigate();

  return (
    
    <Box component="div" sx={{textAlign:'center'}}>
      <h2 className={classes.h2}>404</h2>
      <h4 className={classes.h4}>Opps! Page not found</h4>
      <p className={classes.p}>The page you were looking for doesn't exist. You may have mistyped the address.</p>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          navigate(`/`)
        }}
      >
        Return to Home
      </Button>
    </Box>
  )
}
