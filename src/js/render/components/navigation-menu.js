import {
    Box,
    Breadcrumbs,
    Divider,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    styled,
    Toolbar,
    Typography,
} from '@mui/material'
import {
    BarChart,
    Business,
    ChevronLeft,
    Menu,
    Settings,
    ViewList,
} from '@mui/icons-material'
import Stats from '../main-window/page/stats.js'
import CompanyList from '../main-window/page/company-list.js'
import ApplicationList from '../main-window/page/application-list.js'
import SettingsPage from '../main-window/page/settings.js'
import { useContext, useState } from 'react'
import MuiAppBar from '@mui/material/AppBar/index.js'
import MuiDrawer from '@mui/material/Drawer/index.js'
import { ViewContext } from '../main-window/view-context.js'

class NavItem {
    constructor(name, path, icon, view) {
        this.name = name
        this.path = path
        this.icon = icon
        this.view = view
    }
}

const drawerWidth = 240

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}))

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}))

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
    }),
}))

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
})

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
})

export default function () {
    const applicationListNavItem = new NavItem(
        'Applications',
        '/applications',
        <ViewList />,
        <ApplicationList />
    )

    const companyListNavItem = new NavItem(
        'Companies',
        '/companies',
        <Business />,
        <CompanyList />
    )

    const settingsNavItem = new NavItem(
        'Settings',
        '/settings',
        <Settings />,
        <SettingsPage />
    )

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const { viewHistory, setViewHistory, currentView } = useContext(ViewContext)

    const topNavItems = [
        applicationListNavItem,
        companyListNavItem,
    ]
    const bottomNavItems = [settingsNavItem]

    const mapItemsToList = (items) =>
        items.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: isDrawerOpen ? 'initial' : 'center',
                        px: 2.5,
                    }}
                    onClick={() =>
                        setViewHistory([{ view: item.view, title: item.name }])
                    }
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: isDrawerOpen ? 3 : 'auto',
                            justifyContent: 'center',
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.name}
                        sx={{ opacity: isDrawerOpen ? 1 : 0 }}
                    />
                </ListItemButton>
            </ListItem>
        ))

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" open={isDrawerOpen}>
                <Toolbar>
                    <IconButton
                        onClick={() => setIsDrawerOpen(true)}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(isDrawerOpen && { display: 'none' }),
                        }}
                    >
                        <Menu />
                    </IconButton>
                    <Breadcrumbs separator=">" color="inherit">
                        {viewHistory.map((view, index) =>
                            index === viewHistory.length - 1 ? (
                                <Typography key={index} variant="h6" noWrap>
                                    {view.title}
                                </Typography>
                            ) : (
                                <Link
                                    key={index}
                                    onClick={() => {
                                        setViewHistory(
                                            viewHistory.slice(0, index + 1)
                                        )
                                    }}
                                    noWrap
                                    variant="h6"
                                    sx={{ color: 'inherit' }}
                                >
                                    {view.title}
                                </Link>
                            )
                        )}
                    </Breadcrumbs>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={isDrawerOpen}>
                <DrawerHeader>
                    <IconButton onClick={() => setIsDrawerOpen(false)}>
                        <ChevronLeft />
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <Stack justifyContent="space-between" sx={{ height: ' 100%' }}>
                    <List>{mapItemsToList(topNavItems)}</List>
                    <List>{mapItemsToList(bottomNavItems)}</List>
                </Stack>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                {currentView.view}
            </Box>
        </Box>
    )
}
