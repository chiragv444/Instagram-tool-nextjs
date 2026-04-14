export type FooterLinkItem = {
  title: string;
  url: string;
};

export type FooterContent = {
  description: string;
  copyright: string;
  pages: {
    pages_title: string;
    pages_link: FooterLinkItem[];
  };
  quick_links: {
    quick_links_title: string;
    quick_links_link: FooterLinkItem[];
  };
};
