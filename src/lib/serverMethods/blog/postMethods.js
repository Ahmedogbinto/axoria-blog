/*
* des post methods ne sont pas des serverActions mais justes des methodes coté servers qui reagissent coté servers
**/

import { connectToBD } from "@/lib/utils/db/connectToDB";
import { Post } from "@/lib/models/post";
import { notFound } from "next/navigation";

export async function getPost(slug) {

    await connectToBD()
    const post = await Post.findOne({slug}).populate({     //populate pour enrichir notre resultat
        path: "tags",    
        select: "name slug"
    })

    if(!post) return notFound()


    return post    

}

export async function getPosts() {
    try {
        await connectToBD();
        const posts = await Post.find({})
        return posts

    } catch(err) {
        console.error("Error while fetch posts", err)
        throw new Error("Error to fetch posts")
    }
}

export async function postTags() {

}