set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.broadcast_new_conversation()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
    perform realtime.broadcast_changes(
      'user:' || coalesce(NEW.user_one, OLD.user_one) ::text,
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );

    perform realtime.broadcast_changes(
      'user:' || coalesce(NEW.user_two, OLD.user_two) ::text,
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );

    return null;
end;$function$
;

CREATE TRIGGER broadcast_changes_for_messages_trigger AFTER INSERT ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.broadcast_new_conversation();


