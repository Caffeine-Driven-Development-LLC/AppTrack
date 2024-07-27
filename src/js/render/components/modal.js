import React from 'react'
import { Close } from '@mui/icons-material'
import { Box, Modal, Stack, Typography } from '@mui/material'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90%', // 90% of the viewport height
    overflow: 'auto', // Add scroll if content overflows
}

export default function ({ isOpen, onClose, header, children }) {
    if (!isOpen) {
        return null
    }

    const childWithClose = React.Children.map(children, (child) => {
        return React.cloneElement(child, { onClose: onClose })
    })

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            onClick={(event) => event.stopPropagation()}
        >
            <Box sx={style}>
                <Stack>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ marginBottom: 2 }}
                    >
                        <Typography variant="h5" component="h1">
                            {header}
                        </Typography>
                        <Close onClick={onClose} fontSize="large" />
                    </Stack>
                    {childWithClose}
                </Stack>
            </Box>
        </Modal>
    )
}
