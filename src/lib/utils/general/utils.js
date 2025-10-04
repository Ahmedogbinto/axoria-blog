export function areTagsSimilar(userTagsArray, DBTagsArray) {

    if(userTagsArray.length !== DBTagsArray.length) return false;

    const sortedUserTagsArray = [...userTagsArray].sort();

    const sortedDBTagsArray = DBTagsArray.map(tag => tag.name).sort();

    return sortedUserTagsArray.every((tag,i) => tag === sortedDBTagsArray[i]);

}