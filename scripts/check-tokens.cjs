#!/usr/bin/env node

/**
 * Token Compliance Checker
 * 
 * Validates that source code uses semantic design tokens instead of hardcoded values.
 * This script is CI-blocking and will fail the build if violations are found.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Patterns to detect hardcoded values
const VIOLATIONS = {
  hardcodedColors: {
    pattern: /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])|rgb\(|rgba\(|hsl\(|hsla\(/g,
    message: 'Hardcoded color value found',
    severity: 'error',
  },
  arbitraryValues: {
    pattern: /\[\d+px\]|\[\d+rem\]|\[\d+em\]/g,
    message: 'Arbitrary spacing value found',
    severity: 'error',
  },
  inlineStyles: {
    pattern: /style=\{\{[^}]*(?:color|background|padding|margin|width|height):/g,
    message: 'Inline style with layout/color properties found',
    severity: 'warning',
  },
};

// Files to check (exclude stories, tests, and example files)
const INCLUDE_PATTERNS = [
  'src/**/*.{ts,tsx}',
];

// Allowed exceptions (e.g., for specific use cases)
const ALLOWED_EXCEPTIONS = [
  // SVG viewBox attributes
  /viewBox="[^"]*"/g,
  // Data attributes
  /data-[a-z-]+="[^"]*"/g,
  // Hex in comments
  /\/\/.*#[0-9a-fA-F]{3,6}/g,
  /\/\*[\s\S]*?#[0-9a-fA-F]{3,6}[\s\S]*?\*\//g,
  // Min-width/min-height for component constraints (Radix UI patterns)
  /min-[wh]-\[[\d.]+(?:px|rem|em)\]/g,
  // Max-height for scrollable areas
  /max-h-\[[\d.]+(?:px|rem|em)\]/g,
];

class TokenChecker {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.filesChecked = 0;
  }

  async run() {
    console.log('🔍 Running token compliance check...\n');

    const files = await this.getFiles();
    
    for (const file of files) {
      this.checkFile(file);
    }

    this.printResults();
    
    if (this.violations.length > 0) {
      process.exit(1);
    }
  }

  async getFiles() {
    const files = [];
    for (const pattern of INCLUDE_PATTERNS) {
      const matches = await glob(pattern, {
        cwd: process.cwd(),
        ignore: [
          'node_modules/**',
          'dist/**',
          'coverage/**',
          'storybook-static/**',
          '**/*.stories.{ts,tsx}',
          '**/*.test.{ts,tsx}',
          '**/*.spec.{ts,tsx}',
          'src/stories/**',
        ],
      });
      files.push(...matches);
    }
    return [...new Set(files)]; // Remove duplicates
  }

  checkFile(filePath) {
    this.filesChecked++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Remove allowed exceptions from content for checking
    let cleanedContent = content;
    for (const exception of ALLOWED_EXCEPTIONS) {
      cleanedContent = cleanedContent.replace(exception, '');
    }

    for (const [name, rule] of Object.entries(VIOLATIONS)) {
      const matches = [...cleanedContent.matchAll(rule.pattern)];
      
      for (const match of matches) {
        const position = match.index;
        const lineNumber = content.substring(0, position).split('\n').length;
        const line = lines[lineNumber - 1];
        const columnNumber = position - content.lastIndexOf('\n', position - 1);

        const violation = {
          file: filePath,
          line: lineNumber,
          column: columnNumber,
          rule: name,
          message: rule.message,
          severity: rule.severity,
          code: line.trim(),
          match: match[0],
        };

        if (rule.severity === 'error') {
          this.violations.push(violation);
        } else {
          this.warnings.push(violation);
        }
      }
    }
  }

  printResults() {
    console.log(`\n📊 Token Compliance Report`);
    console.log(`${'='.repeat(80)}\n`);
    console.log(`Files checked: ${this.filesChecked}`);
    console.log(`Violations: ${this.violations.length}`);
    console.log(`Warnings: ${this.warnings.length}\n`);

    if (this.violations.length > 0) {
      console.log('❌ VIOLATIONS (CI-blocking):\n');
      
      const groupedByFile = this.groupByFile(this.violations);
      
      for (const [file, violations] of Object.entries(groupedByFile)) {
        console.log(`\n📄 ${file}`);
        for (const v of violations) {
          console.log(`  Line ${v.line}:${v.column} - ${v.message}`);
          console.log(`    ${v.code}`);
          console.log(`    Found: ${v.match}`);
        }
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('❌ Token compliance check FAILED');
      console.log('Please use semantic design tokens instead of hardcoded values.');
      console.log('See docs/TOKENS.md for guidance.\n');
    } else {
      console.log('✅ No violations found!\n');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS (non-blocking):\n');
      
      const groupedByFile = this.groupByFile(this.warnings);
      
      for (const [file, warnings] of Object.entries(groupedByFile)) {
        console.log(`\n📄 ${file}`);
        for (const w of warnings) {
          console.log(`  Line ${w.line}:${w.column} - ${w.message}`);
          console.log(`    ${w.code}`);
        }
      }
      console.log('');
    }
  }

  groupByFile(items) {
    return items.reduce((acc, item) => {
      if (!acc[item.file]) {
        acc[item.file] = [];
      }
      acc[item.file].push(item);
      return acc;
    }, {});
  }
}

// Run the checker
const checker = new TokenChecker();
checker.run().catch((error) => {
  console.error('Error running token checker:', error);
  process.exit(1);
});
