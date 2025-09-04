"use server"   // permet de transformer toutes les function utilisees en serveurs actions

import { Tag } from "@/lib/models/tag";
import { connectToBD } from "../../utils/db/connectToDB"
import { Post } from "@/lib/models/post";
import slugify from "slugify";
import { marked} from "marked";         // marked transforme le text du format markdown en Html 
import {JSDOM} from "jsdom";              // JSDOM et et dompurify vont permettre de purifier le HTML     pour eviter les scripts malicieux
import createDOMPurify from "dompurify";
import Prism from "prismjs"                  // librairie de coloration synytaxique
import { markedHighlight } from "marked-highlight";
import "prismjs/components/prism-markup"
import "prismjs/components/prism-css"
import "prismjs/components/prism-javascript"



const window = new JSDOM("").window
const DOMPurify = createDOMPurify(window)

export async function addPost(formData){
    const {title, markdownArticle, tags } = Object.fromEntries(formData); // Extration des données du formulaire, Destructuration des données de notre formulaire

    try {
        await connectToBD();            // attendre la connection a la BD ou reutiliser la connection existante

        // gestion des tags
        const tagNamesArray = JSON.parse(tags)
       
        const tagIds = await Promise.all(tagNamesArray.map(async (tagname) => {     // chaque callback return une promesse qui serait en pending(en attente)  Niveau Expert les promise.all😍 

            const normalizedTagName = tagname.trim().toLowerCase(); 

            let tag = await Tag.findOne({name:normalizedTagName})  // Verifier si la tag existe deja dans la base de donnees

            if(!tag) {
                tag = await Tag.create({
                    name: normalizedTagName,
                    slug: slugify(normalizedTagName, {strict: true})
                })
            }
            return tag._id
        }))

        // Gestion de de la coloration des syntaxique 
        marked.use(
            markedHighlight({
                highlight: (code, language) => {
                    const validLanguage = Prism.languages[language] ? language : 'plaintext'

                    return Prism.highlight(code, Prism.languages[validLanguage], validLanguage)
                }
            })
        )
        //gestion du markdown
        let markdownHTMLResult = marked(markdownArticle)                                              // transformer notre marckdown en HTML

        markdownHTMLResult = DOMPurify.sanitize(markdownHTMLResult)                                  // on sanitize notre HTML en enlevant de potentiel script malicieux

        const newPost = new Post({
            title,
            markdownArticle,
            markdownHTMLResult,
            tags: tagIds
        })

        
       
        // Save l'article dans la BD 
        const savedPost = await newPost.save()
        console.log("post saved successfully")
 
        // return le succes et slug, ce serait utile dans le font
        return {succes: true, slug: savedPost.slug}
    }catch (error) {
        console.log("Error while creating the post:", error)
        throw new Error(error.message ||"An error occured while creating the post")
    }
}