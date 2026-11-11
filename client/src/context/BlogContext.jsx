import React, { createContext, useEffect, useMemo, useState } from "react";
import { getPublishedPosts } from "../services/blogService";

export const BlogContext = createContext(null);

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let active = true;

    getPublishedPosts()
      .then(({ data }) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        const normalized = list.map((post) => ({
          ...post,
          slug:
            post.slug ||
            (post.title || "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
        }));
        setPosts(normalized);
      })
      .catch(() => {
        if (active) setPosts([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const addPost = (post) => {
    const next = {
      id: post.id || Date.now(),
      title: post.title || "",
      slug:
        post.slug ||
        (post.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "General",
      author: post.author || "Admin",
      image: post.image || "",
      date:
        post.date ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      status: post.status || "Draft",
    };

    setPosts((cur) => [next, ...cur]);
    return next;
  };

  const updatePost = (id, changes) =>
    setPosts((cur) =>
      cur.map((p) => (String(p.id) === String(id) ? { ...p, ...changes } : p)),
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

  const value = {
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

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlogContext() {
  const ctx = React.useContext(BlogContext);
  if (!ctx)
    throw new Error("useBlogContext must be used within a BlogProvider");
  return ctx;
}
