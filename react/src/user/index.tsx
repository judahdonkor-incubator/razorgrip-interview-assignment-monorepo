import { Avatar, AvatarBadge } from "@chakra-ui/avatar";
import { Badge, Box, Flex, Text } from "@chakra-ui/layout";

export type User = Record<'name' | 'picture' | 'email' | 'sub', string>

export const UserCard = ({ user, hasBadge }: { user: User, hasBadge?: boolean }) => (
    <Flex>
        <Avatar src={user.picture} >
            {hasBadge && <AvatarBadge boxSize="1.25em" bg="blue.500" />}
        </Avatar>
        <Box ml="3">
            <Text fontWeight="bold">
                {user.name}
                {/* <Badge ml="1" colorScheme="green">
                    New
                </Badge> */}
            </Text>
            <Text fontSize="sm">{user.email}</Text>
        </Box>
    </Flex>
)

export { UsersOnline } from './online'