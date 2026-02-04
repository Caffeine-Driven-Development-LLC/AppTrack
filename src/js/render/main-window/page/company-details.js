import React, { useContext, useEffect, useState } from 'react'
import CompanyOverview from '../../components/company-overview.js'
import CompanyInputEdit from '../../components/company-input-edit.js'
import SanKeyGraph from '../../components/sankey-graph.js'
import { parseDateToLocalString } from '../../utils/date-utils.js'
import ApplicaionDetails from './applicaion-details.js'
import { ViewContext } from '../view-context.js'
import { Button, Dialog, DialogContent, Table, TableHead, TableBody, TableRow, TableCell } from '../../ui/index.js'

export default function CompanyDetails({ initialCompany }) {
    const [company, setCompany] = useState(initialCompany)
    const [isCompanyInputModalOpen, setIsCompanyInputModalOpen] = useState(false)
    const [applications, setApplications] = useState([])
    const [sankeyData, setSankeyData] = useState(null)
    const [logoTrigger, setLogoTrigger] = useState(0)

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

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4">
                <CompanyOverview company={company} logoTrigger={logoTrigger} />

                <div className="flex items-center gap-2">
                    {company.homePage && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.api.openLink(company.homePage)}
                        >
                            Home Page
                        </Button>
                    )}
                    {company.careerPage && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.api.openLink(company.careerPage)}
                        >
                            Career Page
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCompanyInputModalOpen(true)}
                    >
                        Edit
                    </Button>
                </div>

                {company.notes && (
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                        {company.notes}
                    </p>
                )}

                {sankeyData && <SanKeyGraph data={sankeyData} />}

                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Applications</h2>

                <div className="border border-[var(--border-color)] rounded overflow-hidden">
                    <Table>
                        <TableHead>
                            <TableRow hover={false}>
                                <TableCell header>Role</TableCell>
                                <TableCell header>Applied Date</TableCell>
                                <TableCell header>Salary - High</TableCell>
                                <TableCell header>Salary - Low</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {applications.map((application) => (
                                <TableRow
                                    key={application.id}
                                    onClick={(event) => handleOnClickApplicaion(event, application)}
                                >
                                    <TableCell>{application.role}</TableCell>
                                    <TableCell>
                                        {parseDateToLocalString(application.events[0]?.date)}
                                    </TableCell>
                                    <TableCell>
                                        {application.salaryRangeHigh
                                            ? `$${Intl.NumberFormat().format(application.salaryRangeHigh)}`
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {application.salaryRangeLow
                                            ? `$${Intl.NumberFormat().format(application.salaryRangeLow)}`
                                            : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {applications.length === 0 && (
                                <TableRow hover={false}>
                                    <TableCell className="text-center text-[var(--text-muted)]" colSpan={4}>
                                        No applications
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isCompanyInputModalOpen} onOpenChange={(open) => !open && setIsCompanyInputModalOpen(false)}>
                <DialogContent title="Edit Company">
                    <CompanyInputEdit
                        company={company}
                        onClose={() => setIsCompanyInputModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
