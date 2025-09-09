import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    normalizedUserName: {                 // c'est comme un type de slug pour les noms d'utilisateur.
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

    // isAdmin: {
    //     type: Boolean,
    //     default: false
    // }
})

export const User = mongoose.models?.User || mongoose.model("User", userSchema)