"use server"

import { User } from "@/lib/models/user";
import { connectToBD } from "@/lib/utils/db/connectToDB";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { Session } from "@/lib/models/session";
import { cookies } from "next/headers";
import AppError from "@/lib/utils/errorHandle/customError";
import { revalidateTag } from "next/cache";


export async function register(formData) {

    const {userName, email, password, passwordRepeat} = Object.fromEntries(formData)

    /* validation du formulaire cote backend, ⚠ Eviter des injections XSS*/ 
 

    try {

        
        if((typeof userName !== "string" ) || userName.trim().length < 3) {
            throw new AppError("Username must be at least 3 caracters long")
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        console.log("Password:", password);
        console.log("Regex test result:", passwordRegex.test(password));
        
        if((typeof password !== "string") || (password.trim().length < 8)  || (!passwordRegex.test(password.trim()))) {
            throw new AppError("Password must be at least 8 charcters long, include one uppercase letter, one lowcase letter, one number ans one special charcter.")
        }


        if(password !== passwordRepeat) {
            throw new AppError("Password is not match")
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if ((typeof email !== "string") || !emailRegex.test(email.trim())) {
            throw new AppError("Invalid email format")
        }        


        await connectToBD(); 
        const user  = await User.findOne({
            $or:[{userName}, {email}]
        })

        if(user) {
            throw new AppError(user.userName === userName ? "Username already exists" : "email already exist")
        }


        const normalizedUserName = slugify(userName, {lower: true, strict: true })

        const salt = await bcrypt.genSalt(10) 
        const hashedPassword = await bcrypt.hash(password, salt)


        /* On créé l'utilisateur ç partir des modeles et des données*/ 
        const newUser =  new User ({            
            userName,
            normalizedUserName,
            email,
            password: hashedPassword
        })

        await newUser.save();

        console.log("User saved to db");

        return {success: true}

    }catch (error) {
        console.error("Error while registering:", error)
        if (error instanceof AppError){
            throw error
        }
    }
    
    throw new Error("An error occured while registering:")

    
}


export async function login(formData) {
    const {userName, password} = Object.fromEntries(formData)

    try {
        await connectToBD();

        // Vérifie si l'utilisateur existe
        const user = await User.findOne({userName: userName})
        if(!user) {
            throw new Error("Invalid credentials")
        }

        // Vérifie le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            console.log("Invalid credentials")
        }

        let session;
        const existingSession = await Session.findOne({
            userId: user._id,
            expiresAt: {$gt: new Date()}
        })
        // Une session exist deja
        if (session) {
            session = existingSession;
            existingSession.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)   // Ce Calcul veut dire 7 jours en milli secondes
            await existingSession.save();
        } 
        else {
            // Crée une nouvelle session
            session = new Session ({
                userId: user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            })
            await session.save();
        }


        const cookieStore = await cookies();
        cookieStore.set("sessionId", session._id.toString(), {
            httpOnly: true,                                     // tres important, pour dire quon aura pas acces en JS, avec document.cookie
            secure: process.env.NODE_ENV === "production",      // cette lign sert a dire que en production on envoie que sur les requettes securisees HTTPS
            path: "/",
            maxAge:  7 * 24 * 60 * 60 * 1000,
            sameSite: "Lax"                                      // CSRF: Permet de gerer les requettes de types Cross Site Request Forgery
        })

        revalidateTag("auth-session")
        return {success: true}



    } catch(error) {
        console.log("Error while log in")
        throw new Error(error.message)
    }
}

export async function logOut() {

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;

    //suppression du cookie dans la BD
    try {
        await Session.findByIdAndDelete(sessionId);

        cookieStore.set("sessionId", "", {
            httpOnly: true,
            sesure: process.env.MODE_ENV === "production",
            path: "/",
            maxAge: 0, // ) qui veut dire supprimer immediatement le cookie
            sameSite: "strict" // qui veut dire 
        })
        
        revalidateTag("auth-session")
        return {success: true}


    }catch (error){
        console.log(error)
    }
}

export async function isPrivatePage(pathname) {
 const privateSegments = ["/dashboard", "/settings/profile" ]

 // Algorithme js classique
 return privateSegments.some(segment => pathname === segment || pathname.startsWith(segment + "/"));
}

export async function SAReadCookie() { //SA pour dire Server Action puis ReadCookie

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?. value

    if(!sessionId) {
        return {success: false, userId: null}
    }

    await connectToBD();

    const session = await Session.findById(sessionId);

    if (!session || session.expiresAt < new Date()) {
        return {success: false, userId: null}
    }

    const user = await User.findById(session.userId);

    if (!user) {
        return {success: false, userId: null}
    }

    return {success: true, userId: user._id.toString()}
}