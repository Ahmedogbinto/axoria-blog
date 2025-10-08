import { Tag } from "@/lib/models/tag";
import slugify from "slugify";


export async function findOrCreateTag(tagname) {
    const tagSlug = slugify(tagname, {lower: true, strict: true})
    let tag = await Tag.findOne({slug: tagSlug})

    if (!tag) {
        tag = await Tag.create({name: tagname, slug: tagSlug})
    }

    return tag._id
}