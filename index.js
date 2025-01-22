import { visit } from "unist-util-visit";

export default function remarkConvertObsidianInternalLinks(options = {}) {
  const [linkFrom, linkTo] = options.linkPrefix ?? [];
  const [imageFrom, imageTo] = options.imagePrefix ?? [];
  const linkClass = options.linkClass ?? "link-page";
  const idClass = options.idClass ?? "link-id";
  const slugify =
    options.slugify ??
    ((str) => {
      return str
        .toLowerCase()
        .replace(/[^\w]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    });

  const imgExts = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];
  return (tree) => {
    visit(tree, "paragraph", (node) => {
      if (!node.children) return;
      const newChildren = [];
      let skipIndex = 0;
      let isBeforeObsidianInternalLink = false;

      node.children.forEach((child, index) => {
        if (index < skipIndex) return;

        if (child.type === "text") {
          let beforeTextVal = child.value;
          if (isBeforeObsidianInternalLink) {
            beforeTextVal = beforeTextVal.slice(1);
            isBeforeObsidianInternalLink = false;
          }
          let renderImage = false;
          if (
            // [[link]] will be parsed as text.value('[') + linkReference.label('link') + text.value(']')
            // find [[link]] or ![[link]]
            (beforeTextVal.endsWith("[") || beforeTextVal.endsWith("![")) &&
            node.children[index + 1]?.type === "linkReference" &&
            node.children[index + 2]?.type === "text" &&
            node.children[index + 2].value.startsWith("]")
          ) {
            // set before link flag
            isBeforeObsidianInternalLink = true;

            // remove prefix
            if (beforeTextVal.endsWith("![")) {
              renderImage = true;
              beforeTextVal = beforeTextVal.slice(0, -2);
            } else {
              beforeTextVal = beforeTextVal.slice(0, -1);
            }

            // set link url & val
            let url = node.children[index + 1].label;
            let val,
              id,
              isIdLink = false;
            if (url.includes("|")) {
              [url, val] = url.split("|");
            }
            if (url.includes("#")) {
              [url, id] = url.split("#");
            }
            if (url) {
              // slugify filenamebase
              const urlArr = url.split("/");
              let fileName = urlArr.pop();
              let ext;
              if (imgExts.some((ext) => fileName.endsWith(ext))) {
                const fileNameArr = fileName.split(".");
                ext = fileNameArr.pop();
                fileName = fileNameArr.join(".");
              }
              fileName = slugify(fileName) + (ext ? "." + ext : "");
              urlArr.push(fileName);
              url = urlArr.join("/");
            }
            if (id) {
              // slugify id
              if (!url) {
                isIdLink = true;
              }
              url = url + "#" + slugify(id);
            }

            if (
              !renderImage &&
              typeof linkFrom === "string" &&
              typeof linkTo === "string"
            ) {
              url = url.replace(linkFrom, linkTo);
            } else if (
              renderImage &&
              typeof imageFrom === "string" &&
              typeof imageTo === "string"
            ) {
              url = url.replace(imageFrom, imageTo);
            }

            if (!val) {
              if (isIdLink) {
                val = id;
              } else {
                val = url;
              }
            }

            // set new children
            newChildren.push({
              type: "text",
              value: beforeTextVal,
            });

            if (renderImage) {
              newChildren.push({
                type: "image",
                url: url,
                alt: val,
              });
            } else {
              newChildren.push({
                type: "link",
                url: url,
                data: {
                  hProperties: {
                    class: isIdLink ? idClass : linkClass,
                  },
                },
                children: [
                  {
                    type: "text",
                    value: val,
                  },
                ],
              });
            }

            skipIndex = index + 2;
          } else {
            isBeforeObsidianInternalLink = false;
            newChildren.push({
              type: "text",
              value: beforeTextVal,
            });
          }
        } else {
          isBeforeObsidianInternalLink = false;
          newChildren.push(child);
        }
      });
      node.children = newChildren;
    });
  };
}
