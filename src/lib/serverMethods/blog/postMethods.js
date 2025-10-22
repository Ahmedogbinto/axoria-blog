/*
* des post methods ne sont pas des serverActions mais justes des methodes coté servers qui reagissent coté servers
**/

import { connectToBD } from "@/lib/utils/db/connectToDB";
import { Post } from "@/lib/models/post";
import { Tag } from "@/lib/models/tag";
import { notFound } from "next/navigation";
import { User } from "@/lib/models/user";

/*
* gestion du caching sur une page dynamique
* gestion du caching lors de la mise à jour d'un article (1)
**/
export const dynamic = "force-static"


export async function getPost(slug) {

    await connectToBD()
    const post = await Post.findOne({slug

    }).populate({
        path: "author",
        select: "userName normalizedUserName"
    }).populate({                            //populate pour enrichir notre resultat
        path: "tags",    
        select: "name slug"
    });

    if(!post) return notFound()

    return post    

}

export async function getPosts() {
    try {
        await connectToBD();
        const posts = await Post.find({})
        .populate({
            path: "author",
            select: "userName normalizedUserName",
        })
        .populate({
            path: "tags",
            select: "name slug",
        })
        return posts

    } catch(error) {
        console.error("Error while fetch posts", error)
        throw new Error("Error to fetch posts")
    }
}

export async function getPostsFromUserID(userId) {
    await connectToBD()

    const posts = await Post.find({author: userId}).select("title _id slug")

    return posts
}


export async function getPostByTag(tagSlug) {

    await connectToBD();

    const tag = await Tag.findOne({slug: tagSlug});
    if(!tag) {
        notFound()
    }

    const posts = await Post.find({tags: tag._id }) 
    .populate({
        path:"author",
        select: "userName"
    })
    .select("title coverImageUrl slug creatdAt")
    .sort({createdAt: -1})

    return posts
}


export async function getPostsByAuthor(normalizedUserName) {

    await connectToBD();

    const author = await User.findOne({normalizedUserName});
    if(!author) {
        notFound()
    }

    const posts = await Post.find({author: author._id }) 
    .populate({
        path:"author",
        select: "userName normalizedUserName"
    })
    .select("title coverImageUrl slug createddAt")
    .sort({createdAt: -1})

    return {author, posts}
}

export async function getPostForEdit(id) {
    await connectToBD();

    const post = await Post.findOne({_id: id})
    .populate({
        path: "author",
        select: "userName normalizedName"
    })
    .populate({
        path: "tags",
        select: "name slug"
    })
    if(!post) 
    return notFound();

    return post
}