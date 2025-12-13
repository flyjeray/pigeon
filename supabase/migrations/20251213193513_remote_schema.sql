set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.broadcast_new_msg()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
    perform realtime.broadcast_changes(
      'conversation:' || coalesce(NEW.conversation_id, OLD.conversation_id) ::text, -- topic - the topic to which we're broadcasting
      TG_OP,                                             -- event - the event that triggered the function
      TG_OP,                                             -- operation - the operation that triggered the function
      TG_TABLE_NAME,                                     -- table - the table that caused the trigger
      TG_TABLE_SCHEMA,                                   -- schema - the schema of the table that caused the trigger
      NEW,                                               -- new record - the record after the change
      OLD                                                -- old record - the record before the change
    );
    return null;
end;$function$
;

CREATE TRIGGER broadcast_changes_for_messages_trigger AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.broadcast_new_msg();


  create policy "Authenticated users can receive broadcasts"
  on "realtime"."messages"
  as permissive
  for select
  to authenticated
using (true);



