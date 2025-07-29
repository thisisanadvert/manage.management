#!/usr/bin/env node

/**
 * Static Code Analysis Tool for Unused Components and Imports
 * 
 * This tool analyzes the React codebase to identify:
 * 1. Unused React components
 * 2. Unused imports
 * 3. Dead code patterns
 * 4. Duplicate component definitions
 */

const fs = require('fs');
const path = require('path');

class CodeAnalyzer {
  constructor() {
    this.components = new Map();
    this.imports = new Map();
    this.exports = new Map();
    this.usage = new Map();
    this.srcDir = path.join(process.cwd(), 'src');
  }

  // Recursively find all TypeScript/JavaScript files
  findSourceFiles(dir = this.srcDir) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      console.error(`Directory ${dir} does not exist`);
      return files;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.findSourceFiles(fullPath));
      } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(item)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Extract component definitions from a file
  extractComponents(filePath, content) {
    const components = [];
    
    // Match function components
    const functionComponentRegex = /(?:export\s+(?:default\s+)?)?(?:const|function)\s+([A-Z][a-zA-Z0-9]*)\s*[=:]?\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*{|{)/g;
    let match;
    
    while ((match = functionComponentRegex.exec(content)) !== null) {
      components.push({
        name: match[1],
        type: 'component',
        file: filePath,
        line: content.substring(0, match.index).split('\n').length
      });
    }
    
    // Match class components
    const classComponentRegex = /(?:export\s+(?:default\s+)?)?class\s+([A-Z][a-zA-Z0-9]*)\s+extends\s+(?:React\.)?Component/g;
    
    while ((match = classComponentRegex.exec(content)) !== null) {
      components.push({
        name: match[1],
        type: 'class-component',
        file: filePath,
        line: content.substring(0, match.index).split('\n').length
      });
    }
    
    return components;
  }

  // Extract imports from a file
  extractImports(filePath, content) {
    const imports = [];
    
    // Match import statements
    const importRegex = /import\s+(?:{([^}]+)}|([a-zA-Z0-9_$]+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1]) {
        // Named imports
        const namedImports = match[1].split(',').map(imp => imp.trim());
        for (const namedImport of namedImports) {
          imports.push({
            name: namedImport,
            type: 'named',
            from: match[3],
            file: filePath,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      } else if (match[2]) {
        // Default import
        imports.push({
          name: match[2],
          type: 'default',
          from: match[3],
          file: filePath,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }
    
    return imports;
  }

  // Find usage of components/imports in content
  findUsage(content, componentName) {
    const usageRegex = new RegExp(`\\b${componentName}\\b`, 'g');
    const matches = content.match(usageRegex);
    return matches ? matches.length : 0;
  }

  // Analyze a single file
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.srcDir, filePath);
      
      // Extract components and imports
      const components = this.extractComponents(filePath, content);
      const imports = this.extractImports(filePath, content);
      
      // Store components
      for (const component of components) {
        if (!this.components.has(component.name)) {
          this.components.set(component.name, []);
        }
        this.components.get(component.name).push(component);
      }
      
      // Store imports
      for (const imp of imports) {
        if (!this.imports.has(imp.name)) {
          this.imports.set(imp.name, []);
        }
        this.imports.get(imp.name).push(imp);
      }
      
      // Check usage of all known components in this file
      for (const [componentName] of this.components) {
        const usageCount = this.findUsage(content, componentName);
        if (usageCount > 0) {
          if (!this.usage.has(componentName)) {
            this.usage.set(componentName, []);
          }
          this.usage.get(componentName).push({
            file: filePath,
            count: usageCount
          });
        }
      }
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }

  // Run the complete analysis
  analyze() {
    console.log('🔍 Starting static code analysis...\n');
    
    const sourceFiles = this.findSourceFiles();
    console.log(`Found ${sourceFiles.length} source files to analyze\n`);
    
    // First pass: collect all components and imports
    for (const file of sourceFiles) {
      this.analyzeFile(file);
    }
    
    // Second pass: analyze usage
    for (const file of sourceFiles) {
      this.analyzeFile(file);
    }
    
    this.generateReport();
  }

  // Generate analysis report
  generateReport() {
    console.log('📊 STATIC CODE ANALYSIS REPORT');
    console.log('================================\n');
    
    // Find unused components
    const unusedComponents = [];
    const duplicateComponents = [];
    
    for (const [componentName, definitions] of this.components) {
      const usage = this.usage.get(componentName) || [];
      
      // Check for duplicates
      if (definitions.length > 1) {
        duplicateComponents.push({
          name: componentName,
          definitions: definitions
        });
      }
      
      // Check for unused (excluding the file where it's defined)
      const usageInOtherFiles = usage.filter(u => 
        !definitions.some(def => def.file === u.file)
      );
      
      if (usageInOtherFiles.length === 0) {
        unusedComponents.push({
          name: componentName,
          definitions: definitions
        });
      }
    }
    
    // Report unused components
    console.log('🚫 UNUSED COMPONENTS:');
    if (unusedComponents.length === 0) {
      console.log('   ✅ No unused components found!\n');
    } else {
      for (const component of unusedComponents) {
        console.log(`   ❌ ${component.name}`);
        for (const def of component.definitions) {
          const relativePath = path.relative(this.srcDir, def.file);
          console.log(`      📁 ${relativePath}:${def.line}`);
        }
        console.log('');
      }
    }
    
    // Report duplicate components
    console.log('🔄 DUPLICATE COMPONENTS:');
    if (duplicateComponents.length === 0) {
      console.log('   ✅ No duplicate components found!\n');
    } else {
      for (const component of duplicateComponents) {
        console.log(`   ⚠️  ${component.name} (${component.definitions.length} definitions)`);
        for (const def of component.definitions) {
          const relativePath = path.relative(this.srcDir, def.file);
          console.log(`      📁 ${relativePath}:${def.line}`);
        }
        console.log('');
      }
    }
    
    // Summary statistics
    console.log('📈 SUMMARY STATISTICS:');
    console.log(`   📦 Total components found: ${this.components.size}`);
    console.log(`   🚫 Unused components: ${unusedComponents.length}`);
    console.log(`   🔄 Duplicate components: ${duplicateComponents.length}`);
    console.log(`   📥 Total imports: ${this.imports.size}`);
    
    // Calculate cleanup potential
    const cleanupPotential = unusedComponents.length + duplicateComponents.length;
    if (cleanupPotential > 0) {
      console.log(`   🧹 Cleanup potential: ${cleanupPotential} components can be reviewed\n`);
    } else {
      console.log(`   ✨ Codebase is clean! No obvious cleanup needed.\n`);
    }
    
    // Generate detailed report file
    this.generateDetailedReport(unusedComponents, duplicateComponents);
  }

  // Generate detailed report file
  generateDetailedReport(unusedComponents, duplicateComponents) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalComponents: this.components.size,
        unusedComponents: unusedComponents.length,
        duplicateComponents: duplicateComponents.length,
        totalImports: this.imports.size
      },
      unusedComponents: unusedComponents.map(comp => ({
        name: comp.name,
        files: comp.definitions.map(def => ({
          path: path.relative(this.srcDir, def.file),
          line: def.line,
          type: def.type
        }))
      })),
      duplicateComponents: duplicateComponents.map(comp => ({
        name: comp.name,
        count: comp.definitions.length,
        files: comp.definitions.map(def => ({
          path: path.relative(this.srcDir, def.file),
          line: def.line,
          type: def.type
        }))
      }))
    };
    
    fs.writeFileSync('static_analysis_report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: static_analysis_report.json');
  }
}

// Run the analyzer if this script is executed directly
if (require.main === module) {
  const analyzer = new CodeAnalyzer();
  analyzer.analyze();
}

module.exports = CodeAnalyzer;
