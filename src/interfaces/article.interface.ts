import { MetaInterface } from "./pagination.interface";

export interface ArticleInterface {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  image: string;
  author_id?: string;
  author: {
    username: string;
    profile: string;
  };
  created_at: Date;
}

export interface MappedArticleInterface {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  image: string;
  author: string;
  author_profile: string;
  created_at: Date;
}

export interface PaginatedArticleInterface {
  meta: MetaInterface | undefined;
  rows: MappedArticleInterface[];
}
