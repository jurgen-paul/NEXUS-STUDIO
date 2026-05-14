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

export async function fetchProjects(): Promise<{ items: CmsProject[]; error?: { status: number; message: string; cause?: string } }> {
  if (!cmsClient) {
    console.warn('Contentful credentials missing (VITE_CONTENTFUL_SPACE_ID or VITE_CONTENTFUL_ACCESS_TOKEN). Using local fallback.');
    return { items: [] };
  }

  try {
    const response = await cmsClient.getEntries({
      content_type: 'project',
      order: ['sys.createdAt'],
    });

    if (!response.items || response.items.length === 0) {
       console.info('Contentful returned successfully but found 0 projects of type "project".');
       return { items: [] };
    }

    const items = response.items.map((item: any) => ({
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

    return { items };
  } catch (error: any) {
    let cause = 'Unknown error';
    if (error.status === 404) {
      const isSuspiciousId = space?.includes('&') || space?.includes(' ');
      const isLikelySpaceName = space && space.length > 20;
      
      if (space === 'OistarsW&b' || isSuspiciousId) {
        cause = `The Space ID "${space}" appears to be a name. Please use the Alphanumeric "Space ID" found in Settings > API keys (e.g., 'jk123xyz'), NOT the space name displayed at the top left of the dashboard.`;
      } else if (isLikelySpaceName) {
        cause = 'The Space ID looks too long. Contentful IDs are usually 12-character alphanumeric strings.';
      } else {
        cause = 'The Space ID, Access Token, or Environment ID is invalid.';
      }

      console.error('CRITICAL: Contentful 404 Error', { cause, space, environment });
    } else {
      console.error('Error fetching projects from Contentful:', error);
    }
    return { 
      items: [], 
      error: { 
        status: error.status || 500, 
        message: error.message || 'Failed to fetch CMS content',
        cause
      } 
    };
  }
}
