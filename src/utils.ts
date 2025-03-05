export const defaultSlugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const slugfiyFileNameBase = (
  url: string,
  slugify: (str: string) => string
) => {
  const imgExts = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];
  const urlArr = url.split("/");
  let fileName = urlArr.pop()!;
  let ext;
  if (imgExts.some((ext) => url.endsWith(ext))) {
    const fileNameArr = fileName.split(".");
    ext = fileNameArr.pop();
    fileName = fileNameArr.join(".");
  }
  url = `${slugify(fileName)}${ext ? `.${ext}` : ""}`;
  urlArr.push(url);
  return urlArr.join("/");
};
