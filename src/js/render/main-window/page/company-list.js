import { useContext, useEffect, useRef, useState } from 'react'
import Modal from '../../components/modal.js'
import CompanyInputEdit from '../../components/company-input-edit.js'
import {
    Button,
    IconButton,
    InputAdornment,
    List, ListItem,
    ListItemButton,
    Stack,
    TextField,
} from '@mui/material'
import { Clear, Search } from '@mui/icons-material'
import CompanyOverview from '../../components/company-overview.js'
import CompanyDetails from './company-details.js'
import { ViewContext } from '../view-context.js'
import CompanyList from './company-list.js'

export default function ({ initialSearchText }) {
    const [companies, setCompanies] = useState([])
    const [displayedCompanies, setDisplayedCompanies] = useState([])
    const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] =
        useState(false)
    const [searchText, setSearchText] = useState(initialSearchText || '')
    const searchDebounceRef = useRef(null)

    const { viewHistory, setViewHistory, pushView } = useContext(ViewContext)

    const openCreateCompanyModal = () => setIsCreateCompanyModalOpen(true)
    const closeCreateCompanyModal = () => setIsCreateCompanyModalOpen(false)

    const handleSearch = (event) => {
        setSearchText(event.target.value)
    }

    const handleOnClickCompanyDetails = (event, company) => {
        event.stopPropagation()
        setViewHistory([
            ...viewHistory.slice(0, viewHistory.length - 1),
            {
                view: <CompanyList initialSearchText={searchText} />,
                title: 'Companies',
            },
        ])
        pushView(<CompanyDetails initialCompany={company} />, company.name)
    }

    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        searchDebounceRef.current = setTimeout(() => {
            if (searchText) {
                setDisplayedCompanies(
                    companies.filter((c) =>
                        c.name.toLowerCase().includes(searchText.toLowerCase())
                    )
                )
            } else {
                setDisplayedCompanies(companies)
            }
        }, 500)
    }, [searchText, companies])

    useEffect(() => {
        window.companyApi.onGetCompanies((event, args) => {
            setCompanies(args)
        })
        window.companyApi.onGetCompany((event, company) => {
            setCompanies((prevState) => {
                const index = prevState.findIndex((c) => c.id === company.id)
                if (index === -1) {
                    return [...prevState, company]
                } else {
                    return [
                        ...prevState.slice(0, index),
                        company,
                        ...prevState.slice(index + 1),
                    ]
                }
            })
        })
        window.companyApi.onCompanyDeleted((event, deletedCompanyId) => {
            setCompanies((prevState) =>
                prevState.filter((c) => c.id !== deletedCompanyId)
            )
        })

        window.companyApi.getCompanies({ showDeleted: false })

        return () => {
            window.companyApi.removeListeners()
        }
    }, [])

    return (
        <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
                <Button variant="contained" onClick={openCreateCompanyModal}>
                    Add Company
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
                {displayedCompanies.length === 0 ? (
                    <ListItem sx={{ justifyContent: 'center', py: 4 }}>
                        {searchText ? (
                            'No companies found for search term "' + searchText + '"'
                        ) :(
                            'No companies found'
                        )}
                    </ListItem>
                ) : (
                    displayedCompanies.map((c) => (
                        <ListItemButton
                            key={c.id}
                            divider={true}
                            onClick={(event) => {
                                handleOnClickCompanyDetails(event, c)
                            }}
                        >
                            <CompanyOverview company={c} />
                        </ListItemButton>
                    ))
                )}

            </List>
            <Modal
                isOpen={isCreateCompanyModalOpen}
                onClose={closeCreateCompanyModal}
                header="Add Company"
            >
                <CompanyInputEdit />
            </Modal>
        </Stack>
    )
}
