import { readdir, rm, mkdir, stat, cp } from 'fs/promises';
import path from 'path';

type Variables = Record<string, string | ((...args: { [key: string]: any }[]) => string | Promise<string>)>;

interface Plugin {
  name: string;
  setup: (api: { _: API }) => void;
  variables?: Variables;
}

interface Config {
  srcDirectory: string;
  outputDirectory: string;
  publicDirectory: string;
  plugins: Plugin[];
  watch?: string[];
}

interface FilterOutput {
  code: string;
  newExtension?: string;
  directoryPrefix?: string;
  filenameHandler?: (filename: string) => string;
  otherOutputs?: {
    encode: (code: string) => string | Buffer | Promise<string | Buffer>;
    extension: string;
  }[];
}

interface API {
  addFilter: (name: string, fn: FilterFunction) => void;
  variables: Variables;
}

type FilterFunction = (code: string, filename: string) => FilterOutput | Promise<FilterOutput>;
const filters: Map<string, FilterFunction> = new Map();

const adjustRelativePaths = (content: string, filePath: string): string => {
  const directory = path.dirname(filePath);
  return content.replace(/(href|src)="(?!\/)([^"]+)"/g, (_, attr, link) => {
    const relativePath = path.relative(directory, path.join(directory, link));
    return `${attr}="${relativePath.startsWith('.') ? relativePath : link}"`;
  });
};


const build = async () => {
  const modulePath = require.resolve('./ssg.config.ts');
  delete require.cache[modulePath];

  const config = (await import('./ssg.config.ts')).default as Config;

  await rm(config.outputDirectory, { recursive: true, force: true });
  await mkdir(config.outputDirectory, { recursive: true });

  console.log('Building...');

  config.plugins.forEach(async (plugin) => {
    plugin.setup({
      _: {
        addFilter: (name: string, fn: FilterFunction) => {
          filters.set(name, fn);
        },
        variables: plugin.variables ?? {},
      },
    });
  });

  console.log(`Loaded up ${filters.size} filters`);

  const walkDir = async (dir: string, fileList: string[] = []): Promise<string[]> => {
    const files = await readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if ((await stat(filePath)).isDirectory()) {
        fileList = await walkDir(filePath, fileList);
      } else {
        fileList.push(path.relative(config.srcDirectory, filePath));
      }
    }
    return fileList;
  };

  const srcFiles = await walkDir(config.srcDirectory);

  for (const file of srcFiles) {
    const realPath = path.join(config.srcDirectory, file);

    if ((await stat(realPath)).isDirectory()) {
      await mkdir(path.join(config.outputDirectory, file), { recursive: true });
      continue;
    }

    const fileContent = await Bun.file(realPath).text();
    const extname = path.extname(file);

    if (filters.has(extname)) {
      const filter = filters.get(extname)!;
      const { code, directoryPrefix, newExtension, filenameHandler, otherOutputs } = await filter(fileContent, realPath);

      let outPath = path.join(config.outputDirectory, file);

      if (directoryPrefix != null) {
        const [first, ...rest] = path.dirname(file).split('/');
        let filename = file.split('/').pop()!;
        if (filenameHandler != null) {
          filename = filenameHandler(filename);
        }
        outPath = path.join(config.outputDirectory, first, directoryPrefix!, ...rest, filename);
      } else if (filenameHandler != null) {
        outPath = path.join(config.outputDirectory, path.dirname(file), filenameHandler(path.basename(file)));
      }

      if (newExtension != null) {
        outPath = outPath.replace(extname, newExtension);
      }

      const adjustedCode = adjustRelativePaths(code, outPath);

      console.log(`Writing to ${outPath}`);
      await Bun.write(outPath, adjustedCode);

      if (otherOutputs != null) {
        for (const { encode, extension } of otherOutputs) {
          const outPath = path.join(config.outputDirectory, file.replace(extname, extension));
          console.log(`Writing to ${outPath}`);
          await Bun.write(outPath, await encode(adjustedCode) as string);
        }
      }
    }
  }

  await cp(config.publicDirectory, config.outputDirectory, { recursive: true });
};

export const defineConfig = (config: Config) => config;

if (process.argv[2] === 'build') {
  build();
} else if (process.argv[2] === 'watch' || process.argv[2] === 'serve') {
  const { default: ssgConfig } = await import('./ssg.config.ts');

  const { debounce } = await import('lodash');
  const chokidar = await import('chokidar');

  const debouncedBuild = debounce(build, 500);
  chokidar.watch([ssgConfig.srcDirectory, ...(ssgConfig.watch ?? [])]).on('all', debouncedBuild);

  if (process.argv[2] === 'serve') {
    const http = require('http');
    const handler = require('serve-handler');
    http
      .createServer((req: any, res: any) =>
        handler(req, res, {
          public: ssgConfig.outputDirectory,
          headers: {
            'Accept-Encoding': 'gzip, compress, br',
          },
        })
      )
      .listen(8080);
    console.log('Listening on http://localhost:8080');
  }
}