import { visit } from "unist-util-visit";
import { ObsidianLinkOptions } from "./types.js";
import { PhrasingContent, Root } from "mdast";
import { defaultSlugify, slugfiyFileNameBase } from "./utils.js";

export default function remarkConvertObsidianInternalLinks(
  options?: ObsidianLinkOptions
) {
  // declare variables
  const [linkPattern, linkSubst] = options?.linkPrefix ?? [];
  const [imagePattern, imageSubst] = options?.imagePrefix ?? [];
  const linkClass = options?.linkClass ?? "link-page";
  const idClass = options?.idClass ?? "link-id";
  const slugify = options?.slugify ?? defaultSlugify;

  return (tree: Root) => {
    visit(tree, "paragraph", (p) => {
      if (!p.children) return;

      const substChildren: PhrasingContent[] = [];
      let skipIndex = 0;
      let wasTarget = false;

      p.children.forEach((node, i) => {
        if (i < skipIndex) return;

        if (node.type === "text") {
          let forImage = false;
          let textBeforeLinkVal = node.value;

          // remove prefix ']' from Text here if it was a target
          if (wasTarget) {
            textBeforeLinkVal = textBeforeLinkVal.slice(1);
            wasTarget = false;
          }

          /** find [[link]] or ![[link]].
           * [[link]] will be parsed as
           * text.value('*[') + linkReference.label('link') + text.value(']*')
           */
          const nextEl1 = p.children[i + 1];
          const nextEl2 = p.children[i + 2];
          // console.log(`textBeforeLinkVal: ${textBeforeLinkVal}`);
          if (
            (textBeforeLinkVal.endsWith("[") ||
              textBeforeLinkVal.endsWith("![")) &&
            nextEl1?.type === "linkReference" &&
            nextEl2?.type === "text" &&
            nextEl2.value.startsWith("]")
          ) {
            // set target predicate flag
            wasTarget = true;

            // remove prefix `[` or `![`
            if (textBeforeLinkVal.endsWith("![")) {
              // case: image
              forImage = true;
              textBeforeLinkVal = textBeforeLinkVal.slice(0, -2);
            } else {
              // case: link
              textBeforeLinkVal = textBeforeLinkVal.slice(0, -1);
            }
            // set link url & url text
            let url = nextEl1.label ?? "";
            let urlText,
              id,
              isIdLink = false;
            if (url.includes("|")) {
              [url, urlText] = url.split("|") as [string, string];
            }
            if (url.includes("#")) {
              [url, id] = url.split("#") as [string, string];
            }
            if (url) {
              // slugify filename-base
              url = slugfiyFileNameBase(url, slugify);
            }
            if (id) {
              // slugify id
              if (!url) {
                isIdLink = true;
              }
              url = url + "#" + slugify(id);
            }

            if (
              !forImage &&
              typeof linkPattern === "string" &&
              typeof linkSubst === "string"
            ) {
              url = url.replace(linkPattern, linkSubst);
            } else if (
              forImage &&
              typeof imagePattern === "string" &&
              typeof imageSubst === "string"
            ) {
              url = url.replace(imagePattern, imageSubst);
            }

            if (!urlText) {
              if (isIdLink) {
                urlText = id;
              } else {
                urlText = url;
              }
            }

            // set subst children
            substChildren.push({
              type: "text",
              value: textBeforeLinkVal,
            });
            if (forImage) {
              substChildren.push({
                type: "image",
                url: url,
                alt: urlText,
              });
            } else {
              substChildren.push({
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
                    value: urlText!,
                  },
                ],
              });
            }

            skipIndex = i + 2;
          } else {
            wasTarget = false;
            // if was Target, the ']' was removed
            substChildren.push({
              type: "text",
              value: textBeforeLinkVal,
            });
          }
        } else {
          wasTarget = false;
          substChildren.push(node);
        }
      });
      // substitute children
      p.children = substChildren;
    });
  };
}
