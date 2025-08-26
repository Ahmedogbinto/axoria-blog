import { connectToBD } from "@/lib/utils/db/connectToDB";

export async function addPost(formData){
    const {title, markdownArticle } = Object.fromEntries(formData); // Extration des donn/es du formulaire, Destructuration des données de notre formulaire

    try {
        await connectToBD();            // attendre la connection a la BD ou reutiliser la connection existante
        const newPost = new Post({
            title,
            markdownArticle
        })

        // Save l'articke dans la BD 
        const savedPost = await newPost.save()
        console.log("post saved successfully")
 
        // return le succes et slug, ce serait utile dans le font
        return {succes: true, slug: savedPost.slug}
    }catch (error) {
        console.log("Error while creating the post:", error)
        throw new Error(error.message ||"An error occured while creating the post")
    }
}