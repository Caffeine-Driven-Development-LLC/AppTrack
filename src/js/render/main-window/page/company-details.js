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
        <div className="w-full max-w-4xl">
            <div className="flex flex-col gap-5">
                {/* Company Overview Card */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4">
                    <CompanyOverview company={company} logoTrigger={logoTrigger} />

                    {/* Links & Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
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
                </div>

                {company.notes && (
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
                            Notes
                        </h3>
                        <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3">
                            {company.notes}
                        </p>
                    </div>
                )}

                {sankeyData && (
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
                            Application Flow
                        </h3>
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3">
                            <SanKeyGraph data={sankeyData} />
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
                        Applications ({applications.length})
                    </h3>
                    <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
                        <Table>
                            <TableHead>
                                <TableRow hover={false}>
                                    <TableCell header>Role</TableCell>
                                    <TableCell header>Applied Date</TableCell>
                                    <TableCell header>Salary Range</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {applications.map((application) => (
                                    <TableRow
                                        key={application.id}
                                        onClick={(event) => handleOnClickApplicaion(event, application)}
                                    >
                                        <TableCell>
                                            <span className="font-medium">{application.role}</span>
                                        </TableCell>
                                        <TableCell>
                                            {parseDateToLocalString(application.events[0]?.date)}
                                        </TableCell>
                                        <TableCell>
                                            {application.salaryRangeLow && application.salaryRangeHigh
                                                ? `$${Intl.NumberFormat().format(application.salaryRangeLow)} - $${Intl.NumberFormat().format(application.salaryRangeHigh)}`
                                                : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {applications.length === 0 && (
                                    <TableRow hover={false}>
                                        <TableCell className="text-center text-[var(--text-muted)]" colSpan={3}>
                                            No applications sent to this company yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
