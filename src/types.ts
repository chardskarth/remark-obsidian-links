export type ObsidianLinkOptions = {
  linkPrefix?: [string, string];
  imagePrefix?: [string, string];
  linkClass?: string;
  idClass?: string;
  slugify?: (str: string) => string;
};
