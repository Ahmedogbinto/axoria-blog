/*
* des post methods ne sont pas des serverActions mais justes des methodes cotéservers qui reagissent coté servers
**/

import { connectToBD } from "@/lib/utils/db/connectToDB";
import { Post } from "@/lib/models/post";

export async    function getPost(slug) {
    try {
        await connectToBD()

        const post = await Post.findOne({slug})

        return post
    } catch (err) {
        console.error("Error while fetch a post", err)
        throw new Error("Failed to fetch a post")
    }
}
