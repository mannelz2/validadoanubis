export const preserveUrlParams = (location: any): string => {
  const currentParams = new URLSearchParams(location.search);

  if (location.state?.urlParams) {
    const stateParams = new URLSearchParams(location.state.urlParams);
    stateParams.forEach((value, key) => {
      if (!currentParams.has(key)) {
        currentParams.set(key, value);
      }
    });
  }

  return currentParams.toString();
};

export const getUrlParamsString = (location: any, additionalParams?: Record<string, string>): string => {
  const params = preserveUrlParams(location);
  const urlParams = new URLSearchParams(params);

  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      urlParams.set(key, value);
    });
  }

  return urlParams.toString();
};

export const navigateWithParams = (
  navigate: any,
  path: string,
  location: any,
  state?: any
): void => {
  const urlParams = preserveUrlParams(location);
  const finalState = {
    ...state,
    urlParams
  };

  navigate(`${path}${urlParams ? `?${urlParams}` : ''}`, { state: finalState });
};

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  src?: string;
  sck?: string;
  product_id?: string;
}

export const extractUtmParams = (location: any): UtmParams => {
  let params = new URLSearchParams(location.search);

  if (!params.toString() && location.state?.urlParams) {
    params = new URLSearchParams(location.state.urlParams);
  }

  const utmParams: UtmParams = {};

  const utmKeys: (keyof UtmParams)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'src',
    'sck',
    'product_id'
  ];

  utmKeys.forEach(key => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  return utmParams;
};

export const getUtmString = (utmParams: UtmParams): string => {
  return Object.entries(utmParams)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

export interface TrackingData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  src?: string;
  sck?: string;
  productId?: string;
  userAgent?: string;
}

export const getTrackingData = (location: any): TrackingData => {
  const utmParams = extractUtmParams(location);

  return {
    utmSource: utmParams.utm_source,
    utmMedium: utmParams.utm_medium,
    utmCampaign: utmParams.utm_campaign,
    utmTerm: utmParams.utm_term,
    utmContent: utmParams.utm_content,
    src: utmParams.src,
    sck: utmParams.sck,
    productId: utmParams.product_id,
    userAgent: navigator.userAgent,
  };
};
