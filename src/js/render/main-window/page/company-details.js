import {
    Box,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import CompanyOverview from '../../components/company-overview.js'
import Modal from '../../components/modal.js'
import CompanyInputEdit from '../../components/company-input-edit.js'
import SanKeyGraph from '../../components/sankey-graph.js'
import { parseDateToLocalString } from '../../utils/date-utils.js'
import ApplicaionDetails from './applicaion-details.js'
import { ViewContext } from '../view-context.js'

export default function ({ initialCompany }) {
    const [company, setCompany] = useState(initialCompany)
    const [isCompanyInputModalOpen, setIsCompanyInputModalOpen] =
        useState(false)
    const [applications, setApplications] = useState([])
    const [sankeyData, setSankeyData] = useState(null)
    const [logoTrigger, setLogoTrigger] = useState(0)

    const theme = useTheme()

    const { pushView } = useContext(ViewContext)

    const handleOnClickApplicaion = (event, application) => {
        event.stopPropagation()
        pushView(
            <ApplicaionDetails initialApplication={application} />,
            application.role
        )
    }

    useEffect(() => {
        window.applicationApi.onGetApplicationsForCompany(
            (
                event,
                {
                    companyId: cid,
                    applications: applications,
                    sankeyData: sankeyData,
                }
            ) => {
                if (company.id === cid) {
                    setApplications(applications)
                    if (sankeyData && sankeyData.nodes.length > 0) {
                        setSankeyData(sankeyData)
                    }
                }
            }
        )
        window.applicationApi.getApplicationsForCompany(company.id)

        window.companyApi.onGetCompany((event, company) => {
            if (company.id === initialCompany.id) {
                setCompany(company)
                setLogoTrigger((prev) => prev + 1)
            }
        })

        return () => {
            window.applicationApi.removeListeners()
        }
    }, [])

    const careerPageButton = company.careerPage && (
        <Button
            onClick={() => window.api.openLink(company.careerPage)}
            variant="outlined"
            size="small"
        >
            Career Page
        </Button>
    )

    const homePageButton = company.homePage && (
        <Button
            onClick={() => window.api.openLink(company.homePage)}
            variant="outlined"
            size="small"
        >
            Home Page
        </Button>
    )

    return (
        <Box sx={{ width: '100%' }}>
            <Stack spacing={1}>
                <CompanyOverview company={company} logoTrigger={logoTrigger} />
                <Stack direction="row" spacing={1}>
                    {homePageButton}
                    {careerPageButton}
                    <Button
                        size="small"
                        onClick={() => setIsCompanyInputModalOpen(true)}
                    >
                        Edit
                    </Button>
                </Stack>
                {company.notes && (
                    <Typography>
                        {company.notes.split('\n').map((line, index) => (
                            <span key={index}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </Typography>
                )}
                {sankeyData && <SanKeyGraph data={sankeyData} />}
                <Typography variant="h5">Applications</Typography>
                <TableContainer>
                    <Table size="small" aria-label="Applications">
                        <TableHead
                            sx={{
                                backgroundColor:
                                    theme.palette.tableHeader.default,
                            }}
                        >
                            <TableRow>
                                <TableCell>Role</TableCell>
                                <TableCell>Applied Date</TableCell>
                                <TableCell>Salary - High</TableCell>
                                <TableCell>Salary - Low</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {applications.map((application) => (
                                <TableRow
                                    key={application.id}
                                    onClick={(event) => {
                                        handleOnClickApplicaion(
                                            event,
                                            application
                                        )
                                    }}
                                    sx={{
                                        '&:last-child td, &:last-child th': {
                                            border: 0,
                                        },
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        {application.role}
                                    </TableCell>
                                    <TableCell>
                                        {parseDateToLocalString(
                                            application.events[0].date
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {application.salaryRangeHigh}
                                    </TableCell>
                                    <TableCell>
                                        {application.salaryRangeLow}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
            <Modal
                isOpen={isCompanyInputModalOpen}
                onClose={() => setIsCompanyInputModalOpen(false)}
                header="Edit Company"
            >
                <CompanyInputEdit company={company} />
            </Modal>
        </Box>
    )
}
