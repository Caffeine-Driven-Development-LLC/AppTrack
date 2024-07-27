#!/usr/bin/env node

import net from 'net'

let input = ''

process.stdin.setEncoding('utf8')
process.stdin.on('readable', () => {
    const chunk = process.stdin.read()
    if (chunk !== null) {
        input += chunk
    }
})

process.stdin.on('end', () => {
    const jsonInput = JSON.parse(input)

    switch (jsonInput.action) {
        case 'ping':
            console.log(
                JSON.stringify({
                    id: jsonInput.id,
                    result: 'pong',
                })
            )
            break
        case 'getCompanies':
            const socketPath =
                '/Users/ianmcnaughton/Library/Application Support/apptrack/app-track.sock'
            const namedPipeClient = net.createConnection(socketPath, () => {})
            let response = ''
            namedPipeClient.on('data', (data) => {
                response += data
                process.stdout.write(data)
                namedPipeClient.end()
            })

            namedPipeClient.on('end', () => {
                process.stdout.write(response)
            })

            namedPipeClient.write(JSON.stringify(jsonInput), () => {})
            break
        default:
            console.error(
                JSON.stringify({
                    id: jsonInput.id,
                    result: { error: 'Not implemented' },
                })
            )
    }
})
