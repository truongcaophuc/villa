"use client";
import React from "react";

type TOCItem = { id: string; text: string; level: number; num: string };

export default function ArticleTOC({ items, className }: { items: TOCItem[]; className?: string }) {
  const onClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const url = new URL(window.location.href);
      url.hash = id;
      history.replaceState(null, "", url.toString());
    }
  }, []);

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-3">Mục lục</h3>
      <ul className="space-y-2 text-sm">
        {items.map((h) => (
          <li key={h.id} className={h.level === 1 ? "font-medium" : h.level === 2 ? "pl-2" : "pl-4"}>
            <a
              href={`#${h.id}`}
              onClick={(e) => onClick(e, h.id)}
              className="hover:underline"
            >
              <span className="text-muted-foreground mr-2">{h.num}</span>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}