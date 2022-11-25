import * as React from 'react';
import Logo from "../../assets/lilly_white.png";
import RCUBED_LOGO from "../../assets/RCubed-inverse-white.png";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PublicIcon from "@mui/icons-material/Public";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { FormatListNumberedRounded } from "@mui/icons-material";
import GroupIcon from "@mui/icons-material/Group";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import Logout from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    GenericUserGroups,
    filterItemsUsingUserGroups,
  } from "../../global/userGroups";
import { 
    Box,
    Drawer,
    AppBar,
    Divider, 
    CssBaseline,
    Toolbar,
    List,
    Typography,
    IconButton, 
    Tooltip, 
    ListItem, 
    ListItemButton, 
    ListItemText, 
    ListItemIcon, 
    Link,
    Collapse,
    Alert,
    Button,
    Menu,
    MenuItem,
    styled
} from '@mui/material';
import { Auth } from 'aws-amplify';
  
const StyledList = styled(List)({
  // selected and (selected + hover) states
  '&& .Mui-selected, && .Mui-selected:hover': {
    backgroundColor: 'red',
    '&, & .MuiListItemIcon-root': {
      color: 'pink',
    },
  },
  // hover states
  '& .MuiListItem-root:hover': {
    backgroundColor: '#bde0fb',
    '&, & .MuiListItemIcon-root': {
      color: '#000',
    },
  },
});

