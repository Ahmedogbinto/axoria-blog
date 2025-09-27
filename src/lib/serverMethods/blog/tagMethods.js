import { connectToBD } from "@/lib/utils/db/connectToDB";
import { Tag } from "@/lib/models/tag";


export async function getTags() {
    await connectToBD()

    // cree un tableau postsWithTag avec des posts de mm tags pour faire une jointure
    const tags = await Tag.aggregate([
        {
            $lookup: {
                from: "posts",
                foreignField: "tags",
                localField: "_id",
                as: "postsWithTag"
            }
        },
        //compter le tableau quon vient de creer au-dessus 
        {
            $addFields: {
                postCount: {$size: "$postsWithTag"}
            }
        },
        //
        {
            $match: {
                postCount: {$gt: 0}
            }
        },
        // trier les posts dans l'ordre decroissant
        {
            $sort: {
                postCount: -1
            }
        },
        //
        {
            $project: {
                postsWithTag: 0 
            }
        }
    ])
    return tags;
}