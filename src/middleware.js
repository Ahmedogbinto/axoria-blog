import { NextResponse } from "next/server";
import { cookies } from "next/headers";


export async function middleware(req) {
    
    console.log("MIDDLEWARE!!!!")
    const authCheckUrl = new URL("/api/auth/validateSession", req.url) // le req.url nous permet de gerer les url d'api en Prod et en local

    const authResponse = await fetch(authCheckUrl, {
        headers: {
            cookie: (await cookies()).toString()
        },
        cache: "force-cache", 
        next: {tags: ["auth-session"]}   // mettre en place un tag, veut dire creer un objet dans la memoire. cacher
    }) 

    const {authorized} = await authResponse.json();    // extraction de authorized de la reponse

    if (!authorized) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next()             // continuer dans la pipeline dexecution
}

export const config = {                   // cet export const config, permet de ne pas lancer le middleware sur tous les routes
    matcher: ["/dashboard/:path*"]
}