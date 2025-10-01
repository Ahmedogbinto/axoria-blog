import { getPostByTag } from "@/lib/serverMethods/blog/postMethods"

export default async  function page({params}) {
    const {tag} = await params;
    const posts = await getPostByTag(tag);

    console.log(posts, "from tag")

  return (
    <div>page</div>
  )
}