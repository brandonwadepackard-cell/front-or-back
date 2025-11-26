-- Create a function to generate notifications for content changes
CREATE OR REPLACE FUNCTION public.notify_content_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  notification_link TEXT;
BEGIN
  -- Set notification link
  notification_link := '/history';
  
  -- Handle INSERT (new content created)
  IF TG_OP = 'INSERT' THEN
    notification_type := 'success';
    
    IF NEW.scheduled_at IS NOT NULL THEN
      notification_title := 'Content Scheduled';
      notification_message := format('New %s content scheduled for %s: %s', 
        NEW.platform, 
        to_char(NEW.scheduled_at, 'Mon DD at HH24:MI'),
        substring(NEW.content, 1, 50) || CASE WHEN length(NEW.content) > 50 THEN '...' ELSE '' END
      );
    ELSE
      notification_title := 'Content Created';
      notification_message := format('New %s content created: %s', 
        NEW.platform,
        substring(NEW.content, 1, 50) || CASE WHEN length(NEW.content) > 50 THEN '...' ELSE '' END
      );
    END IF;
    
  -- Handle UPDATE (content rescheduled or status changed)
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only create notification if scheduled_at changed or status changed
    IF OLD.scheduled_at IS DISTINCT FROM NEW.scheduled_at THEN
      notification_type := 'info';
      notification_title := 'Content Rescheduled';
      notification_message := format('%s content rescheduled to %s', 
        NEW.platform,
        to_char(NEW.scheduled_at, 'Mon DD at HH24:MI')
      );
    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
      notification_type := CASE 
        WHEN NEW.status = 'published' THEN 'success'
        WHEN NEW.status = 'failed' THEN 'error'
        ELSE 'info'
      END;
      notification_title := format('Content Status: %s', initcap(NEW.status));
      notification_message := format('%s content status changed to %s', 
        NEW.platform,
        NEW.status
      );
    ELSE
      -- No notification needed for other updates
      RETURN NEW;
    END IF;
  END IF;
  
  -- Insert the notification
  INSERT INTO public.notifications (title, message, type, link)
  VALUES (notification_title, notification_message, notification_type, notification_link);
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT operations
CREATE TRIGGER content_created_trigger
AFTER INSERT ON public.content
FOR EACH ROW
EXECUTE FUNCTION public.notify_content_changes();

-- Create trigger for UPDATE operations
CREATE TRIGGER content_updated_trigger
AFTER UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION public.notify_content_changes();

-- Add a sample comment to document the triggers
COMMENT ON FUNCTION public.notify_content_changes() IS 'Automatically generates notifications when content is created, scheduled, or status changes';