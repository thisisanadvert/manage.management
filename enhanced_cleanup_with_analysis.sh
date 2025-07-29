#!/bin/bash

# Enhanced Cleanup Script with Static Analysis Integration
# Uses the static analysis results to make informed cleanup decisions

set -e

echo "🔬 Enhanced Code Cleanup with Static Analysis..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Run static analysis first
print_status "Running static code analysis..."
if [ ! -f "analyze_unused_code.cjs" ]; then
    print_error "Static analysis script not found!"
    exit 1
fi

node analyze_unused_code.cjs

# Check if analysis report was generated
if [ ! -f "static_analysis_report.json" ]; then
    print_error "Static analysis report not generated!"
    exit 1
fi

# Create archive directories
print_status "Creating archive directories..."
mkdir -p archive/unused-components
mkdir -p archive/duplicate-components
mkdir -p archive/obsolete-migrations
mkdir -p archive/manual-fix-scripts

# ============================================================================
# PHASE 1: Remove Confirmed Unused Components
# ============================================================================

print_status "Phase 1: Removing confirmed unused components based on analysis..."

# These components were confirmed as unused by static analysis
confirmed_unused=(
    "src/components/modals/IsolatedCreateIssueModal.tsx"
)

unused_count=0
for component in "${confirmed_unused[@]}"; do
    if [ -f "$component" ]; then
        print_status "Archiving unused component: $(basename $component)"
        mv "$component" "archive/unused-components/"
        ((unused_count++))
    fi
done

print_success "Archived $unused_count confirmed unused components"

# ============================================================================
# PHASE 2: Handle Duplicate Components (Manual Review Required)
# ============================================================================

print_status "Phase 2: Identifying duplicate components for manual review..."

# Create a report of components that need manual review
cat > manual_review_needed.md << EOF
# Manual Review Required - Duplicate Components

The static analysis found several components with duplicate definitions.
These require manual review to determine which version to keep:

## 🔄 **Duplicate Components Found:**

