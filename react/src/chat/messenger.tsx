import { IconButton } from "@chakra-ui/button"
import Icon from "@chakra-ui/icon"
import { Input } from "@chakra-ui/input"
import { Box, Flex, HStack } from "@chakra-ui/layout"
import { useState } from "react"
import axios from 'axios'
import { Message } from '.'
import { Progress } from "@chakra-ui/progress"

export const Messenger = ({ recipient }: { recipient: Message['recipientId'] }) => {
    const [message, setMessage] = useState('')
    const [showProgress, setShowProgress] = useState(false)
    return (
        <form onSubmit={e => {
            e.preventDefault()
            if (!message) return
            setShowProgress(true)
            axios.post('/api/chat/message', ({
                recipientId: recipient,
                message
            } as Message))
                .then(rsp => setMessage(''))
                .finally(() => setShowProgress(false))
        }}>
            {showProgress && <Progress size="xs" isIndeterminate />}
            <HStack py={2} px={4} spacing={2}>
                <Input
                    flex="1"
                    variant='filled'
                    placeholder="Type a message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
                {message && (
                    <IconButton type='submit' aria-label="Search database" icon={(
                        <Icon viewBox="0 0 200 200">
                            <svg aria-hidden="true" data-prefix="fas" data-icon="paper-plane" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z" /></svg>
                        </Icon>
                    )} />
                )}
            </HStack>
        </form>
    )
}