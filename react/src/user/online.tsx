import { Box, StackDivider, VStack } from "@chakra-ui/layout"
import { User, UserCard } from '.'
import React, { useEffect, Dispatch, SetStateAction } from "react"

export const UsersOnline = ({ users, blocked, recipient, setRecipient, usersWithNewMessages = [] }: {
    users: User[]
    blocked: string[]
    recipient?: string
    setRecipient: Dispatch<SetStateAction<string | undefined>>
    usersWithNewMessages?: string[]
}) => {

    return (
        <VStack
            divider={<StackDivider borderColor="gray.200" />}
            spacing={4}
            align="stretch"
        >
            {users.filter(({ sub }) => !blocked.includes(sub)).map(user => (
                <Box
                    cursor='pointer'
                    key={user.sub}
                    p={4}
                    _hover={{ bg: 'gray.400' }}
                    bg={user.sub === recipient ? 'gray.400' : undefined}
                    onClick={() => setRecipient(user.sub)}>
                    <UserCard
                        user={user}
                        hasBadge={usersWithNewMessages.includes(user.sub)} />
                </Box>
            ))}
        </VStack>
    )
}