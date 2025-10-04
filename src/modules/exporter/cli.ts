#!/usr/bin/env node
// src/modules/exporter/cli.ts
import fs from 'fs';
import { TanaPaste } from '../formatter/types';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: exporter [options]

Options:
  --input <file>         Input file with TanaPaste content (default: stdin)
  --output <file>        Output file (required)
  --help                 Show this help message

Example:
  exporter --input formatted.txt --output output.txt
  cat formatted.txt | exporter --output output.txt
    `);
    process.exit(0);
  }

  if (!args.includes('--output')) {
    console.error('Error: --output is required');
    process.exit(1);
  }

  try {
    let inputData: string;

    // 读取输入
    if (args.includes('--input')) {
      const inputFile = args[args.indexOf('--input') + 1];
      inputData = fs.readFileSync(inputFile, 'utf-8');
    } else {
      inputData = fs.readFileSync(0, 'utf-8');
    }

    // 解析 TanaPaste（如果是 JSON）或直接使用（如果是纯文本）
    let content: string;
    try {
      const parsed: TanaPaste = JSON.parse(inputData);
      content = parsed.content;
    } catch {
      // 不是 JSON，直接使用原始内容
      content = inputData;
    }

    // 导出到文件
    const outputFile = args[args.indexOf('--output') + 1];
    fs.writeFileSync(outputFile, content, 'utf-8');

    console.error(`✓ Content exported to ${outputFile}`);
    console.error(`  Characters: ${content.length}`);

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

