import { defineConfig } from './ssg';

import * as sass from 'sass';
import * as marked from 'marked';

import { parse } from 'yaml';

import { execSync } from 'child_process';

import nav from './src/nav';

import twemoji from "twemoji";
import * as emoji from 'node-emoji';

import { readdir } from 'fs/promises';
import path from 'path';
import dedent from 'dedent';
import * as prettier from "prettier";
import figlet from 'figlet';

import CleanCSS from 'clean-css';

import zlib from 'zlib';

const colors: Record<string, string> = {
  "rosewater": "#f5e0dc",
  "flamingo": "#f2cddc",
  "pink": "#f5c2e7",
  "mauve": "#cba6f7",
  "red": "#ff637d",
  "maroon": "#eba0ac",
  "peach": "#ffa56e",
  "yellow": "#ffe06e",
  "green": "#93ff8a",
  "teal": "#54deab",
  "sky": "#89dceb",
  "sapphire": "#7490ec",
  "blue": "#89b4fa",
  "lavender": "#a057fe",
  "text": "#edf1ff",
  "subtext1": "#c3c8de",
  "subtext0": "#afb4c8",
  "overlay2": "#9399b2",
  "overlay1": "#7f849c",
  "overlay0": "#6c7086",
  "surface2": "#585b70",
  "surface1": "#45475a",
  "surface0": "#0f0f13",
  "base": "#000000",
  "mantle": "#040404",
  "crust": "#000000"
}

const getGitInfo = () => {
  try {
    const exec = (cmd: string) => execSync(cmd).toString().trim();
    return {
      commitHash: exec(`git rev-parse HEAD`),
      commitBranch: exec(`git rev-parse --abbrev-ref HEAD`),
      commitMessage: exec(`git log -1 --pretty=%B`),
      commitDate: exec(`git log -1 --pretty=%cd`)
    };
  } catch (error) {
    console.error("Error getting Git info:");
    console.error(error);
    return { commitHash: "", commitMessage: "", commitBranch: "", commitDate: "" };
  }
};

const getNextInObj = <T extends Object>(obj: T, key: keyof T): keyof T  => {
  const keys = Object.keys(obj);
  const index = keys.indexOf(String(key));
  if (index === -1) return keys[0] as keyof T;
  return keys[index + 1] as keyof T;
}

const parseEmojis = (markdown: string): string => {
  const emojify = (match: string) => twemoji.parse(emoji.emojify(match), {
    base: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/'
  });
  return markdown
    .replace(/<(pre|template|code)[^>]*?>[\s\S]+?<\/(pre|template|code)>/g, m => m.replace(/:/g, '__colon__'))
    .replace(/:(\w+?):/gi, emojify)
    .replace(/__colon__/g, ':');
};

const parseFilename = (filename: string): string =>
  filename.replace(/\[.*\] /g, '').replaceAll(" ", "-");

const getBlogPosts = async () => {
  const files = await readdir(path.join(__dirname, 'src/pages/blog'));
  return await Promise.all(files.map(async (file) => {
    
    const { meta } = await parseMarkdownFile(await Bun.file(`src/pages/blog/${file}`).text());
    return `
    <a href="/blog/${parseFilename(file).replace(".md", '')}" class="no-style" >
      <button class="big" style="background:var(--${meta.surface0});width:100%;padding:10px;text-align:left;--color:var(--${meta.color});">
        <h2 style="margin: 0;margin-bottom:5px;">${meta.title}</h2>
        <p style="margin:0;padding-bottom:5px;">${meta.description}</p>
        <small>${meta.date}</small>
      </button>
    </a>`;
  }));
};

const parseMarkdownFile = async (code: string) => {
  const file = code.match(/^---\n([\s\S]+?)\n---\n([\s\S]+)$/);
  if (!file) throw new Error('Invalid markdown file');
          
  const content = file ? file[2] : code;
  const meta: Record<string, string> = parse(file[1]) ?? {};

  return { content, meta };
}

const parseDateString = (dateString: string): Date => {
  const date = dateString.split(' ')[0]
  const time = dateString.split(' ')[1] + dateString.split(' ')[2]
  const [day, month, year] = date.split('/');
  const [hour, minute, second] = time.split(':');
  
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
};

