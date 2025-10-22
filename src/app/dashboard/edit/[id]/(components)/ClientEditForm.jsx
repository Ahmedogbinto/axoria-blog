"use client";

import { editPost } from "@/lib/serverActions/blog/postServerActions";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { areTagsSimilar } from "@/lib/utils/general/utils";

export default function ClientEditForm({post}) {


  const [tags, setTags] = useState(post.tags.map(tag => 
  tag.name))

  const tagInputRef = useRef(null);

  const submitButtonRef = useRef(null);

  const serverValidationText = useRef(null);

  const router = useRouter();

  const imgUploadvalidationText = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);  

    /**
     * On veut comprer ci-dessous le contenu du tableau des tags deja enregistre avec un article et celui afficher pour modification
    */

    const readableFormData = Object.fromEntries(formData);
    const areSameTags = areTagsSimilar(tags, post.tags);

    if(!readableFormData.coverImage || readableFormData.coverImage.size === 0 && readableFormData.title.trim() === post.title && readableFormData.markdownArticle.trim() === post.markdownArticle && areSameTags) {
      serverValidationText.current.textContent = " You must make a change before submitting"
      return
    } else {
      serverValidationText.current.textContent = ""
    }

    formData.set("tags", JSON.stringify(tags));   
    formData.set("postToEditStringified", JSON.stringify(post));   


    serverValidationText.current.textContent = "";
    submitButtonRef.current.textContent = "Updating Post...";
    submitButtonRef.current.disabled = true;

    try {
    const result = await editPost(formData);

    if (result.success) {
        submitButtonRef.current.textContent = "Post updated ✅";

        let countdown = 3;
        serverValidationText.current.textContent = `Redirecting in ${countdown}...`;

        const interval = setInterval(() => {
        countdown -= 1;
        serverValidationText.current.textContent = `Redirecting in ${countdown}...`;

        if (countdown === 0) {
            clearInterval(interval);
            router.push(`/article/${result.slug}`);
        }
        }, 1000);
    }
    } catch (error) {
      submitButtonRef.current.textContent = "Submit";
      serverValidationText.current.textContent = `${error.message}`;
      submitButtonRef.current.disabled = false;
    }
  }

  function handleAddTag() {
      const newTag = tagInputRef.current.value.trim().toLowerCase();
      if (newTag !== "" && !tags.includes(newTag) && tags.length <= 4) {
      setTags([...tags, newTag]);
      tagInputRef.current.value = "";
      }
  }

  function handleRemoveTag(tagToRemove) {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleEnterOnTagInput(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    const validImageTypes = ["image/jpeg","image/jpg", "image/png", "image/webp"] 
    
    if(!validImageTypes.includes(file.type)) {
      imgUploadvalidationText.current.textContent = "Please upload a valid content image (JPEG, PNG, or WebP)"
      e.target.value = ""
      return
    }
    else {
      imgUploadvalidationText.current.textContent = ""
    }
    
    const img = new Image() 
    img.addEventListener("load", checkImgSizeOnLoad )

    function checkImgSizeOnLoad() {
      if (img.width > 1280 || img.height > 720) {
        imgUploadvalidationText.current.textContent = "Image exceeds 1280x720 dimensions."
        e.target.value = ""
        URL.revokeObjectURL(img.src)
        return
      }
      else {
        imgUploadvalidationText.current.textContent = ""
          URL.revokeObjectURL(img.src)
      }
    }

    img.src = URL.createObjectURL(file)   
  }

  return (
    <main className=".u-main-container bg-white p-7 mt-32 mb-44">
      <h1 className="text-4xl mb-4">Edit this article ✍ </h1>

      <form onSubmit={handleSubmit} className="pb-6">
        {/* Champ pour le titre */}
        <label htmlFor="title" className=".f-label ">
          Title
        </label>

        <input
          type="text"
          name="title"
          className="shadow border rounded w-full p-3 mb-7 text-gray-700 focus:outline-slate-400 "
          id="title" 
          placeholder="Title"
          required 
          defaultValue={post.title}
        />

        <label htmlFor="coverImage" className="f-label">
          <span>Cover image (1280x720 for best quality, or less)</span>

          <span className="block font-normal">Changing the image is optional in edit mode</span>
        </label>
        <input
        name="coverImage"
        className="shadow cursor-pointer border rounded w-full p-3 text-gray-700 mb-2 focus:outline-none focus:shadow-outline"
        type="file"
        id="coverImage"
        placeholder="Article cover image"
        onChange={handleFileChange}
        />

        <p ref = {imgUploadvalidationText}
        className="text-red-700 mb-7"></p>

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
                <span
                  key={tag}
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
          defaultValue={post.markdownArticle}
        ></textarea>

        {/* Bouton de soumission */}
        <button
          ref={submitButtonRef}
          className="min-44 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none mb-4"
        >
          Submit
        </button>
        <p ref={serverValidationText}></p>
      </form>
    </main>
  );
}
