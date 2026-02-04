import Logo from './logo.js'
import EstimatedTimeAgo from './estimated-time-ago.js'

function StarIcon({ filled, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`${filled ? 'text-warning' : 'text-[var(--text-muted)]'} hover:scale-110 transition-transform`}
        >
            {filled ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 1L12.39 6.36L18.18 7.27L14.09 11.48L15 17.27L10 14.77L5 17.27L5.91 11.48L1.82 7.27L7.61 6.36L10 1Z"/>
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 1L12.39 6.36L18.18 7.27L14.09 11.48L15 17.27L10 14.77L5 17.27L5.91 11.48L1.82 7.27L7.61 6.36L10 1Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
        </button>
    )
}

export default function CompanyOverview({ company, logoTrigger }) {
    const applicationCountText = `${company.applicationCount} Application${
        company.applicationCount === 1 ? '' : 's'
    } sent`

    const lastApplied = company.mostRecentApplication ? (
        <EstimatedTimeAgo
            date={company.mostRecentApplication}
            prefix="Last applied"
        />
    ) : (
        <span className="text-sm text-[var(--text-secondary)]">No applications sent</span>
    )

    const toggleIsFavorite = (event) => {
        event.stopPropagation()
        window.companyApi.updateCompany(company.id, {
            ...company,
            isFavorite: !company.isFavorite,
        })
    }

    return (
        <div className="flex justify-between w-full">
            <div className="flex items-center gap-3">
                <Logo
                    companyName={company.name}
                    logoPath={company.logoPath}
                    trigger={logoTrigger}
                />
                <div className="flex flex-col">
                    <span className="text-[var(--text-primary)]">{company.name}</span>
                    <span className="text-sm text-[var(--text-secondary)]">
                        {applicationCountText}
                    </span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <StarIcon filled={company.isFavorite} onClick={toggleIsFavorite} />
                {lastApplied}
            </div>
        </div>
    )
}
