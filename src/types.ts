export type ObsidianLinkOptions = {
  linkPrefix?: [string|RegExp, string];
  imagePrefix?: [string|RegExp, string];
  linkClass?: string;
  idClass?: string;
  slugify?: (str: string) => string;
};
