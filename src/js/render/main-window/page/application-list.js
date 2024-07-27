import { useContext, useEffect, useRef, useState } from 'react'
import Modal from '../../components/modal.js'
import ApplicationInputEdit from '../../components/application-input-edit.js'
import {
    Button,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    Stack,
    TextField,
} from '@mui/material'
import ApplicationOverview from '../../components/application-overview.js'
import ApplicaionDetails from './applicaion-details.js'
import { ViewContext } from '../view-context.js'
import { Clear, Search } from '@mui/icons-material'
import ApplicationList from './application-list.js'

export default function ({ initialSearchText }) {
    const [applications, setApplications] = useState([])
    const [isCreateApplicationModalOpen, setIsCreateApplicationModalOpen] =
        useState(false)
    const [searchText, setSearchText] = useState(initialSearchText || '')
    const searchDebounceRef = useRef(null)

    const { setViewHistory, viewHistory, pushView } = useContext(ViewContext)

    const handleSearch = (event) => {
        setSearchText(event.target.value)
    }

    const openCreateApplicationModal = () =>
        setIsCreateApplicationModalOpen(true)
    const closeCreateApplicationModal = () =>
        setIsCreateApplicationModalOpen(false)

    const handleApplicationStatusChange = (applicationId) => {
        window.applicationApi.getApplication(applicationId)
    }

    function handleOnClickApplicationDetails(event, a) {
        event.stopPropagation()
        setViewHistory([
            ...viewHistory.slice(0, viewHistory.length - 1),
            {
                view: <ApplicationList initialSearchText={searchText} />,
                title: 'Applications',
            },
        ])
        pushView(<ApplicaionDetails initialApplication={a} />, a.role)
    }

    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        searchDebounceRef.current = setTimeout(() => {
            window.applicationApi.getApplicationListItems({
                searchText: searchText,
            })
        }, 500)
    }, [searchText])

    useEffect(() => {
        window.applicationApi.onGetApplicationListItems((event, args) => {
            setApplications(args)
        })

        window.applicationApi.onGetApplication((event, application) => {
            setApplications((prevState) => {
                const index = prevState.findIndex(
                    (a) => a.id === application.id
                )
                if (index === -1) {
                    return [...prevState, application]
                } else {
                    return [
                        ...prevState.slice(0, index),
                        application,
                        ...prevState.slice(index + 1),
                    ]
                }
            })
        })

        window.applicationApi.onApplicationDeleted(
            (event, deletedApplicationId) => {
                setApplications((prevState) =>
                    prevState.filter((a) => a.id !== deletedApplicationId)
                )
            }
        )

        window.applicationApi.getApplicationListItems({
            searchText: searchText,
        })

        return () => {
            window.applicationApi.removeListeners()
        }
    }, [])

    return (
        <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
                <Button
                    variant="contained"
                    onClick={openCreateApplicationModal}
                >
                    New Application
                </Button>
                <TextField
                    id="search"
                    label="Search"
                    value={searchText}
                    variant="outlined"
                    size="small"
                    onChange={handleSearch}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="clear search"
                                    onClick={() => setSearchText('')}
                                    edge="end"
                                >
                                    <Clear />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Stack>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {applications.map((a) => (
                    <ListItemButton
                        key={a.id}
                        divider={true}
                        onClick={(event) => {
                            handleOnClickApplicationDetails(event, a)
                        }}
                    >
                        <ApplicationOverview
                            application={a}
                            onApplicationStatusChange={() =>
                                handleApplicationStatusChange(a.id)
                            }
                        />
                    </ListItemButton>
                ))}
            </List>
            <Modal
                isOpen={isCreateApplicationModalOpen}
                onClose={closeCreateApplicationModal}
                header="Add Application"
            >
                <ApplicationInputEdit />
            </Modal>
        </Stack>
    )
}
