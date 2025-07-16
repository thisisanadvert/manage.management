-- Fix Transactions RLS Policy
-- Run this in Supabase SQL Editor to allow transaction creation

-- Add missing INSERT policy for transactions
CREATE POLICY "Users can create transactions for their buildings"
  ON transactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = transactions.building_id
    AND building_users.user_id = auth.uid()
  ));

-- Also add UPDATE policy in case it's needed for approval workflow
CREATE POLICY "Users can update transactions for their buildings"
  ON transactions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = transactions.building_id
    AND building_users.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = transactions.building_id
    AND building_users.user_id = auth.uid()
  ));