const format = async (code: string, parser: prettier.Options['parser']) => await prettier.format(code, {
  parser,
  htmlWhitespaceSensitivity: "ignore",
  printWidth: Infinity,
  plugins: [(await import('@prettier/plugin-xml')).default]
})

const SITE_URL = 't3rm1n4l';
const OUTPUT_FOLDER = 'dist';

export default defineConfig({
  srcDirectory: 'src',
  publicDirectory: 'public',
  outputDirectory: OUTPUT_FOLDER,

  watch: [
    'root.html',
    'ssg.config.ts',
  ],

  plugins: [
    {
      name: 'Dart Sass',
      setup: async ({ _ }) => {
        _.addFilter('.scss', (code: string) => ({
          code: new CleanCSS({}).minify(sass.compileString(code).css.toString()).styles,
          newExtension: '.css',
          otherOutputs: [
            {
              encode: (_) => zlib.gzipSync(_),
              extension: '.css.gz'
            },
            {
              encode: (_) => zlib.brotliCompressSync(_, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY } }),
              extension: '.css.br'
            }
          ]
        }));
      },
    },
    {
      name: 'Markdown',
      setup: async ({ _ }) => {
        _.addFilter('.md', async (code: string, filename: string) => {
          const { content, meta } = await parseMarkdownFile(code);

          let templateFile = await Bun.file('root.html').text();
          let prefix = ''

          prefix = meta['page-type'] === 'post' ? dedent`
            # ${meta.title}
            <small>${meta.date} | ${meta.description}</small>
            <hr/>
          ` : '';

          templateFile = templateFile.replace('<!-- variable:content -->', await marked.parse(`${prefix}\n${content}`))
          for (const [key, value] of Object.entries(_.variables)) {
            templateFile = templateFile.replaceAll(`/* variable:${key} */`, typeof value === 'function' ? await value(meta) : value);
            templateFile = templateFile.replaceAll(`<!-- variable:${key} -->`, typeof value === 'function' ? await value(meta) : value);
          }

          const comment = `<!--
${figlet.textSync("t3rm1n4l", { font: "Small Slant" })}
${dedent`
  this HTML file was generated from "${filename}" using my own SSG!
  check out the source code at: https://github.com/T3M1N4L/site
`}
-->\n`;

          return {
            code: (comment + await format(parseEmojis(templateFile), 'html')).replaceAll(/(?<=\s*)<!-- prettier-ignore -->\n?/g, ''),
            newExtension: '.html',
            directoryPrefix: '../',
            filenameHandler: parseFilename,
            otherOutputs: [
              {
                encode: (_) => zlib.gzipSync(_),
                extension: '.html.gz'
              },
              {
                encode: (_) => zlib.brotliCompressSync(_, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY } }),
                extension: '.html.br'
              }
            ]
          }
        });
      },
      variables: {
        version: () => {
          const path = require.resolve('./package.json');
          delete require.cache[path];

          return require('./package.json').version
        },

        title: ({ title = 'Untitled' }: { title?: string }) => title === 'Home' ? '' : `${title} | `,
        'page-title': ({ title = 'Untitled' }: { title?: string }) => title,
        description: ({ description = 'No description' }: { description?: string }) => description,

        'commit-hash': getGitInfo().commitHash,
        'commit-hash-short': getGitInfo().commitHash.slice(0, 7),
        'commit-message': getGitInfo().commitMessage.trim(),
        'commit-date': new Date(getGitInfo().commitDate).toUTCString(),

        'navigation': nav.map(({ title, link, emoji }: {
          title: string;
          link: string;
          emoji: string;
        }) => `<a href="${link}" class="no-style"><button>${parseEmojis(emoji)} ${title}</button></a>`).join(''),

        color: ({ color = 'lavender' }: {
          color?: keyof typeof colors;
        }) => colors[color],
        'color-name': ({ color = 'lavender' }: {
          color?: keyof typeof colors;
        }) => color,
        'color2': ({ color = 'lavender' }: {
          color?: keyof typeof colors;
        }) => colors[getNextInObj(colors, color)],
        'color2-name': ({ color = 'lavender' }: {
          color?: keyof typeof colors;
        }) => getNextInObj(colors, color),

        styles: ({ styles = [] }: { styles?: string[] }) => styles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n'),

        'blog-posts': async () => (await getBlogPosts()).join('\n')
      }
    }
  ]
})