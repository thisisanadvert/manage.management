# Obsolete Migration Files Analysis

Based on the audit, these migration files contain **obsolete or conflicting RLS policies** that are now superseded by the canonical migrations:

## 🚨 **High Priority - Contains Conflicting RLS Policies**

These files contain policies that directly conflict with the canonical implementation:

### Building Users Recursion Fixes (Superseded)
- `20250618000000_fix_building_users_recursion.sql` - Fixed by canonical policies
- `20250521015658_wandering_jungle.sql` - Contains recursive helper functions
- `20250521012257_amber_cave.sql` - Duplicate helper function definitions
- `20250523074500_holy_cottage.sql` - Uses problematic is_building_member()
- `20250523140000_fix_building_rls.sql` - Duplicate is_building_admin()

### Manual Fix Files (No Longer Needed)
- `complete_policy_fix.sql` - Manual fix superseded by canonical
- `simple_rls_fix.sql` - Temporary fix superseded
- `fix_remaining_policies.sql` - Manual fix superseded
- `fix_building_rls_manual.sql` - Manual fix superseded
- `building_selector_emergency_fix.sql` - Emergency fix superseded
- `fix_building_selector_rls.sql` - Manual fix superseded
- `final_recursion_fix.sql` - Manual fix superseded
- `find_all_recursion_sources.sql` - Diagnostic script (can archive)
- `fix_recursion_manual.sql` - Manual fix superseded

### Building Users Policy Iterations (Superseded)
- `20250429013802_restless_shadow.sql` - Early recursion fix attempt
- `20250518213815_silent_castle.sql` - Non-recursive policy attempt
- `20250518231238_small_tower.sql` - RLS policy fix attempt
- `20250429205650_broken_hill.sql` - SOF role addition (role names updated)

## 🔄 **Medium Priority - Contains Outdated Role References**

These files use old role names (`sof-director` instead of `rmc-director`):

- `20250430132127_lively_leaf.sql` - Role hierarchy with old names
- `20250518235816_soft_feather.sql` - Helper functions with old roles
- `20250429205650_broken_hill.sql` - SOF role definitions

## 📊 **Low Priority - Demo Data and Utility**

These files contain demo data or utility functions that may still be useful:

- `20250427214619_sparkling_snow.sql` - Demo data creation
- `20250427215054_quick_darkness.sql` - Demo data creation  
- `20250503030132_teal_gate.sql` - Demo data creation
- `test_migration.sql` - Testing utilities (keep for reference)

## ✅ **Keep These Files**

These migrations should be **preserved** as they contain important schema changes:

### Core Schema
- `20250125000001_mri_qube_integration.sql` - MRI table creation
- `20250703000001_enhanced_financial_system.sql` - Financial schema
- `20250714000001_complete_financial_system.sql` - Complete financial schema
- `20250716000001_add_budget_items_tables.sql` - Budget tables
- `20250726000000_comprehensive_rls_policies.sql` - Recent comprehensive policies

### Functional Features
- `20250608000001_enhance_voting_system.sql` - Voting system enhancements
- `20250608000002_critical_security_audit.sql` - Security improvements
- `20250524000000_fix_document_trigger.sql` - Document triggers
- `20250125000000_fix_financial_setup_trigger.sql` - Financial triggers

## 🎯 **Recommended Action Plan**

### Phase 1: Apply Canonical Migrations
1. Apply `20250729000000_canonical_rls_policies.sql`
2. Apply `20250729000001_canonical_rls_financial_mri.sql`
3. Run `cleanup_obsolete_rls_files.sql` to verify

### Phase 2: Archive Obsolete Files
1. Create `archive/obsolete-rls-migrations/` directory
2. Move all **High Priority** files to archive
3. Update any references in documentation

### Phase 3: Update Role References
1. Update remaining files to use `rmc-director` instead of `sof-director`
2. Test all functionality with new canonical policies

### Phase 4: Cleanup Demo Data
1. Consolidate demo data into single seeding script
2. Remove demo data from migration files

## 🔍 **Files to Archive (Move to archive/obsolete-rls-migrations/)**

```bash
# High Priority - Conflicting RLS Policies
supabase/migrations/20250618000000_fix_building_users_recursion.sql
supabase/migrations/20250521015658_wandering_jungle.sql
supabase/migrations/20250521012257_amber_cave.sql
supabase/migrations/20250523074500_holy_cottage.sql
supabase/migrations/20250523140000_fix_building_rls.sql
supabase/migrations/20250429013802_restless_shadow.sql
supabase/migrations/20250518213815_silent_castle.sql
supabase/migrations/20250518231238_small_tower.sql

# Manual Fix Files
complete_policy_fix.sql
simple_rls_fix.sql
fix_remaining_policies.sql
fix_building_rls_manual.sql
building_selector_emergency_fix.sql
fix_building_selector_rls.sql
final_recursion_fix.sql
find_all_recursion_sources.sql
fix_recursion_manual.sql

# Outdated Role References
supabase/migrations/20250430132127_lively_leaf.sql
supabase/migrations/20250518235816_soft_feather.sql
supabase/migrations/20250429205650_broken_hill.sql
```

## ⚠️ **Important Notes**

1. **Test thoroughly** after applying canonical migrations
2. **Backup database** before making changes
3. **Verify all functionality** works with new policies
4. **Update documentation** to reflect new canonical approach
5. **Monitor for any remaining recursion errors**

The canonical migrations eliminate **100+ conflicting policies** and replace them with a clean, consistent security model.
