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
import AppError from "@/lib/utils/errorHandle/customError";
import crypto from "crypto"
import sharp from "sharp";
import { readCookie } from "@/lib/serverMethods/session/sessionMethods";
import { revalidatePath } from "next/cache";
import { areTagsSimilar, generateUniqueSlug } from "@/lib/utils/general/utils";
import { findOrCreateTag } from "@/lib/serverMethods/tag/tagMethod";



const window = new JSDOM("").window
const DOMPurify = createDOMPurify(window)

export async function addPost(formData){
    const {title, markdownArticle, tags, coverImage } = Object.fromEntries(formData); // Extration des données du formulaire, Destructuration des données de notre formulaire
   

    try {

        //Gestion des erreurs au niveau du addPost pour un article
        if(typeof title !== "string" || title.trim().length < 3 ) {
            throw new AppError("Inavalid data")
        }

         if(typeof markdownArticle !== "string" || markdownArticle.trim().length === 0 ) {
            throw new AppError("Inavalid data")
        }

        // attendre la connection a la BD ou reutiliser la connection existante
        await connectToBD(); 
        
        // Gestion d'erreur si l'itilisateur n'est pas connecté
        const session = await readCookie()
        if(!session.success) {
            throw new AppError("Authentication required")
        }

        // Gestion de l'upload d'image
        if (!coverImage || !(coverImage instanceof File)) {
            throw new AppError ("Invalid Data")
        }

        const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"] 

        if(!validImageTypes.includes(coverImage.type)) {
            throw new AppError("Invalid data") 
        }

        // gestion des tags & Gestion des erreurs des tags avant 
        if(typeof tags !== "string") {
            throw new AppError("Inavalid data")
        }

        const imageBuffer = Buffer.from(await coverImage.arrayBuffer())

        const {width, height} = await sharp(imageBuffer).metadata()

        if(width > 1280 || height > 720) {
            throw new AppError("Invalid data")
        }

        const uniqueFileName = `${crypto.randomUUID()}_${coverImage.name.trim()}`      // Pour eviter les doublons

        const uploadUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${uniqueFileName}`

        const publicImageUrl = `https://ReplicationAxoria.b-cdn.net/${uniqueFileName}`

        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "AccessKey": process.env.BUNNY_STORAGE_API_KEY,
                "Content-type": "application/octet-stream",
            },
            body: imageBuffer
        })

        if(!response.ok) {
            throw new AppError(`Error while uploading the image : ${response.statusText}`)
        }
        
        // Gestion d'erreur lors de la conversion des tags en un tableau JSON
        const tagNamesArray = JSON.parse(tags)
        if(!Array.isArray(tagNamesArray)) {
            throw new AppError("Tags must be a valid array")
        }
       
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
            tags: tagIds,
            coverImageUrl: publicImageUrl,
            author: session.userId
        })

        
       
        // Save l'article dans la BD 
        const savedPost = await newPost.save()
        console.log("post saved successfully")
 
        // return le succes et slug, ce serait utile dans le font
        return {success: true, slug: savedPost.slug}
    }catch (error) {
        if (error instanceof AppError){
            throw error
        }
    }
        console.log(error)
    throw new Error("An error occured while creating the post")
}