const drawerWidth = 240;
interface ISidebarItem {
    to: string;
    label: string;
    icon: React.ReactNode;
    groups: GenericUserGroups[];
  }
  
  const generalSideBarItems: ISidebarItem[] = [
    {
      to: "/search",
      label: "Search",
      icon: <SearchIcon />,
      groups: [GenericUserGroups.Admin, GenericUserGroups.User],
    },
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
      groups: [GenericUserGroups.Admin, GenericUserGroups.User],
    },
    {
      to: "/mywork",
      label: "My Work",
      icon: <PersonIcon />,
      groups: [GenericUserGroups.Admin, GenericUserGroups.User],
    },
    {
      to: "/assignedtasks",
      label: "Tasks",
      icon: <AssignmentTurnedInIcon />,
      groups: [GenericUserGroups.Admin, GenericUserGroups.User],
    },
    // {
    //   to: "/alerts",
    //   label: "Alerts",
    //   icon: <NotificationsIcon />,
    //   groups: [GenericUserGroups.Admin, GenericUserGroups.User],
    // }
  ];
  
  const adminSideBarItems: ISidebarItem[] = [
    {
      to: "/admin",
      label: "Data Management",
      icon: <BuildIcon />,
      groups: [GenericUserGroups.Admin],
    },
    {
      to: "/Regions",
      label: "Regions",
      icon: <PublicIcon />,
      groups: [GenericUserGroups.Admin],
    },
    {
      to: "/QuestionBuilder",
      label: "Question Builder",
      icon: <HelpOutlineIcon />,
      groups: [GenericUserGroups.Admin],
    },
    {
      to: "/QuestionSearch",
      label: "Question Search/Edit",
      icon: <FindInPageIcon />,
      groups: [GenericUserGroups.Admin],
    },
    {
      to: "/forms",
      label: "Form Search/Edit",
      icon: <FormatListNumberedRounded />,
      groups: [GenericUserGroups.Admin],
    },
    {
      to: "/usermanagement",
      label: "User Management",
      icon: <GroupIcon />,
      groups: [GenericUserGroups.Admin],
    },
  ];
  
  export interface IAppBarComponentProps {
    main: React.ReactNode;
    name: string;
    userGroups: string[];
  }

  const AppBarComponent: React.FC<IAppBarComponentProps> = (props) => {
    const { main, name, userGroups } = props;
    const [open, setOpen] = React.useState(true);
    const [alertOpen, setAlertOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openDropdown = Boolean(anchorEl);
    const showDropdown = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };
    const handleLogOut = () => {
        setAnchorEl(null);
        LogoutWithDelay();
      };
    
      function delay(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
    
      async function LogoutWithDelay() {
        setAlertOpen(true);
        await delay(3000);
        setAlertOpen(false);
        Auth.signOut();
      }
    
      const memoizedGeneralSidebarItems = React.useMemo(
        () => filterItemsUsingUserGroups(generalSideBarItems, userGroups),
        [userGroups]
      );
    
      const memoizedAdminSidebarItems = React.useMemo(
        () => filterItemsUsingUserGroups(adminSideBarItems, userGroups),
        [userGroups]
      );
    
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{justifyContent:'space-between'}}>
            <div>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={{ position: 'fixed', ...(open && { display: 'none' }), marginTop:0.8 }}
                >
                    {/* <Tooltip title="Click for Expanded View"> */}
                    <MenuIcon />
                {/* </Tooltip> */}
                </IconButton>
                <IconButton 
                    onClick={handleDrawerClose} 
                    color="inherit" 
                    aria-label="close"
                    edge="start"
                    sx={{ position: 'fixed', ...(!open && { display: 'none' }),marginTop:0.8 }}>
                    {/* <Tooltip title="Click to Collapse"> */}
                    <ChevronLeftIcon />
                {/* </Tooltip> */}
                </IconButton>
                <Box
                    component="img"
                    sx={{
                    maxHeight: 50,
                    marginTop:0.5,
                    marginLeft:4
                    }}
                    alt="Logo"
                    src={RCUBED_LOGO}
                />
                <Box
                    component="img"
                    sx={{
                    maxHeight: 40,
                    marginTop:0.5,
                    marginLeft:0
                    }}
                    alt="Logo"
                    src={Logo}
                />
            </div>
            <div>
                <IconButton edge="end" color="inherit" aria-label="close">
                <AccountCircle />
                {/* <Typography>
                    {name}
                    <Tooltip title="Click to Logout">
                    <Link onClick={handleLogOut} sx={{textDecoration:"none",marginLeft:'5px', color:'#000',fontSize:14}} textTransform="uppercase">Logout</Link>
                    </Tooltip>
                </Typography> */}
                </IconButton>
                <Button
                  id="demo-customized-button"
                  aria-controls={openDropdown ? 'demo-customized-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={openDropdown ? 'true' : undefined}
                  onClick={showDropdown}
                  endIcon={<KeyboardArrowDownIcon  sx={{color:'#fff'}}/>}
                >
                  <p style={{color:'#fff'}}>{name}</p>
                </Button>
                <Menu
                  id="demo-customized-menu"
                  aria-labelledby="demo-customized-button"
                  anchorEl={anchorEl}
                  open={openDropdown}
                  onClose={handleClose}
                  elevation={0}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleClose}>My account</MenuItem> */}
                  <MenuItem onClick={handleLogOut}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
            </div>
        </Toolbar>
        <Collapse in={alertOpen}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setAlertOpen(false);
                  Auth.signOut();
                }}
              >
                <DoneIcon fontSize="inherit" />
              </IconButton>
            }
          >
            You will be logged out from the application
          </Alert>
        </Collapse>
      </AppBar>
      <Drawer
        open={open}
        variant="permanent"
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: open ? drawerWidth : 60, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <StyledList>
            <AppBarListItems
            items={memoizedGeneralSidebarItems}
            renderListItemText={open}
            />
            <AppBarListItems
            items={memoizedAdminSidebarItems}
            renderListItemText={open}
            />
            </StyledList>
        </Box>
      </Drawer>
      <Box component="main" sx={{ marginLeft: open ? 1: 10,width: open ? "calc(100% - 240px)" : "95%" }}>
        <Toolbar />
        {/* <Typography> */}
            {main}
        {/* </Typography> */}
      </Box>
    </Box>
  );
}

export interface AppBarListItemsProps {
    items: ISidebarItem[];
    renderListItemText?: boolean;
  }
  
  const AppBarListItems: React.FC<AppBarListItemsProps> = (props) => {
    const { items, renderListItemText } = props;
    let navigate = useNavigate();
    let location = useLocation();
    return (
      <List>
        {items.map((item) => (
          <ListItem
            button
            key={item.label}
            onClick={() => {
              // prevent pushing to the history object the same path twice
              location.pathname !== item.to.toLowerCase() &&
              navigate(item.to.toLowerCase());
            }}
          >
            <Tooltip key={item.label} title={item.label}>
              <ListItemIcon key={item.label}>{item.icon}</ListItemIcon>
            </Tooltip>
            {renderListItemText && <ListItemText primary={item.label} />}
          </ListItem>
        ))}
      </List>
    );
  };

export default AppBarComponent;
