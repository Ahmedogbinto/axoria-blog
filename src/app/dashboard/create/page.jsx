"use client";

import { addPost } from "@/lib/serverActions/blog/postServerActions";
import { useState, useRef } from "react";
/**
 * Page de création d'article
 */
export default function page() {
  /**
   * Gère la soumission du formulaire
   * FormData est un objet JS qui permet de récupérer facilement les valeurs du formulaire.il créé un objet pour nous
   * qu'on   pourra directement passé à la methode post.   */

  const [tags, setTags] = useState([]);

  const tagInputRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);                    // e.target c'est le contenu du formulaire qu'on lui a passé.
    formData.set("tags", JSON.stringify(tags))        // let   a ete concerti parce formData n'accepte ques des objets complexes comme de video, image
    console.log(formData)

    for (const [key, valeur] of formData.entries()) {
      console.log(key, valeur);
      console.log(formData);
    }

    const resullt = await addPost(formData);
  }

  function handleAddTag() {
    //e.preventDefault()  pour prevenir le comportement par defaut du button. le pb etait deja regle avec lajout de type="button"

    const newTag = tagInputRef.current.value.trim().toLowerCase()
    if(newTag !== "" && !tags.includes(newTag) && tags.length <=4 ) {
      setTags([...tags, newTag])
      tagInputRef.current.value = ""
    }
  }

  function handleRemoveTag(tagToRemove) {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  function handleEnterOnTagInput(e) {
    if(e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <main className=".u-main-container bg-white p-7 mt-32 mb-44">
      <h1 className="text-4xl mb-4">Write a articles 📃 </h1>

      <form onSubmit={handleSubmit} className="pb-6">
        {/* Champ pour le titre */}
        <label htmlFor="title" className=".f-label ">
          Title
        </label>

        <input
          type="text"
          name="title"
          className="shadow border rounded w-full p-3 mb-7 text-gray-700 focus:outline-slate-400 "
          id="title" // Astuce jsx disponible pour lier le formulaire au HtmlFor... il
          placeholder="Title"
          required // Pour pouvoir submit le formulaire 😋
        />

        <div className="mb-10">
          <label className="f-label" htmlFor="tag">
            Add a tag(s)(optional, max5)
          </label>
          <div className="flex">
            <input
              id="tag"
              type="text"
              className="shadow border rounded p-3 text-gray-700 focus:outline-slate-400"
              placeholder="Add a tag"
              ref={tagInputRef}
              onKeyDown={handleEnterOnTagInput}
            />

            <button
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold p-4 rounded mx-4"
              onClick={handleAddTag}
              type="button" // Ce tag  type= "button"en HTML permet de signifier que ce button n'est pas pour submit.
            >
              Add
            </button>

            <div className="flex items-center grow whitespace-nowrap overflow-y-auto shadow border rounded px-3">
              {tags.map((tag) => (
                <span key={tag}
                className="inline-block whitespace-nowrap bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2"
                >
                  {tag}

                  <button 
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-500 ml-2"
                  >
                    &times;    
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Champ pour l'article en markdown */}
        <label htmlFor="markdownArticle" className=".f-label ">
          Write your article using markdown - do not repeat the already given
          title
        </label>

        <a
          target="_blank"
          className="block mb-4 text-blue-600"
          href="https://www.markdownguide.org/cheat-sheet/"
        >
          {" "}
          How to use markdown syntax ?
        </a>

        <textarea
          name="markdownArticle"
          id="markdownArticle" // Toujours rappele que c<est pour lier testArea a markdownArticle
          required // c<est une maniere de faire de la validation, pour dire quon veut que la condition soit valider avant denvoyer le formulaire
          className="min-h-44 text-xl shadow appearance-none border rounded w-full p-8 text-gray-700 mb-4 focus:outline-slate-400"
        ></textarea>

        {/* Bouton de soumission */}
        <button className="min-44 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none mb-4">
          Submit
        </button>
      </form>
    </main>
  );
}
