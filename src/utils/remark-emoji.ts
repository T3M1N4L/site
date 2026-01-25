import { visit } from "unist-util-visit";
import twemoji from "twemoji";
import * as emoji from "node-emoji";

export function remarkEmoji() {
  return (tree: any) => {
    visit(tree, ["text", "html"], (node) => {
      if (node.type === "text" || node.type === "html") {
        const emojify = (match: string) =>
          twemoji.parse(emoji.emojify(match), {
            base: "https://raw.githubusercontent.com/twitter/twemoji/master/assets/",
          });

        if (
          node.type === "html" &&
          (node.value.includes("<pre") ||
            node.value.includes("<code") ||
            node.value.includes("<template"))
        ) {
          return;
        }

        node.value = node.value.replace(/:(\w+?):/gi, emojify);
      }
    });
  };
}
