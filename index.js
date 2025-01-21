import { visit } from "unist-util-visit";

export default function remarkConvertObsidianInternalLinks(options = {}) {
  const [linkFrom, linkTo] = options.linkPrefix ?? [];
  const [imageFrom, imageTo] = options.imagePrefix ?? [];
  const slugify =
    options.slugify ??
    ((str) => {
      return str
        .toLowerCase()
        .replace(/[^\w]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    });

  return (tree) => {
    visit(tree, "paragraph", (node) => {
      if (!node.children) return;
      // [[link]] will be parsed as text.value('[') + linkReference.label('link') + text.value(']')

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
            let linkUrl = node.children[index + 1].label;
            let linkVal,
              linkTag,
              isLinkTag = false;
            if (linkUrl.includes("|")) {
              [linkUrl, linkVal] = linkUrl.split("|");
            }
            if (linkUrl.includes("#")) {
              [linkUrl, linkTag] = linkUrl.split("#");
            }
            if (linkTag) {
              if (!linkUrl) {
                isLinkTag = true;
              }
              linkUrl = linkUrl + "#" + slugify(linkTag);
            }

            if (
              !renderImage &&
              typeof linkFrom === "string" &&
              typeof linkTo === "string"
            ) {
              linkUrl = linkUrl.replace(linkFrom, linkTo);
            } else if (
              renderImage &&
              typeof imageFrom === "string" &&
              typeof imageTo === "string"
            ) {
              linkUrl = linkUrl.replace(imageFrom, imageTo);
            }

            if (!linkVal) {
              if (isLinkTag) {
                linkVal = linkTag;
              } else {
                linkVal = linkUrl;
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
                url: linkUrl,
                alt: linkVal,
              });
            } else {
              newChildren.push({
                type: "link",
                url: linkUrl,
                children: [
                  {
                    type: "text",
                    value: linkVal,
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
