#!/usr/bin/env node
// src/modules/extractor/cli.ts
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { extract, detectPageType } from './index';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: extractor <html-file> [options]

Options:
  --format <json|text>   Output format (default: json)
  --help                 Show this help message

Example:
  extractor sample.html --format json
    `);
    process.exit(0);
  }

  const htmlFile = args[0];
  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'json';

  try {
    // 读取 HTML 文件
    const html = fs.readFileSync(htmlFile, 'utf-8');
    const dom = new JSDOM(html, { url: 'https://www.perplexity.ai/search/test' });
    const doc = dom.window.document;

    // 检测页面类型
    const pageType = detectPageType(doc);

    // 提取内容
    const extracted = await extract(doc, pageType);

    // 输出结果
    if (format === 'json') {
      console.log(JSON.stringify(extracted, null, 2));
    } else {
      console.log(`Query: ${extracted.query}`);
      console.log(`\nAnswer:\n${extracted.answer}`);
      console.log(`\nCitations: ${extracted.citations.length}`);
      extracted.citations.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.title} - ${c.url}`);
      });
      console.log(`\nMedia: ${extracted.media.length} items`);
    }

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

