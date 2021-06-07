import { BlockedUser } from './blocked-user'
import { getRepository } from "typeorm";
import { Online } from './online'
import { auth } from 'express-openid-connect'
import axios from 'axios'
import { sendMessage } from '../web-socket'
import { getCachedValue, setCachedValue } from '../redis'

export type User = Record<'name' | 'picture' | 'email' | 'sub', string>

export class Controller {
    async blockUser(data: BlockedUser): Promise<void> {
        await getRepository(BlockedUser).save(data)
        sendMessage({
            data: {
                message: 'user-blocked',
                data
            },
            sub: Object.values(data)
        })
    }
    async unblockUser(data: BlockedUser): Promise<void> {
        await getRepository(BlockedUser).delete(data)
        sendMessage({
            data: {
                message: 'user-unblocked',
                data
            },
            sub: Object.values(data)
        })
    }
    async getBlockedUsers(sub: string): Promise<BlockedUser[]> {
        return (await getRepository(BlockedUser)
            .createQueryBuilder('b')
            .where('b.senderId = :sub or b.recipientId = :sub', { sub }).getMany())
    }
    async getUserBySub(sub: string): Promise<User> {
        const val = await getCachedValue(sub)
        let user: User | null = null
        if (val)
            user = JSON.parse(val)
        else {
            const data = (await axios.get(`https://dev-judahdonkor-incubator.us.auth0.com/api/v2/users/${sub}`, {
                headers: { authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlkwTmtYd3ZRYXNldU9VcnA2ODNwWSJ9.eyJpc3MiOiJodHRwczovL2Rldi1qdWRhaGRvbmtvci1pbmN1YmF0b3IudXMuYXV0aDAuY29tLyIsInN1YiI6InQ1M1Fram1NTlZmdDVnNjdUVm5iTjI0Tm83NWJySEZPQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2Rldi1qdWRhaGRvbmtvci1pbmN1YmF0b3IudXMuYXV0aDAuY29tL2FwaS92Mi8iLCJpYXQiOjE2MjMwMjQ1OTUsImV4cCI6MTYyMzYyOTM5NSwiYXpwIjoidDUzUWtqbU1OVmZ0NWc2N1RWbmJOMjRObzc1YnJIRk8iLCJzY29wZSI6InJlYWQ6Y2xpZW50X2dyYW50cyBjcmVhdGU6Y2xpZW50X2dyYW50cyBkZWxldGU6Y2xpZW50X2dyYW50cyB1cGRhdGU6Y2xpZW50X2dyYW50cyByZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyBkZWxldGU6dXNlcnMgY3JlYXRlOnVzZXJzIHJlYWQ6dXNlcnNfYXBwX21ldGFkYXRhIHVwZGF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgZGVsZXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcnNfYXBwX21ldGFkYXRhIHJlYWQ6dXNlcl9jdXN0b21fYmxvY2tzIGNyZWF0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgZGVsZXRlOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl90aWNrZXRzIHJlYWQ6Y2xpZW50cyB1cGRhdGU6Y2xpZW50cyBkZWxldGU6Y2xpZW50cyBjcmVhdGU6Y2xpZW50cyByZWFkOmNsaWVudF9rZXlzIHVwZGF0ZTpjbGllbnRfa2V5cyBkZWxldGU6Y2xpZW50X2tleXMgY3JlYXRlOmNsaWVudF9rZXlzIHJlYWQ6Y29ubmVjdGlvbnMgdXBkYXRlOmNvbm5lY3Rpb25zIGRlbGV0ZTpjb25uZWN0aW9ucyBjcmVhdGU6Y29ubmVjdGlvbnMgcmVhZDpyZXNvdXJjZV9zZXJ2ZXJzIHVwZGF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGRlbGV0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGNyZWF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIHJlYWQ6ZGV2aWNlX2NyZWRlbnRpYWxzIHVwZGF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgZGVsZXRlOmRldmljZV9jcmVkZW50aWFscyBjcmVhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIHJlYWQ6cnVsZXMgdXBkYXRlOnJ1bGVzIGRlbGV0ZTpydWxlcyBjcmVhdGU6cnVsZXMgcmVhZDpydWxlc19jb25maWdzIHVwZGF0ZTpydWxlc19jb25maWdzIGRlbGV0ZTpydWxlc19jb25maWdzIHJlYWQ6aG9va3MgdXBkYXRlOmhvb2tzIGRlbGV0ZTpob29rcyBjcmVhdGU6aG9va3MgcmVhZDphY3Rpb25zIHVwZGF0ZTphY3Rpb25zIGRlbGV0ZTphY3Rpb25zIGNyZWF0ZTphY3Rpb25zIHJlYWQ6ZW1haWxfcHJvdmlkZXIgdXBkYXRlOmVtYWlsX3Byb3ZpZGVyIGRlbGV0ZTplbWFpbF9wcm92aWRlciBjcmVhdGU6ZW1haWxfcHJvdmlkZXIgYmxhY2tsaXN0OnRva2VucyByZWFkOnN0YXRzIHJlYWQ6aW5zaWdodHMgcmVhZDp0ZW5hbnRfc2V0dGluZ3MgdXBkYXRlOnRlbmFudF9zZXR0aW5ncyByZWFkOmxvZ3MgcmVhZDpsb2dzX3VzZXJzIHJlYWQ6c2hpZWxkcyBjcmVhdGU6c2hpZWxkcyB1cGRhdGU6c2hpZWxkcyBkZWxldGU6c2hpZWxkcyByZWFkOmFub21hbHlfYmxvY2tzIGRlbGV0ZTphbm9tYWx5X2Jsb2NrcyB1cGRhdGU6dHJpZ2dlcnMgcmVhZDp0cmlnZ2VycyByZWFkOmdyYW50cyBkZWxldGU6Z3JhbnRzIHJlYWQ6Z3VhcmRpYW5fZmFjdG9ycyB1cGRhdGU6Z3VhcmRpYW5fZmFjdG9ycyByZWFkOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGRlbGV0ZTpndWFyZGlhbl9lbnJvbGxtZW50cyBjcmVhdGU6Z3VhcmRpYW5fZW5yb2xsbWVudF90aWNrZXRzIHJlYWQ6dXNlcl9pZHBfdG9rZW5zIGNyZWF0ZTpwYXNzd29yZHNfY2hlY2tpbmdfam9iIGRlbGV0ZTpwYXNzd29yZHNfY2hlY2tpbmdfam9iIHJlYWQ6Y3VzdG9tX2RvbWFpbnMgZGVsZXRlOmN1c3RvbV9kb21haW5zIGNyZWF0ZTpjdXN0b21fZG9tYWlucyB1cGRhdGU6Y3VzdG9tX2RvbWFpbnMgcmVhZDplbWFpbF90ZW1wbGF0ZXMgY3JlYXRlOmVtYWlsX3RlbXBsYXRlcyB1cGRhdGU6ZW1haWxfdGVtcGxhdGVzIHJlYWQ6bWZhX3BvbGljaWVzIHVwZGF0ZTptZmFfcG9saWNpZXMgcmVhZDpyb2xlcyBjcmVhdGU6cm9sZXMgZGVsZXRlOnJvbGVzIHVwZGF0ZTpyb2xlcyByZWFkOnByb21wdHMgdXBkYXRlOnByb21wdHMgcmVhZDpicmFuZGluZyB1cGRhdGU6YnJhbmRpbmcgZGVsZXRlOmJyYW5kaW5nIHJlYWQ6bG9nX3N0cmVhbXMgY3JlYXRlOmxvZ19zdHJlYW1zIGRlbGV0ZTpsb2dfc3RyZWFtcyB1cGRhdGU6bG9nX3N0cmVhbXMgY3JlYXRlOnNpZ25pbmdfa2V5cyByZWFkOnNpZ25pbmdfa2V5cyB1cGRhdGU6c2lnbmluZ19rZXlzIHJlYWQ6bGltaXRzIHVwZGF0ZTpsaW1pdHMgY3JlYXRlOnJvbGVfbWVtYmVycyByZWFkOnJvbGVfbWVtYmVycyBkZWxldGU6cm9sZV9tZW1iZXJzIHJlYWQ6ZW50aXRsZW1lbnRzIHJlYWQ6YXR0YWNrX3Byb3RlY3Rpb24gdXBkYXRlOmF0dGFja19wcm90ZWN0aW9uIHJlYWQ6b3JnYW5pemF0aW9ucyB1cGRhdGU6b3JnYW5pemF0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9uX21lbWJlcnMgcmVhZDpvcmdhbml6YXRpb25fbWVtYmVycyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyByZWFkOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyB1cGRhdGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgcmVhZDpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIGRlbGV0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIGNyZWF0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgcmVhZDpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.NZRI-TjhSr87EwRli4pwNlfWDehaG93VkfhMQBCBhpafkafMPjbdSpqv2hncMtAkFDL2bFdehJx9W-dm2QvbHjJAmiIxKIgVGDFC48PQaXl6hWgw2KIGvy3zbFDGL_ItK36Eu9UFJRw4_j2Uuukjw9-M9StEK8Ls0KqWe0bJtgz_FDYdeAg5a2ahtuXdQ1EC04cDYqRSZRioMdK0pJz7CjKs8PaYkypCw9_w8-PBkuv85eFMGV5k4eavsyehDNDlRGwJAP0r3BJ3AQ5qrnkw1PnUajNPK2w-UBQIHM_hS-BQ0u53aw__ZWDNJxunUv-lB7yivlXz1jQrY1NYea6Ikg' }
            })).data
            user = {
                email: data.email,
                picture: data.picture,
                name: data.name,
                sub: data.user_id
            }
            setCachedValue(sub, JSON.stringify(user))
        }
        return user!
    }
    async getOnlineUsers(sub: string): Promise<User[]> {
        const usersOnline: User[] = []
        try {
            for (const id of (await getRepository(Online)
                .createQueryBuilder('o')
                .where('o.userId != :sub', { sub }).getMany())
                .map(({ userId }) => userId)) {
                usersOnline.push(await this.getUserBySub(id))
            }
        } catch (error) {
            console.log(error)
        }
        return usersOnline
    }
    async addOnlineUser(userId: string): Promise<void> {
        await getRepository(Online).save({
            userId
        })
        sendMessage({
            data: {
                message: 'user-online',
                data: await this.getUserBySub(userId)
            }
        })
    }
    async removeOnlineUser(userId: string): Promise<void> {
        await getRepository(Online).delete(userId)
        sendMessage({
            data: {
                message: 'user-offline',
                data: userId
            }
        })
    }
}

export { router } from './router'

export {
    Online, BlockedUser
}