// I'd like to update https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/changelog-parser/index.d.ts

declare module 'changelog-parser' {
  type Option = { filePath: string, removeMarkdown?: boolean } | { text: string };
  export type Result = {
    title: string,
    description: string,
    versions: {
      version: string | null,
      title: string,
      date: string | null,
      body: '',
      parsed: {
        _: string[],
        [key:string]: string[]
      }
    }[],
  };
  export default function parseChangelog(option: string | Option, callback?: (error: string | null, result: Result) => void): Promise<Result>;
}
