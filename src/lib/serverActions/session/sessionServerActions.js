"use server"

import { User } from "@/lib/models/user";
import { connectToBD } from "@/lib/utils/db/connectToDB";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { Session } from "@/lib/models/session";
import { cookies } from "next/headers";


export async function register(formData) {

    const {userName, email, password, passwordRepeat} = Object.fromEntries(formData)

    /* validation du formulaire cote backend, ⚠ Eviter des injections XSS*/ 

    if(userName.lenght < 3) {
        throw new Error ("Username is too short")
    }



    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    console.log("Password:", password);
    console.log("Regex test result:", passwordRegex.test(password));
    
    if(!passwordRegex.test(password)) {
        throw new Error ("Password must be at least 8 charcters long, include one uppercase letter, one lowcase letter, one number ans one special charcter.")
    }


    if(password !== passwordRepeat) {
        throw new Error ("Password is not match")
    }


    try {
        await connectToBD(); 
        const user  = await User.findOne({userName})

        if(user) {
            throw new Error("Username already exists")
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

    }catch(error) {
        console.log("Error while signing up the user:", error)    

        throw new Error(error.message ||"An error occured while signing up the user")

    }

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

        if (session) {
            session = existingSession;
            existingSession.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)   // Ce Calcul veut dire 7 jours en milli secondes
            await existingSession.save();
        } 
        else {
            session = new Session ({
                userId: user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            })
            await session.save();
        }


        const cookieStore = await cookies();
        cookieStore.set("sessionId", session._id.toString(), {
            httpOnly: true,                                     // tres important, pour dire quon aura pas acces en JS, avec document.cookie
            secure: process.env.NODE_ENV === "production",     // cette lign sert a dire que en production on envoie que sur les requettes securisees HTTPS
            path: "/",
            maxAge:  7 * 24 * 60 * 60 * 1000,
            sameSite: "Lax" // CSRF: Permet de gerer les requettes de types Cross Site Request Forgery
        })

        return {success: true}



    } catch(error) {
        console.log("Error while log in")
        throw new Error(error.message)
    }
}