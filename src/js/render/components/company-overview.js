import { Stack, Typography } from '@mui/material'
import Logo from './logo.js'
import { Star, StarBorder } from '@mui/icons-material'
import EstimatedTimeAgo from './estimated-time-ago.js'

export default function ({ company, logoTrigger }) {
    const applicationCountText = `${company.applicationCount} Application${
        company.applicationCount === 1 ? '' : 's'
    } sent`

    const lastApplied = company.mostRecentApplication ? (
        <EstimatedTimeAgo
            date={company.mostRecentApplication}
            prefix="Last applied"
        />
    ) : (
        <Typography variant="body2">No applications sent</Typography>
    )

    const toggleIsFavorite = (event) => {
        event.stopPropagation()
        window.companyApi.updateCompany(company.id, {
            ...company,
            isFavorite: !company.isFavorite,
        })
    }

    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ width: '100%' }}
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                <Logo
                    companyName={company.name}
                    logoPath={company.logoPath}
                    trigger={logoTrigger}
                />
                <Stack>
                    <Typography variant="body1">{company.name}</Typography>
                    <Typography variant="body2">
                        {applicationCountText}
                    </Typography>
                </Stack>
            </Stack>
            <Stack alignItems="flex-end">
                {company.isFavorite ? (
                    <Star sx={{ color: 'gold' }} onClick={toggleIsFavorite} />
                ) : (
                    <StarBorder onClick={toggleIsFavorite} />
                )}
                {lastApplied}
            </Stack>
        </Stack>
    )
}
