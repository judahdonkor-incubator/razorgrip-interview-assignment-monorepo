import React, { useEffect, useState } from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  Flex,
  Center,
  Square,
  StackDivider,
  Spacer,
  Divider,
  Textarea,
  Button,
  IconButton,
  Icon,
  Input,
  Heading,
  Image,
  useToast,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import { UsersOnline, UserCard, User } from './user'
import axios from 'axios'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { Messenger, Messages, Message } from "./chat"
import Notification from 'react-web-notification'

type Data = {
  message: 'users-online' | 'blocked-users' | 'user-online' | 'user-offline' | 'user-blocked' | 'user-unblocked' | 'new-message'
  data?: any
} & { [key in string]: any }

export const App = () => {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    axios
      .get('/api/user')
      .then(({ data }) => setUser(data))
      .catch(err => alert(err)) // implement later
  }, [])
  const [blockedUsers, setBlockedUsers] = useState<Record<'recipientId' | 'senderId', string>[]>([])
  const [usersOnline, setUsersOnline] = useState<Parameters<typeof UsersOnline>[0]['users']>([])
  const [recipient, setRecipient] = useState<Parameters<typeof UsersOnline>[0]['recipient']>()
  const [newMessages, setNewMessages] = useState<Message[]>([])
  const [messages, setMessages] = useState<{ [key in User['sub']]: Message[] }>({})
  useEffect(() => {
    if (recipient === undefined) return
    if (messages[recipient]) {
      setMessages({
        ...messages, ...{
          [recipient]: [
            ...messages[recipient],
            ...newMessages.filter(({ recipientId }) => recipient === recipientId)]
        }
      })
      setNewMessages(newMessages.filter(({ senderId }) => recipient !== senderId))
    }
    else
      axios
        .get(`/api/chat/${recipient}`)
        .then(res => {
          setMessages({
            ...messages, ...{
              [recipient]: res.data
            }
          })
          setNewMessages(newMessages
            .filter(({ senderId }) => recipient !== senderId))
        })
  }, [recipient])
  const [notification, setNotification] = useState<Record<'title' | 'body', string> | undefined>()
  // fix hard-coded url later
  useWebSocket(`wss://razorgrip-interview-assignment.herokuapp.com?token=${user?.sub}`, {
    shouldReconnect: e => true,
    retryOnError: true,
    onMessage: e => {
      const msg: Data = JSON.parse(e.data)
      switch (msg.message) {
        case "blocked-users":
          setBlockedUsers(msg.data)
          break;
        case "users-online":
          setUsersOnline(msg.data)
          break;
        case "user-blocked":
          if (blockedUsers.findIndex(({ recipientId, senderId }) => msg.data.recipientId === recipientId && msg.data.senderId === senderId) === -1)
            setBlockedUsers(arr => [...arr, msg.data])
          if (recipient !== undefined)
            if (recipient === msg.data.recipientId)
              setRecipient(undefined)
          break;
        case "user-unblocked":
          setBlockedUsers(arr => [...arr.filter(({ recipientId, senderId }) => !(msg.data.recipientId === recipientId && msg.data.senderId === senderId))])
          break;
        case "user-online":
          if (usersOnline.findIndex(({ sub }) => sub === msg.data.sub) === -1 && msg.data.sub !== user?.sub)
            setUsersOnline([...usersOnline, msg.data])
          break;
        case "user-offline":
          const idx = usersOnline.findIndex(({ sub }) => sub === msg.data)
          if (idx !== -1)
            setUsersOnline([...usersOnline.filter((_, i) => i !== idx)])
          break;
        case "new-message":
          if (recipient !== undefined) {
            if ([msg.data.recipientId, msg.data.senderId].includes(recipient))
              setMessages({
                ...messages, ...{
                  [recipient]: [
                    ...messages[recipient],
                    msg.data]
                }
              })
          } else {
            if (msg.data.recipientId === user?.sub)
              setNotification({
                body: msg.data.message,
                title: usersOnline.find(({ sub }) => msg.data.senderId === sub)?.name || msg.data.senderId
              })
            setNewMessages(arr => [...arr, msg.data])
          }
          break;

        default:
          break;
      }
    }
  }, !!user)
  return (
    <>
      <ChakraProvider theme={theme}>
        {user && (
          <Flex h="100vh">
            <VStack
              align="stretch"
            >
              <Flex bg='gray.400'>
                <Box p="4">
                  <UserCard user={user} />
                </Box>
                <Spacer />
                <Box p="4">
                  <ColorModeSwitcher justifySelf="flex-end" />
                </Box>
              </Flex>
              <UsersOnline
                users={usersOnline}
                blocked={blockedUsers.map(({ recipientId }) => recipientId)}
                recipient={recipient}
                setRecipient={setRecipient}
                usersWithNewMessages={newMessages.map(({ senderId }) => senderId)} />
            </VStack>
            <Divider orientation="vertical" borderColor="gray.200" h='100vh' />
            <Flex flex="1" direction='column' >
              {(recipient !== undefined && usersOnline.find(({ sub }) => sub === recipient)) ? (
                <>
                  <Flex bg='gray.400'>
                    <Box p="4">
                      <UserCard user={usersOnline.find(({ sub }) => sub === recipient)!} />
                    </Box>
                    <Spacer />
                    <Box p="4">
                      <Button
                        variant="outline"
                        aria-label='Block user'
                        onClick={() => (axios.request({
                          method: blockedUsers.map(({ senderId }) => senderId).includes(recipient) ? 'DELETE' : 'PATCH',
                          url: `/api/user/blocked/${recipient}`
                        }))}>
                        {blockedUsers.map(({ senderId }) => senderId).includes(recipient) ? 'Unblock' : 'Block'}
                      </Button>
                    </Box>
                  </Flex>
                  <Box flex="1" overflow='scroll'>
                    <Messages
                      data={messages[recipient]}
                      recipient={recipient} />
                  </Box>
                  <Messenger recipient={recipient} />
                </>
              ) : (
                <Center h="full">
                  <VStack textAlign='center'>
                    <Image src='https://static.wixstatic.com/media/629476_7855f7e6a96045ebbad4f3f993ee336f~mv2.png/v1/fill/w_220,h_60,al_c,q_85,usm_0.66_1.00_0.01/razorgrip-logo.webp' />
                    <Heading>
                      Live instant messaging pplication
                  </Heading>
                  </VStack>
                </Center>
              )}
            </Flex>
          </Flex>
        )}
      </ChakraProvider>
      {notification ? (
        <Notification
          title={notification.title}
          options={{
            icon: "http://mobilusoss.github.io/react-web-notification/example/Notifications_button_24.png",
            body: notification.body
          }}
          onClose={() => setNotification(undefined)}
        />
      ) : null}
    </>
  )
}
