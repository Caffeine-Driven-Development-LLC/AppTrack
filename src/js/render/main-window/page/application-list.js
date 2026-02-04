import { useContext, useEffect, useRef, useState } from 'react'
import ApplicationInputEdit from '../../components/application-input-edit.js'
import { Button, Dialog, DialogContent } from '../../ui/index.js'
import ApplicationOverview from '../../components/application-overview.js'
import ApplicaionDetails from './applicaion-details.js'
import { ViewContext } from '../view-context.js'

// Icons
function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 14L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function ClearIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function Spinner() {
    return (
        <svg className="animate-spin h-6 w-6 text-accent-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    )
}

export default function ApplicationList({ initialSearchText }) {
    const [applications, setApplications] = useState([])
    const [isCreateApplicationModalOpen, setIsCreateApplicationModalOpen] = useState(false)
    const [searchText, setSearchText] = useState(initialSearchText || '')
    const [isLoading, setIsLoading] = useState(true)
    const searchDebounceRef = useRef(null)

    const { setViewHistory, viewHistory, pushView } = useContext(ViewContext)

    const handleSearch = (event) => {
        setSearchText(event.target.value)
    }

    const openCreateApplicationModal = () => setIsCreateApplicationModalOpen(true)
    const closeCreateApplicationModal = () => setIsCreateApplicationModalOpen(false)

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
        setIsLoading(true)
        searchDebounceRef.current = setTimeout(() => {
            window.applicationApi.getApplicationListItems({
                searchText: searchText,
            })
            setIsLoading(false)
        }, 250)
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
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Button onClick={openCreateApplicationModal}>
                    New Application
                </Button>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        <SearchIcon />
                    </span>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={handleSearch}
                        className="
                            pl-9 pr-9 py-2 w-64
                            bg-[var(--bg-primary)] border border-[var(--border-color)]
                            rounded-md text-sm text-[var(--text-primary)]
                            placeholder:text-[var(--text-muted)]
                            hover:border-[var(--text-muted)]
                            focus:border-accent-500 focus:ring-1 focus:ring-accent-500 focus:outline-none
                            transition-colors duration-150
                        "
                    />
                    {searchText && (
                        <button
                            onClick={() => setSearchText('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                            <ClearIcon />
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="border border-[var(--border-color)] rounded-md overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Spinner />
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                        {searchText
                            ? `No applications found for "${searchText}"`
                            : 'No active applications'}
                    </div>
                ) : (
                    applications.map((a, index) => (
                        <div
                            key={a.id}
                            onClick={(event) => handleOnClickApplicationDetails(event, a)}
                            className={`
                                px-4 py-3 cursor-pointer
                                hover:bg-[var(--bg-secondary)]
                                transition-colors duration-150
                                ${index !== 0 ? 'border-t border-[var(--border-color)]' : ''}
                            `}
                        >
                            <ApplicationOverview
                                application={a}
                                onApplicationStatusChange={() =>
                                    handleApplicationStatusChange(a.id)
                                }
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Create Application Modal */}
            <Dialog open={isCreateApplicationModalOpen} onOpenChange={(open) => !open && closeCreateApplicationModal()}>
                <DialogContent title="Add Application">
                    <ApplicationInputEdit onClose={closeCreateApplicationModal} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
