"use client";

import { useCallback, useState } from "react";
import type { HomeFaqItem } from "@/lib/dictionaries/types";

type Props = {
  title: string;
  description: string;
  items: HomeFaqItem[];
};

/**
 * FAQ block with FAQPage + Question/Answer microdata (matches legacy RDFa intent).
 * Answers start visible; click header toggles collapse (same behavior as original script).
 */
export default function HomePageFaq({ title, description, items }: Props) {
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());

  const toggle = useCallback((idx: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  return (
    <section
      className="container max-w-6xl mx-auto my-3 px-4"
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/FAQPage"
    >
      <h2 className="text-[26px] font-bold text-center text-[#1923B8] mb-4">
        {title}
      </h2>
      <div className="h-[3px] bg-gradient-to-r from-[#6a4bff] via-[#b232e9] to-[#ff1667] mx-auto mb-6" />

      <p className="text-center text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed text-justify">
        {description}
      </p>

      <div className="space-y-8">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border-[2px] border-indigo-50 mb-4"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <button
              type="button"
              className="border-b-[1px] border-indigo-50 py-2 px-5 mt-0 bg-indigo-50 text-black font-medium flex items-center text-xl cursor-pointer relative mb-0 faq-question w-full text-left"
              data-index={idx}
              onClick={() => toggle(idx)}
            >
              <h3 className="font-semibold" itemProp="name">
                {item.question}
              </h3>
            </button>
            <div
              className={
                collapsed.has(idx)
                  ? "hidden text-[#494949] leading-6 text-justify my-md px-md py-4 px-5 faq-answer"
                  : "text-[#494949] leading-6 text-justify my-md px-md py-4 px-5 faq-answer"
              }
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <p className="text-gray-700 text-justify" itemProp="text">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
