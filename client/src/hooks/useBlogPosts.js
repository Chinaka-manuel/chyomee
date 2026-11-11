import { useContext, useState, useMemo } from "react";
import { BlogContext } from "../context/BlogContext";

export default function useBlogPosts() {
  const ctx = useContext(BlogContext);

  const [posts, setPosts] = useState([]);

  const addPost = (p) => {
    const next = {
      id: p.id || Date.now(),
      title: p.title || "",
      slug:
        p.slug ||
        (p.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      excerpt: p.excerpt || "",
      content: p.content || "",
      category: p.category || "General",
      author: p.author || "Admin",
      image: p.image || "",
      date:
        p.date ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      status: p.status || "Draft",
    };

    setPosts((cur) => [next, ...cur]);
    return next;
  };

  const updatePost = (id, changes) =>
    setPosts((cur) =>
      cur.map((post) =>
        String(post.id) === String(id) ? { ...post, ...changes } : post,
      ),
    );

  const deletePost = (id) =>
    setPosts((cur) => cur.filter((p) => String(p.id) !== String(id)));

  const getPostById = (id) => posts.find((p) => String(p.id) === String(id));

  const getPostBySlug = (slug) => posts.find((p) => p.slug === slug);

  const publish = (id) => updatePost(id, { status: "Published" });
  const draft = (id) => updatePost(id, { status: "Draft" });

  const drafts = useMemo(
    () => posts.filter((p) => p.status === "Draft"),
    [posts],
  );
  const published = useMemo(
    () => posts.filter((p) => p.status === "Published"),
    [posts],
  );

  const localValue = {
    posts,
    setPosts,
    addPost,
    updatePost,
    deletePost,
    getPostById,
    getPostBySlug,
    publish,
    draft,
    drafts,
    published,
  };

  return ctx || localValue;
}
