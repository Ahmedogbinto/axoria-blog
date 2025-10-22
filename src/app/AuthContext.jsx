"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { SAReadCookie } from "@/lib/serverActions/session/sessionServerActions"

const AuthContext = createContext() 

export function AuthProvider({children}) {

    const [isAuthenticated, setIsAuthenticated] = useState({
        loading: true,
        isConnected: false,
        userId: null
    })

    useEffect(() => {
      async function  fetchSession(){
            const session = await SAReadCookie()
            setIsAuthenticated({
                loading: false,
                isConnected: session.success,
                userId: session.userId

            })
        }
        fetchSession()
    }, [])

    return (
        <AuthContext.Provider value={{isAuthenticated, setIsAuthenticated}}>
            {children}
        </AuthContext.Provider>)
}

export function useAuth() {
    return useContext(AuthContext)
}