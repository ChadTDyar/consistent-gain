-- Fix 1: Allow users to delete their own profiles (GDPR compliance)
CREATE POLICY "Users can delete own profile" 
ON profiles FOR DELETE 
USING (auth.uid() = id);

-- Fix 2: Allow users to edit/delete their chat messages
CREATE POLICY "Users can update own messages" 
ON chat_messages FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" 
ON chat_messages FOR DELETE 
USING (auth.uid() = user_id);

-- Fix 3: Allow users to manage coach trigger settings
CREATE POLICY "Users can update own triggers" 
ON coach_triggers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own triggers" 
ON coach_triggers FOR DELETE 
USING (auth.uid() = user_id);