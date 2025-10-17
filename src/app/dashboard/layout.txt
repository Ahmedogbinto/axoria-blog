import { redirect } from "next/navigation"
import { readCookie } from "@/lib/serverMethods/session/sessionMethods"


export default async function layout({children}) {
    const session = await readCookie() 

    if(!session.success) {
        redirect("/signin")
    }
  return (
    <>
    {children}
    </>
  )
}