"use server"

import { User } from "@/lib/models/user";
import { connectToBD } from "@/lib/utils/db/connectToDB";
import bcrypt from "bcryptjs";
import slugify from "slugify";


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