export async function editPost(formData) {

    const {postToEditStringified, title, markdownArticle, coverImage, tags} = Object.fromEntries(formData);

    const postToEdit = JSON.parse(postToEditStringified)

    console.log(postToEditStringified, postToEdit, title, markdownArticle, coverImage, tags)

    try {

        await connectToBD();

        const session = await readCookie()
        if(!session.success) {
            throw new Error()
        }

        const updateData = {};
        if (typeof title !== "string") throw new Error();

        if (title.trim() !== postToEdit.title) {
            updateData.title = title;
            updateData.slug = await generateUniqueSlug(title);
        }

        if (typeof markdownArticle !== "string") throw new Error();

        if(markdownArticle.trim() !== postToEdit.markdownArticle) {
            updateData.markdownHTMLResult = DOMPurify.sanitize(marked(markdownArticle))
            updateData.markdownArticle = markdownArticle
        }

        if (typeof coverImage !== "object") throw new Error()

        if(coverImage.size > 0) {
            const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

            if(!validImageTypes.includes(coverImage.type)) {
                throw new Error()
            }

            const imageBuffer = Buffer.from(await coverImage.arrayBuffer()) 
            const {width, height} = await sharp(imageBuffer).metadata()
            if(width > 1280 || height > 720) {
                throw new Error()
            }

            // Delete image 
            if(postToEdit.coverImageUrl) {
                const toDeleteImageFileName = postToEdit.coverImageUrl.split("/").pop()
                const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${toDeleteImageFileName}`

                console.log("Image to delete:", toDeleteImageFileName);
                console.log("Delete URL:", deleteUrl);

                const imageDeletionResponse = await fetch(deleteUrl, {
                    method: "DELETE",
                    headers: {"AccessKey": process.env.BUNNY_STORAGE_API_KEY}
                })

                console.log("Image deletion response status:", imageDeletionResponse.status);
                console.log("Image deletion response text:", await imageDeletionResponse.text());

                if(!imageDeletionResponse.ok && imageDeletionResponse.status !== 404 ) {
                    throw new AppError(`Error while deleting the image ${imageDeletionResponse.statusText}`)
                }
            }
            

            // Upload new image
            const imageToUploadFileName = `${crypto.randomUUID()}_${coverImage.name}`
            const imageToUploadUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${imageToUploadFileName}`
            const imageToUploadPublicUrl = `https://ReplicationAxoria.b-cdn.net/${imageToUploadFileName}`

            const imageToUploadResponse = await fetch (imageToUploadUrl, {
                method: "PUT",
                headers: {
                    "AccessKey": process.env.BUNNY_STORAGE_API_KEY,
                    "Content-Type": "application/octet-stream"
                },
                body: imageBuffer
            })

            console.log("Image upload response status:", imageToUploadResponse.status);
            console.log("Image upload response text:", await imageToUploadResponse.text());
            
            if (!imageToUploadResponse) {
                console.error("Failed to upload image:", await imageToUploadResponse.text());
                throw new Error(`Error while uploading the new image: ${imageToUploadResponse.statusText}` )
            }

            updateData.coverImageUrl = imageToUploadPublicUrl
        }
     
        // Tag management 
        if (typeof tags !== "string") throw new Error()

        const tagNamesArray = JSON.parse(tags)

        if (!Array.isArray(tagNamesArray)) throw new Error();

        if (!areTagsSimilar(tagNamesArray, postToEdit.tags)) {
            const tagIds = await Promise.all(tagNamesArray.map(tag => findOrCreateTag(tag)))
            updateData.tags = tagIds
        }

        if (Object.keys(updateData).length === 0) throw new Error()

        const updatedPost = await Post.findByIdAndUpdate(postToEdit._id, updateData, {new: true})      

        return {success: true, slug: updatedPost.slug}


    }catch (error) {
         console.log("Error occured while editing the post", error)
        if (error instanceof AppError){
            throw error
        }
    }
    throw new Error("An error occured while creating the post")
}



export async function deletePost(id) {
  try{
        await connectToBD()

        const user = await readCookie()

        if(!user) {
            throw new AppError("Authentication required")
        }

        const post = await Post.findById(id)
        if(!post) {
            throw new AppError("post noty found")
        }

        await Post.findByIdAndDelete(id)

        if(post.coverImageUrl) {
            const fileName = post.coverImageUrl.split("/").pop()

            const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${fileName}`

            const response = await fetch(deleteUrl, {
                method: "DELETE",
                headers: {"AccessKey": process.env.BUNNY_STORAGE_API_KEY}
            })

            if(!response.ok) {
                throw new AppError(`Failed to delete image: ${response.statusText}`)
            }
        }

        revalidatePath(`/article/${post.slug}`)   // Beaucoup plus pratique

    }catch(error) {
        if (error instanceof AppError){
            throw error
        }
        throw new Error("An error occured while deleleting post")
    }

}