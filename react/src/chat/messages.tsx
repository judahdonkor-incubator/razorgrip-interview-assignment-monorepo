import { IconButton } from "@chakra-ui/button"
import Icon from "@chakra-ui/icon"
import { Input } from "@chakra-ui/input"
import { Box, Container, Flex, HStack, Spacer, Text, VStack } from "@chakra-ui/layout"
import { useState } from "react"
import axios from 'axios'
import { Message } from '.'
import { Tag } from "@chakra-ui/tag"

export const Messages = ({ data = [], recipient }: { data: Message[], recipient: Message['recipientId'] }) => {
    return (

        <Flex direction='column' h={"full"}>
            <Spacer />
            {/* <Container maxW="container.lg"> */}
            <VStack alignItems='flex-start' py={4} px={6}>
                {data.map(({ message, recipientId, id }) => (
                    <Tag key={id} alignSelf={recipientId === recipient
                        ? 'flex-end'
                        : undefined}
                        maxW={'30em'}>
                        <Text p={3}>{message}</Text>
                    </Tag>

                ))}
            </VStack>
            {/* </Container> */}
        </Flex >
    )
}