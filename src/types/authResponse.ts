import { UserInfo } from './userInfo'

export interface AuthResponse {
    userInfo?: UserInfo
    error?: string
}