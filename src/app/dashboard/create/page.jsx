"use client";
/**
 * Page de création d'article
 */
export default function page() {
  /**
   * Gère la soumission du formulaire
   * FormData est un objet JS qui permet de récupérer facilement les valeurs du formulaire.il créé un objet pour nous 
   * qu'on   pourra directement passé à la methode post.
   
   */
  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target) //e.target c'est le formulaire qu'on lui a passé.

    for(const [key, valeur] of formData.entries()) {
        console.log(key, valeur)
        console.log(formData)
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
                className="min-h-44 text-xl shadow appearance-none border rounded w-full p-8 text-gray-700 mb-4 focus:outline-slate-400">  
            </textarea>

            {/* Bouton de soumission */}
            <button 
                className="min-44 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none mb-4">
                Submit
            </button>
      </form>
    </main>
  );
}
