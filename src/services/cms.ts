import { createClient } from 'contentful';

const space = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;
const environment = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master';

// We export a dummy client if keys are missing to prevent crashes
export const cmsClient = (space && accessToken) 
  ? createClient({
      space,
      accessToken,
      environment,
    })
  : null;

export interface CmsProject {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  link: string;
  image: string;
  color: string;
  code: string;
}

export async function fetchProjects(): Promise<CmsProject[]> {
  if (!cmsClient) {
    console.warn('Contentful credentials missing. Using local fallback.');
    return [];
  }

  try {
    const response = await cmsClient.getEntries({
      content_type: 'project',
      order: ['sys.createdAt'],
    });

    return response.items.map((item: any) => ({
      id: item.sys.id,
      title: item.fields.title,
      category: item.fields.category,
      description: item.fields.description,
      technologies: item.fields.technologies || [],
      link: item.fields.link,
      image: item.fields.image?.fields?.file?.url ? `https:${item.fields.image.fields.file.url}` : '',
      color: item.fields.color || '#E2FF45',
      code: item.fields.code || '',
    }));
  } catch (error) {
    console.error('Error fetching projects from Contentful:', error);
    return [];
  }
}
