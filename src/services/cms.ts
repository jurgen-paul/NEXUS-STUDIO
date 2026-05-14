import { createClient } from 'contentful';

const space = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;
const environment = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master';
const contentType = import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE || 'project';

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
    return { 
      items: [],
      error: {
        status: 401,
        message: 'Contentful API Credentials Missing',
        cause: 'VITE_CONTENTFUL_SPACE_ID or VITE_CONTENTFUL_ACCESS_TOKEN not found in environment secrets.'
      }
    };
  }

  try {
    const response = await cmsClient.getEntries({
      content_type: contentType,
      order: ['sys.createdAt'],
    });

    if (!response.items || response.items.length === 0) {
       console.info(`Contentful returned successfully but found 0 entries of type "${contentType}".`);
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

    // If we hit a 404 and we're not on 'master', try one fallback to 'master'
    if (error.status === 404 && environment !== 'master' && space && accessToken) {
      try {
        console.info(`Environment "${environment}" not found in space "${space}". Attempting fallback to "master"...`);
        const fallbackClient = createClient({
          space: space,
          accessToken: accessToken,
          environment: 'master',
        });
        const fallbackResponse = await fallbackClient.getEntries({
          content_type: contentType,
          order: ['sys.createdAt'],
        });
        
        if (fallbackResponse.items) {
          console.info('Successfully recovered using "master" environment.');
          const items = fallbackResponse.items.map((item: any) => ({
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
        }
      } catch (fallbackError: any) {
        console.warn('Fallback to "master" failed. Attempting "main"...');
        try {
          const secondFallbackClient = createClient({
            space: space,
            accessToken: accessToken,
            environment: 'main',
          });
          const secondFallbackResponse = await secondFallbackClient.getEntries({
            content_type: contentType,
            order: ['sys.createdAt'],
          });
          
          if (secondFallbackResponse.items) {
            console.info('Successfully recovered using "main" environment.');
            const items = secondFallbackResponse.items.map((item: any) => ({
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
          }
        } catch (secondError: any) {
          console.error('Final fallback to "main" also failed:', secondError);
          
          const errorDetails = secondError.details || {};
          if (secondError.status === 404) {
            if (errorDetails.type === 'Environment') {
              cause = `Environments "${environment}", "master", and "main" were all missing in space "${space}". Please check your Contentful dashboard for your primary environment name.`;
            } else {
              cause = `Environment "main" was found, but the Content Model "${contentType}" does not exist. Please create Content Model with ID "${contentType}".`;
            }
          } else if (secondError.status === 401) {
            cause = "Access Token is unauthorized for this space.";
          }
        }
      }
    }

    if (error.status === 404) {
      const errorDetails = error.details || {};
      const isSuspiciousId = space?.includes('&') || space?.includes(' ');
      const isLikelySpaceName = space && space.length > 20;
      
      if (errorDetails.type === 'Environment') {
        cause = `Environment "${environment}" does not exist in space "${space}". We attempted to fallback to "master" but that also failed. Check Settings > Environments in Contentful.`;
      } else if (space === 'OistarsW&b' || isSuspiciousId) {
        cause = `The Space ID "${space}" appears to be a name. Please use the Alphanumeric "Space ID" found in Settings > API keys (e.g., 'jk123xyz').`;
      } else if (isLikelySpaceName) {
        cause = 'The Space ID looks too long. Contentful IDs are usually 12-character alphanumeric strings.';
      } else {
        cause = `The resource (Content Model "${contentType}") was not found. Please ensure you have created a Content Model with ID "${contentType}" in Contentful.`;
      }

      console.error('CRITICAL: Contentful 404 Error', { cause, space, environment, details: errorDetails });
    } else if (error.status === 400) {
      const details = error.details || {};
      if (details.errors && details.errors.some((e: any) => e.name === 'unknownContentType')) {
        cause = `Content Type ID "${contentType}" is not valid for this space/environment. Verify the ID in Contentful Content model settings. If you use a different ID, set VITE_CONTENTFUL_CONTENT_TYPE in your secrets.`;
      } else {
        cause = `The query sent to Contentful was invalid. Message: ${error.message}`;
      }
      console.error('CRITICAL: Contentful 400 Error', { cause, details });
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
