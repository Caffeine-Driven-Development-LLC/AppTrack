import { Link, Stack, Typography } from '@mui/material'
import { parseDateToLocalString } from '../utils/date-utils.js'

export default function ({ date, header, comment, handleEditClick }) {
    return (
        <Stack>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">
                    {parseDateToLocalString(date)}
                </Typography>
                <Typography variant="h6">{header}</Typography>
            </Stack>
            {comment && (
                <Typography variant="body2" sx={{ paddingBottom: '4px' }}>
                    {comment.split('\n').map((line, index) => (
                        <span key={index}>
                            {line}
                            <br />
                        </span>
                    ))}
                </Typography>
            )}
            {handleEditClick && (
                <Link
                    underline="hover"
                    sx={{ fontSize: '12px', width: 'fit-content' }}
                    onClick={handleEditClick}
                >
                    Edit
                </Link>
            )}
        </Stack>
    )
}
