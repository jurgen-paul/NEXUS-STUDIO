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
    console.warn('Contentful credentials missing (VITE_CONTENTFUL_SPACE_ID or VITE_CONTENTFUL_ACCESS_TOKEN). Using local fallback.');
    return [];
  }

  try {
    const response = await cmsClient.getEntries({
      content_type: 'project',
      order: ['sys.createdAt'],
    });

    if (!response.items || response.items.length === 0) {
       console.info('Contentful returned successfully but found 0 projects of type "project".');
       return [];
    }

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
  } catch (error: any) {
    // Enhanced error logging for 404s and other common Contentful errors
    if (error.status === 404) {
      const isSuspiciousId = space?.includes('&') || space?.includes(' ');
      console.error(
        'Contentful 404 Error: Resource not found. This usually means the Space ID or Environment ID is incorrect.',
        {
          tip: isSuspiciousId 
            ? `The Space ID "${space}" contains special characters (like "&" or spaces). Please ensure you are using the "Space ID" (found in Settings > API keys), NOT the "Space Name".`
            : 'Verify that the "project" content type exists in Contentful and that your Environment ID matches.',
          space: space,
          environment: environment,
          message: error.message
        }
      );
    } else {
      console.error('Error fetching projects from Contentful:', error);
    }
    return [];
  }
}
