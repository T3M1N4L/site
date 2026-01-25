import twemoji from "twemoji";
import * as emoji from "node-emoji";

export const parseEmojis = (markdown: string): string => {
  const emojify = (match: string) =>
    twemoji.parse(emoji.emojify(match), {
      base: "https://raw.githubusercontent.com/twitter/twemoji/master/assets/",
    });

  return markdown
    .replace(
      /<(pre|template|code)[^>]*?>[\s\S]+?<\/(pre|template|code)>/g,
      (m) => m.replace(/:/g, "__colon__"),
    )
    .replace(/:(\w+?):/gi, emojify)
    .replace(/__colon__/g, ":");
};
