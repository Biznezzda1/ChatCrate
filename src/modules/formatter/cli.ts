#!/usr/bin/env node
// src/modules/formatter/cli.ts
import fs from 'fs';
import { format } from './index';
import { ExtractedContent } from '../extractor/types';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: formatter [options]

Options:
  --input <file>         JSON file with ExtractedContent (default: stdin)
  --output <file>        Output file (default: stdout)
  --help                 Show this help message

Example:
  formatter --input extracted.json --output formatted.txt
  cat extracted.json | formatter
    `);
    process.exit(0);
  }

  try {
    let inputData: string;

    // 读取输入（文件或 stdin）
    if (args.includes('--input')) {
      const inputFile = args[args.indexOf('--input') + 1];
      inputData = fs.readFileSync(inputFile, 'utf-8');
    } else {
      // 从 stdin 读取
      inputData = fs.readFileSync(0, 'utf-8');
    }

    const extracted: ExtractedContent = JSON.parse(inputData);

    // 格式化
    const formatted = await format(extracted);

    // 输出结果
    const output = formatted.content;
    
    if (args.includes('--output')) {
      const outputFile = args[args.indexOf('--output') + 1];
      fs.writeFileSync(outputFile, output, 'utf-8');
      console.error(`✓ Formatted content written to ${outputFile}`);
      console.error(`  Nodes: ${formatted.metadata.nodeCount}`);
      console.error(`  Citations: ${formatted.metadata.citationCount}`);
      console.error(`  Characters: ${formatted.metadata.characterCount}`);
    } else {
      console.log(output);
    }

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

