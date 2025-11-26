-- Add RLS policy to allow deleting content
CREATE POLICY "Anyone can delete content"
ON content
FOR DELETE
USING (true);