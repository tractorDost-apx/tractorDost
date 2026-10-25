import { cmsAPI, ContentPost, ContentCategory, ListContentPostsParams, ApiResponse } from './cms';

export interface NewsArticle extends ContentPost {}

export const newsAPI = {
  /**
   * Fetch paginated news articles from the content CMS
   */
  getNews: async (params?: Omit<ListContentPostsParams, 'postType'>): Promise<ApiResponse<ContentPost[]>> => {
    return await cmsAPI.getPosts({
      ...params,
      postType: 'NEWS',
      status: 'PUBLISHED',
    });
  },

  /**
   * Fetch single news article by slug or ID
   */
  getNewsBySlug: async (idOrSlug: string | number): Promise<ApiResponse<ContentPost>> => {
    return await cmsAPI.getPost(idOrSlug);
  },

  /**
   * Fetch all news categories
   */
  getNewsCategories: async (): Promise<ApiResponse<ContentCategory[]>> => {
    return await cmsAPI.getCategories({
      postType: 'NEWS',
      isActive: true,
    });
  },

  /**
   * Fetch top trending news stories
   */
  getTrendingNews: async (limit = 5): Promise<ApiResponse<ContentPost[]>> => {
    return await cmsAPI.getPosts({
      postType: 'NEWS',
      status: 'PUBLISHED',
      isTrending: true,
      limit,
    });
  },
};