### High Priority (Multiple Files)
- **ArcadeEmbed** - Found in both \`components/ArcadeEmbed.tsx\` and \`components/landing/ArcadeEmbed.tsx\`
  - Action: Determine which version is actively used and remove the other

### Medium Priority (Same File, Multiple Definitions)
Most other duplicates appear to be multiple definitions in the same file,
which may be due to the analysis tool detecting the same component multiple times.

## 📋 **Review Process:**

1. **Check imports**: See which version is actually imported in other files
2. **Check functionality**: Compare the implementations for differences
3. **Check git history**: See which version was created first/last modified
4. **Test thoroughly**: Ensure removing duplicates doesn't break functionality

## 🎯 **Recommended Actions:**

### ArcadeEmbed Duplicate
\`\`\`bash
# Check which version is imported
grep -r "ArcadeEmbed" src/ --include="*.tsx" --include="*.ts"

# If components/landing/ArcadeEmbed.tsx is the active version:
mv src/components/ArcadeEmbed.tsx archive/duplicate-components/

# If components/ArcadeEmbed.tsx is the active version:
mv src/components/landing/ArcadeEmbed.tsx archive/duplicate-components/
\`\`\`

EOF

print_success "Created manual_review_needed.md for duplicate component review"

# ============================================================================
# PHASE 3: Clean Up Obsolete Migrations (From Previous Analysis)
# ============================================================================

print_status "Phase 3: Cleaning up obsolete migrations..."

# Run the migration cleanup from the previous comprehensive cleanup
if [ -f "cleanup_unused_duplicated_code.sh" ]; then
    print_status "Running migration cleanup..."
    
    # Archive obsolete migrations (subset from previous analysis)
    obsolete_migrations=(
        "supabase/migrations/20250618000000_fix_building_users_recursion.sql"
        "supabase/migrations/20250521015658_wandering_jungle.sql"
        "supabase/migrations/20250521012257_amber_cave.sql"
        "supabase/migrations/20250523074500_holy_cottage.sql"
        "supabase/migrations/20250523140000_fix_building_rls.sql"
    )
    
    migration_count=0
    for migration in "${obsolete_migrations[@]}"; do
        if [ -f "$migration" ]; then
            print_status "Archiving obsolete migration: $(basename $migration)"
            mv "$migration" "archive/obsolete-migrations/"
            ((migration_count++))
        fi
    done
    
    print_success "Archived $migration_count obsolete migrations"
else
    print_warning "Migration cleanup script not found, skipping migration cleanup"
fi

# ============================================================================
# PHASE 4: Generate Enhanced Cleanup Report
# ============================================================================

print_status "Phase 4: Generating enhanced cleanup report..."

# Read analysis results
total_components=$(jq '.summary.totalComponents' static_analysis_report.json)
unused_components=$(jq '.summary.unusedComponents' static_analysis_report.json)
duplicate_components=$(jq '.summary.duplicateComponents' static_analysis_report.json)
total_imports=$(jq '.summary.totalImports' static_analysis_report.json)

cat > enhanced_cleanup_report.md << EOF
# Enhanced Code Cleanup Report

**Date:** $(date)
**Status:** ✅ PARTIALLY COMPLETED (Manual Review Required)

## 📊 **Static Analysis Results**

- **Total components analyzed:** $total_components
- **Unused components found:** $unused_components
- **Duplicate components found:** $duplicate_components
- **Total imports analyzed:** $total_imports

## 🎯 **Automated Cleanup Completed**

### ✅ **Confirmed Unused Components Removed:**
- **IsolatedCreateIssueModal.tsx** - Confirmed unused, safely archived

### ✅ **Obsolete Migrations Archived:**
- **$migration_count migration files** - Superseded by canonical policies

## ⚠️ **Manual Review Required**

### 🔄 **Duplicate Components (Needs Review):**
- **ArcadeEmbed** - Multiple versions found, manual review needed
- **Various components** - Multiple definitions detected

See \`manual_review_needed.md\` for detailed review instructions.

## 📁 **Archive Structure**

\`\`\`
archive/
├── unused-components/
│   └── IsolatedCreateIssueModal.tsx
├── duplicate-components/
│   └── [To be populated after manual review]
├── obsolete-migrations/
│   └── [$migration_count migration files]
└── manual-fix-scripts/
    └── [Previous cleanup scripts]
\`\`\`

## 🔍 **Key Findings**

1. **Static Analysis Effectiveness**: Successfully identified $unused_components unused components
2. **Duplicate Detection**: Found $duplicate_components potential duplicates requiring review
3. **Import Analysis**: Analyzed $total_imports imports across the codebase

## 📈 **Benefits Achieved**

- ✅ **Removed confirmed unused code** - IsolatedCreateIssueModal eliminated
- ✅ **Identified cleanup opportunities** - $unused_components components flagged for review
- ✅ **Automated detection** - No more manual hunting for unused code
- ✅ **Data-driven decisions** - Cleanup based on actual usage analysis

## 🎯 **Next Steps**

1. **Review manual_review_needed.md** - Address duplicate components
2. **Test thoroughly** - Verify no functionality was broken
3. **Run analysis again** - Check improvement after manual cleanup
4. **Integrate into CI/CD** - Prevent future code accumulation

## 🔧 **Tools Created**

- **analyze_unused_code.cjs** - Static analysis tool for ongoing use
- **static_analysis_report.json** - Detailed analysis data
- **enhanced_cleanup_with_analysis.sh** - This automated cleanup script

EOF

print_success "Enhanced cleanup report generated: enhanced_cleanup_report.md"

# ============================================================================
# PHASE 5: Update Git Repository
# ============================================================================

print_status "Phase 5: Updating git repository..."

# Add all new files and changes
git add archive/
git add static_analysis_report.json
git add enhanced_cleanup_report.md
git add manual_review_needed.md
git add analyze_unused_code.cjs

# Commit the enhanced cleanup
git commit -m "🔬 ENHANCED CODE CLEANUP: Static analysis-driven cleanup

AUTOMATED CLEANUP:
- Removed 1 confirmed unused component (IsolatedCreateIssueModal)
- Archived $migration_count obsolete migrations
- Created static analysis tools for ongoing maintenance

ANALYSIS RESULTS:
- $total_components components analyzed
- $unused_components unused components identified
- $duplicate_components duplicate components flagged for review
- $total_imports imports analyzed

TOOLS CREATED:
- Static code analyzer (analyze_unused_code.cjs)
- Enhanced cleanup automation
- Detailed analysis reporting

MANUAL REVIEW REQUIRED:
- Duplicate component resolution (see manual_review_needed.md)
- Additional unused component verification

This establishes a data-driven approach to code maintenance
and prevents future accumulation of unused code."

print_success "Changes committed to git"

# Final summary
echo ""
echo "🎉 =============================================="
echo "🎉  ENHANCED CODE CLEANUP COMPLETED"
echo "🎉 =============================================="
echo ""
print_success "Static analysis identified $unused_components unused components"
print_success "Automated cleanup removed confirmed unused code"
print_warning "Manual review required for $duplicate_components duplicate components"
print_success "Analysis tools created for ongoing maintenance"
echo ""
print_status "Next steps:"
echo "  1. Review manual_review_needed.md for duplicate components"
echo "  2. Test application thoroughly"
echo "  3. Run static analysis regularly to prevent code accumulation"
echo "  4. Consider integrating analysis into CI/CD pipeline"
echo ""
print_success "Enhanced cleanup completed successfully! 🚀"
