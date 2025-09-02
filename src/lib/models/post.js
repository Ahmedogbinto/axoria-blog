/**
* c'est ici on va definir le schema et le modele. Le schema c'est la structure de notre modele post
* Le modele va nous permettre d'utiliser les methodes associées
*/

import mongoose from "mongoose";
import slugify from "slugify";

// Shéma de notre post 
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required:true
    },
    markdownArticle: {
        type: String,
        required: true
    },
    markdownHTMLResult: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag"
    }]

}, {timestamps: true})   // l"argument timestamp permet à ce qu'il rajoute la date d'ajout du document.

/*
* Nous allons developper un middleware qui va s'exécuter avant le post 
* Sont role sera de générer le slug 

**/

postSchema.pre("save", async function(next){
    if(!this.slug) {
        let slugCandidate = slugify(this.title, {title:true, strict: true})    // le strict: true permet de dire que le slug soit friendly😀

        let slugExists = await mongoose.models.Post.findOne({slugCandidate})

        let counter = 1
        while(slugExists) {
            slugCandidate = `${slugCandidate}-${counter}`
            slugExists = await mongoose.models.Post.findOne({slug: slugCandidate})
            counter++
        }
        this.slug = slugCandidate;
        console.log("Final slug:", slugCandidate)
    }
    next()
})


export const Post = mongoose.models?.Post || mongoose.model("Post", postSchema) 