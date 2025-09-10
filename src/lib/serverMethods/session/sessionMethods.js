import { cookies } from "next/headers";
import { Session } from "@/lib/models/session";
import { User } from "@/lib/models/user";
import { connectToBD } from "@/lib/utils/db/connectToDB";
/*
ICI nous allons lire les cookies 
*/


export async function readCookie() {

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?. value

    if(!sessionId) {
        return {success: false}
    }

    await connectToBD();

    const session = await Session.findById(sessionId);

    if (!session || session.expiresAt < new Date()) {
        return {success: false}
    }

    const user = await User.findById(session.userId);

    if (!user) {
        return {success: false}
    }

    return {success: true, userId: user._id.toString()}
}